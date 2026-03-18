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
    "nitrite":        "mg/l",
    "total_coliform": "MPN/100ml",
    "fecal_coliform": "MPN/100ml",
    "turbidity":      "NTU",
    "arsenic":        "mg/l",
    "fluoride":       "mg/l",
    "temperature":    "°C",
    "tds":            "mg/l",
    "cod":            "mg/l",
    "ammonia":        "mg/l",
    "phosphate":      "mg/l",
    "hardness":       "mg/l",
    "alkalinity":     "mg/l",
    "chloride":       "mg/l",
    "sulphate":       "mg/l",
    "iron":           "mg/l",
    "manganese":      "mg/l",
    "zinc":           "mg/l",
    "copper":         "mg/l",
    "lead":           "mg/l",
    "chromium":       "mg/l",
    "cadmium":        "mg/l",
    "mercury":        "mg/l",
    "nickel":         "mg/l",
    "calcium":        "mg/l",
    "magnesium":      "mg/l",
    "sodium":         "mg/l",
    "potassium":      "mg/l",
    "silica":         "mg/l",
    "toc":            "mg/l",
    "do_saturation":  "%",
    "secchi_depth":   "cm",
}


# =========================================================
# GET STATIONS  (state filter)
# =========================================================

async def get_india_stations(
    state: str = "Andhra Pradesh",
    limit: int = 100
) -> list[dict]:
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
            "name":            name,
            "location":        _location(record, state),
            "latitude":        _float(record.get("Latitude")) or 0.0,
            "longitude":       _float(record.get("Longitude")) or 0.0,
            "managed_by":      record.get("Agency_name") or "CPCB India",
            "external_id":     _make_ext_id(name, state),
            "external_source": "india_gov",
            "state":           record.get("State")    or state,
            "district":        record.get("District") or "",
            "river":           record.get("Basin")    or record.get("Sub_Basin") or "",
        })

    return stations


# =========================================================
# GET READINGS  (state filter)
# =========================================================

