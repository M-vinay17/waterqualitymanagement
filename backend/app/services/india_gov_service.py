# app/services/india_gov_service.py
# Dataset : Agency-wise Surface Water Quality (CPCB)
# Source  : https://data.gov.in
# Resource: 19697d76-442e-4d76-aeae-13f8a17c91e1

import httpx
from datetime import datetime
from app.core.config import settings

BASE_URL    = "https://api.data.gov.in/resource"
RESOURCE_ID = "19697d76-442e-4d76-aeae-13f8a17c91e1"

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
# GET STATIONS  (state + district filter)
# =========================================================

async def get_india_stations(
    state: str    = "Andhra Pradesh",
    district: str = "Kadapa",          # ← your district!
    limit: int    = 30
) -> list[dict]:
    """
    Returns unique station list filtered by state AND district.
    Default: Andhra Pradesh → Kadapa
    """
    raw = await _fetch_raw(state=state, district=district, limit=limit)

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
            "name":            name,
            "location":        _location(record, state, district),
            "latitude":        _float(record.get("Latitude") or record.get("Lat")) or 0.0,
            "longitude":       _float(record.get("Longitude") or record.get("Long")) or 0.0,
            "managed_by":      record.get("Agency") or "CPCB India",
            "external_id":     _make_ext_id(name, state, district),
            "external_source": "india_gov",
            # extra info
            "state":           record.get("State")    or state,
            "district":        record.get("District") or district,
            "river":           record.get("River")    or record.get("Water_Body"),
        })

    return stations


# =========================================================
# GET READINGS  (state + district filter)
# =========================================================

async def get_india_readings(
    state: str    = "Andhra Pradesh",
    district: str = "Kadapa",          # ← your district!
    limit: int    = 100
) -> list[dict]:
    """
    Returns readings filtered by state AND district.
    Default: Andhra Pradesh → Kadapa
    """
    raw = await _fetch_raw(state=state, district=district, limit=limit)

    if not raw:
        return []

    readings = []

    for record in raw.get("records", []):

        name = _station_name(record)

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

        year = record.get("Year") or record.get("year")
        try:
            recorded_at = datetime(int(year), 1, 1) if year else datetime.utcnow()
        except (ValueError, TypeError):
            recorded_at = datetime.utcnow()

        readings.append({
            # station info
            "name":            name,
            "location":        _location(record, state, district),
            "latitude":        _float(record.get("Latitude")  or record.get("Lat"))  or 0.0,
            "longitude":       _float(record.get("Longitude") or record.get("Long")) or 0.0,
            "managed_by":      record.get("Agency") or "CPCB India",
            "external_id":     _make_ext_id(name, state, district),
            "external_source": "india_gov",
            "state":           record.get("State")    or state,
            "district":        record.get("District") or district,
            "river":           record.get("River")    or record.get("Water_Body"),
            # reading info
            "recorded_at":     recorded_at,
            "parameters":      parameters,
        })

    return readings


# =========================================================
# STATUS CHECK
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

async def _fetch_raw(
    state: str,
    district: str = None,
    limit: int    = 100,
    offset: int   = 0,
) -> dict | None:
    """
    Calls data.gov.in API with state + district filters.
    district is optional — if None, fetches entire state.
    """
    url    = f"{BASE_URL}/{RESOURCE_ID}"
    params = {
        "api-key":        settings.INDIA_GOV_API_KEY,
        "format":         "json",
        "offset":         offset,
        "limit":          limit,
        "filters[State]": state,
    }

    # Add district filter only if provided
    if district:
        params["filters[District]"] = district

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


def _location(record: dict, state: str, district: str) -> str:
    river    = record.get("River") or record.get("Water_Body") or ""
    district = record.get("District") or district or ""
    return f"{river} - {district} - {state}".strip(" -") or state


def _make_ext_id(name: str, state: str, district: str) -> str:
    return f"india_gov_{state}_{district}_{name}".lower().replace(" ", "_")


def _float(value) -> float | None:
    try:
        if value in (None, "", "NA", "N/A", "-", "--", "NaN"):
            return None
        return float(str(value).strip())
    except (ValueError, TypeError):
        return None