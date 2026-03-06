# app/services/india_gov_service.py
# Dataset : Agency-wise Surface Water Quality (CPCB)
# Source  : https://data.gov.in
# Resource: 19697d76-442e-4d76-aeae-13f8a17c91e1

import httpx
from datetime import datetime
from app.core.config import settings

BASE_URL    = "https://api.data.gov.in/resource"
RESOURCE_ID = "19697d76-442e-4d76-aeae-13f8a17c91e1"

# Maps parameter name → unit string (matches your unit column)
PARAM_UNITS = {
    "ph":             "",
    "do":             "mg/l",
    "bod":            "mg/l",
    "conductivity":   "µS/cm",
    "nitrate":        "mg/l",
    "total_coliform": "MPN/100ml",
    "turbidity":      "NTU",
    "arsenic":        "mg/l",
    "fluoride":       "mg/l",
}


# =========================================================
# GET STATIONS
# Same return pattern as get_epa_stations / get_usgs_stations
# =========================================================

async def get_india_stations(
    state: str = "Andhra Pradesh",
    limit: int = 30
) -> list[dict]:
    """
    Returns unique station list for the given state.

    Each dict maps directly to WaterStation model:
        name, location, latitude, longitude,
        managed_by, external_id, external_source
    """
    raw = await _fetch_raw(state=state, limit=limit)

    if not raw:
        return []

    seen     = set()
    stations = []

    for record in raw.get("records", []):

        name = _station_name(record)

        if name in seen:
            continue
        seen.add(name)

        stations.append({
            # --- Maps exactly to WaterStation columns ---
            "name":            name,
            "location":        _location(record, state),
            "latitude":        _float(record.get("Latitude") or record.get("Lat")) or 0.0,
            "longitude":       _float(record.get("Longitude") or record.get("Long")) or 0.0,
            "managed_by":      record.get("Agency") or "CPCB India",
            "external_id":     _make_ext_id(name, state),
            "external_source": "india_gov",
        })

    return stations


# =========================================================
# GET READINGS
# Same return pattern as get_epa_readings / get_usgs_readings
# =========================================================

async def get_india_readings(
    state: str = "Andhra Pradesh",
    limit: int = 100
) -> list[dict]:
    """
    Returns readings from data.gov.in.

    Each dict contains station info + parameters dict.
    routes/water.py loops parameters to create one
    StationReading row per parameter — matching your
    exact  parameter / value / unit / source columns.
    """
    raw = await _fetch_raw(state=state, limit=limit)

    if not raw:
        return []

    readings = []

    for record in raw.get("records", []):

        name = _station_name(record)

        # Each key in parameters → one StationReading row:
        #   parameter = key   (e.g. "ph")
        #   value     = float
        #   unit      = unit string
        #   source    = "india_gov"
        parameters = {
            "ph": {
                "value": _float(record.get("pH") or record.get("ph")),
                "unit":  PARAM_UNITS["ph"],
            },
            "do": {
                "value": _float(
                    record.get("D.O._(mg/l)") or
                    record.get("D.O") or
                    record.get("DO") or
                    record.get("Dissolved_Oxygen")
                ),
                "unit": PARAM_UNITS["do"],
            },
            "bod": {
                "value": _float(
                    record.get("B.O.D_(mg/l)") or
                    record.get("BOD") or
                    record.get("Biochemical_Oxygen_Demand")
                ),
                "unit": PARAM_UNITS["bod"],
            },
            "total_coliform": {
                "value": _float(
                    record.get("Total_Coliform_(MPN/100ml)") or
                    record.get("Total_Coliform") or
                    record.get("Coliform")
                ),
                "unit": PARAM_UNITS["total_coliform"],
            },
            "conductivity": {
                "value": _float(
                    record.get("Conductivity") or
                    record.get("Specific_Conductance")
                ),
                "unit": PARAM_UNITS["conductivity"],
            },
            "nitrate": {
                "value": _float(record.get("Nitrate") or record.get("NO3")),
                "unit":  PARAM_UNITS["nitrate"],
            },
            "turbidity": {
                "value": _float(record.get("Turbidity")),
                "unit":  PARAM_UNITS["turbidity"],
            },
            "arsenic": {
                "value": _float(record.get("Arsenic") or record.get("As")),
                "unit":  PARAM_UNITS["arsenic"],
            },
            "fluoride": {
                "value": _float(record.get("Fluoride") or record.get("F")),
                "unit":  PARAM_UNITS["fluoride"],
            },
        }

        # CPCB data has a Year field e.g. "2018"
        year = record.get("Year") or record.get("year")
        try:
            recorded_at = datetime(int(year), 1, 1) if year else datetime.utcnow()
        except (ValueError, TypeError):
            recorded_at = datetime.utcnow()

        readings.append({
            # station info — used to upsert WaterStation
            "name":            name,
            "location":        _location(record, state),
            "latitude":        _float(record.get("Latitude")  or record.get("Lat"))  or 0.0,
            "longitude":       _float(record.get("Longitude") or record.get("Long")) or 0.0,
            "managed_by":      record.get("Agency") or "CPCB India",
            "external_id":     _make_ext_id(name, state),
            "external_source": "india_gov",
            # reading info
            "recorded_at":     recorded_at,
            "parameters":      parameters,
        })

    return readings


# =========================================================
# STATUS CHECK — same pattern as check_epa_status()
# =========================================================

async def check_india_gov_status() -> dict:
    """Ping data.gov.in to check if API is online."""
    url    = f"{BASE_URL}/{RESOURCE_ID}"
    params = {
        "api-key": settings.INDIA_GOV_API_KEY,
        "format":  "json",
        "limit":   1,
        "offset":  0,
    }
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return {"name": "India Gov (data.gov.in)", "status": "online",  "code": r.status_code}
        except httpx.HTTPStatusError as e:
            return {"name": "India Gov (data.gov.in)", "status": "error",   "code": e.response.status_code}
        except httpx.HTTPError:
            return {"name": "India Gov (data.gov.in)", "status": "offline", "code": None}


# =========================================================
# PRIVATE HELPERS
# =========================================================

async def _fetch_raw(state: str, limit: int = 100, offset: int = 0) -> dict | None:
    url    = f"{BASE_URL}/{RESOURCE_ID}"
    params = {
        "api-key":        settings.INDIA_GOV_API_KEY,
        "format":         "json",
        "offset":         offset,
        "limit":          limit,
        "filters[State]": state,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            print(f"[INDIA GOV] HTTP {e.response.status_code}: {e.response.text}")
            return None
        except httpx.HTTPError as e:
            print(f"[INDIA GOV] Connection error: {e}")
            return None


def _station_name(record: dict) -> str:
    return (
        record.get("Station_Name") or
        record.get("Monitoring_Location") or
        record.get("Location") or
        "Unknown"
    )


def _location(record: dict, state: str) -> str:
    river = record.get("River") or record.get("Water_Body") or ""
    return f"{river} - {state}".strip(" -") or state


def _make_ext_id(name: str, state: str) -> str:
    return f"india_gov_{state}_{name}".lower().replace(" ", "_")


def _float(value) -> float | None:
    try:
        if value in (None, "", "NA", "N/A", "-", "--", "NaN"):
            return None
        return float(str(value).strip())
    except (ValueError, TypeError):
        return None