async def get_india_readings(
    state: str = "Andhra Pradesh",
    limit: int = 100
) -> list[dict]:
    raw = await _fetch_raw(state=state, limit=limit)
    if not raw:
        return []

    readings = []

    for record in raw.get("records", []):
        name = _station_name(record)

        parameters = {
            "ph": {
                "value": _float(record.get("ph_fld") or record.get("ph_gen") or record.get("ph")),
                "unit": PARAM_UNITS["ph"],
            },
            "do": {
                "value": _float(record.get("_do") or record.get("d_o") or record.get("d_o_")),
                "unit": PARAM_UNITS["do"],
            },
            "bod": {
                "value": _float(record.get("bod3_27") or record.get("bod")),
                "unit": PARAM_UNITS["bod"],
            },
            "total_coliform": {
                "value": _float(record.get("tcol_mpn")),
                "unit": PARAM_UNITS["total_coliform"],
            },
            "fecal_coliform": {
                "value": _float(record.get("fcol_mpn")),
                "unit": PARAM_UNITS["fecal_coliform"],
            },
            "conductivity": {
                "value": _float(record.get("ec_fld") or record.get("ec_gen")),
                "unit": PARAM_UNITS["conductivity"],
            },
            "nitrate": {
                "value": _float(record.get("no3_n") or record.get("no2_no3")),
                "unit": PARAM_UNITS["nitrate"],
            },
            "nitrite": {
                "value": _float(record.get("no2_n") or record.get("no2__n")),
                "unit": PARAM_UNITS["nitrite"],
            },
            "turbidity": {
                "value": _float(record.get("turb")),
                "unit": PARAM_UNITS["turbidity"],
            },
            "arsenic": {
                "value": _float(record.get("_as")),
                "unit": PARAM_UNITS["arsenic"],
            },
            "fluoride": {
                "value": _float(record.get("f")),
                "unit": PARAM_UNITS["fluoride"],
            },
            "temperature": {
                "value": _float(record.get("temp")),
                "unit": PARAM_UNITS["temperature"],
            },
            "tds": {
                "value": _float(record.get("tds")),
                "unit": PARAM_UNITS["tds"],
            },
            "cod": {
                "value": _float(record.get("cod")),
                "unit": PARAM_UNITS["cod"],
            },
            "ammonia": {
                "value": _float(record.get("nh3_n")),
                "unit": PARAM_UNITS["ammonia"],
            },
            "phosphate": {
                "value": _float(record.get("o_po4_p")),
                "unit": PARAM_UNITS["phosphate"],
            },
            "hardness": {
                "value": _float(record.get("har_total")),
                "unit": PARAM_UNITS["hardness"],
            },
            "alkalinity": {
                "value": _float(record.get("alk_tot")),
                "unit": PARAM_UNITS["alkalinity"],
            },
            "chloride": {
                "value": _float(record.get("cl")),
                "unit": PARAM_UNITS["chloride"],
            },
            "sulphate": {
                "value": _float(record.get("so4")),
                "unit": PARAM_UNITS["sulphate"],
            },
            "iron": {
                "value": _float(record.get("fe")),
                "unit": PARAM_UNITS["iron"],
            },
            "manganese": {
                "value": _float(record.get("mn")),
                "unit": PARAM_UNITS["manganese"],
            },
            "zinc": {
                "value": _float(record.get("zn")),
                "unit": PARAM_UNITS["zinc"],
            },
            "copper": {
                "value": _float(record.get("cu")),
                "unit": PARAM_UNITS["copper"],
            },
            "lead": {
                "value": _float(record.get("pb")),
                "unit": PARAM_UNITS["lead"],
            },
            "chromium": {
                "value": _float(record.get("cr")),
                "unit": PARAM_UNITS["chromium"],
            },
            "cadmium": {
                "value": _float(record.get("cd")),
                "unit": PARAM_UNITS["cadmium"],
            },
            "mercury": {
                "value": _float(record.get("hg")),
                "unit": PARAM_UNITS["mercury"],
            },
            "nickel": {
                "value": _float(record.get("ni")),
                "unit": PARAM_UNITS["nickel"],
            },
            "calcium": {
                "value": _float(record.get("ca")),
                "unit": PARAM_UNITS["calcium"],
            },
            "magnesium": {
                "value": _float(record.get("mg")),
                "unit": PARAM_UNITS["magnesium"],
            },
            "sodium": {
                "value": _float(record.get("na")),
                "unit": PARAM_UNITS["sodium"],
            },
            "potassium": {
                "value": _float(record.get("k")),
                "unit": PARAM_UNITS["potassium"],
            },
            "silica": {
                "value": _float(record.get("sio2")),
                "unit": PARAM_UNITS["silica"],
            },
            "toc": {
                "value": _float(record.get("toc")),
                "unit": PARAM_UNITS["toc"],
            },
            "do_saturation": {
                "value": _float(record.get("do_sat_")),
                "unit": PARAM_UNITS["do_saturation"],
            },
            "secchi_depth": {
                "value": _float(record.get("secchi")),
                "unit": PARAM_UNITS["secchi_depth"],
            },
        }

        year = record.get("Year") or record.get("year")
        try:
            recorded_at = datetime(int(year), 1, 1) if year else datetime.utcnow()
        except (ValueError, TypeError):
            recorded_at = datetime.utcnow()

        readings.append({
            "name":            name,
            "location":        _location(record, state),
            "latitude":        _float(record.get("Latitude"))  or 0.0,
            "longitude":       _float(record.get("Longitude")) or 0.0,
            "managed_by":      record.get("Agency_name") or "CPCB India",
            "external_id":     _make_ext_id(name, state),
            "external_source": "india_gov",
            "state":           record.get("State")    or state,
            "district":        record.get("District") or "",
            "river":           record.get("Basin")    or record.get("Sub_Basin") or "",
            "recorded_at":     recorded_at,
            "parameters":      parameters,
        })

    return readings


# =========================================================
# STATUS CHECK
# =========================================================

async def check_india_gov_status() -> dict:
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
    limit: int  = 100,
    offset: int = 0,
) -> dict | None:
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
    basin    = record.get("Basin")    or ""
    district = record.get("District") or ""
    return f"{basin} - {district} - {state}".strip(" -") or state


def _make_ext_id(name: str, state: str) -> str:
    return f"india_gov_{state}_{name}".lower().replace(" ", "_")


def _float(value) -> float | None:
    try:
        if value in (None, "", "NA", "N/A", "-", "--", "NaN", "na", "n/a"):
            return None
        return float(str(value).strip())
    except (ValueError, TypeError):
        return None