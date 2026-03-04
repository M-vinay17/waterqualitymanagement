"""
USGS Water Resources Service
==============================
Base URL : https://waterservices.usgs.gov/nwis/
Auth     : NONE — completely free, no API key required
Docs     : https://waterservices.usgs.gov/rest/
"""

import httpx
from datetime import datetime, timedelta
from typing import Optional

BASE_URL = "https://waterservices.usgs.gov/nwis"

# ── USGS Parameter Codes → our system ────────────────────────────────────────
USGS_PARAM_CODES = {
    "00400": "pH",
    "63680": "turbidity",
    "00300": "DO",
    "01051": "lead",
    "01002": "arsenic",
    "01046": "iron",
    "00618": "nitrate",
    "00010": "temperature",
    "70300": "tds",
    "00950": "fluoride",
    "01056": "manganese",
    "50060": "chlorine",
    "00900": "hardness",
    "31616": "coliform",
    "31648": "ecoli",
}

OUR_TO_USGS = {v: k for k, v in USGS_PARAM_CODES.items()}

# ── Site type map ─────────────────────────────────────────────────────────────
USGS_SITE_TYPES = {
    "river":       "ST",       # Stream
    "lake":        "LK",       # Lake
    "groundwater": "GW",       # Groundwater
    "spring":      "SP",       # Spring
    "well":        "GW",
}


# ── Fetch Stations ─────────────────────────────────────────────────────────────

async def get_usgs_stations(
    state_code: Optional[str] = None,    # 2-letter e.g. "NY", "CA"
    county_code: Optional[str] = None,   # e.g. "36061" (FIPS)
    bbox: Optional[str] = None,          # "minLng,minLat,maxLng,maxLat"
    site_type: str = "ST",               # ST=stream, LK=lake, GW=groundwater
    limit: int = 50
) -> list[dict]:
    """
    Fetch USGS water monitoring sites (gauges, wells, streams).
    Returns a list of station dicts ready to insert into water_stations table.
    """
    params = {
        "format":        "rdb",
        "siteType":      site_type,
        "siteStatus":    "active",
        "hasDataTypeCd": "iv,dv",   # instantaneous or daily values
    }
    if state_code:
        params["stateCd"] = state_code
    if county_code:
        params["countyCd"] = county_code
    if bbox:
        params["bBox"] = bbox

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{BASE_URL}/site/", params=params)
        resp.raise_for_status()
        lines = resp.text.splitlines()

    # RDB format: skip comment lines (#) and header/type rows
    header = None
    stations = []
    for line in lines:
        if line.startswith("#") or not line.strip():
            continue
        cols = line.split("\t")
        if header is None:
            header = cols
            continue
        if all(c.startswith("5") or c == "10s" or c == "15s" or c.startswith("1") for c in cols):
            continue  # skip format row
        if len(cols) < len(header):
            continue
        row = dict(zip(header, cols))
        try:
            lat = float(row.get("dec_lat_va", 0))
            lng = float(row.get("dec_long_va", 0))
        except (ValueError, TypeError):
            continue
        if not lat or not lng:
            continue

        site_type_raw = row.get("site_tp_cd", "ST")
        stype_map = {"ST": "river", "LK": "lake", "GW": "groundwater", "SP": "spring"}

        stations.append({
            "external_id":     row.get("site_no"),
            "name":            row.get("station_nm", "Unknown USGS Site"),
            "location":        f"{row.get('county_cd', '')}, {row.get('state_cd', '')}",
            "latitude":        lat,
            "longitude":       lng,
            "managed_by":      "USGS",
            "region":          row.get("state_cd"),
            "state":           row.get("state_cd"),
            "country":         "USA",
            "station_type":    stype_map.get(site_type_raw, "river"),
            "external_source": "usgs",
        })
        if len(stations) >= limit:
            break

    return stations


# ── Fetch Instantaneous Values ─────────────────────────────────────────────────

async def get_usgs_readings(
    site_id: str,                        # USGS site number e.g. "01646500"
    parameter: Optional[str] = None,     # e.g. "pH", "DO", "temperature"
    days_back: int = 7,
    limit: int = 100
) -> list[dict]:
    """
    Fetch instantaneous water quality readings from USGS for a site.
    Returns a list of reading dicts ready to insert into station_readings table.
    """
    period = f"P{days_back}D"
    param_codes = (
        [OUR_TO_USGS[parameter]]
        if parameter and parameter in OUR_TO_USGS
        else list(USGS_PARAM_CODES.keys())[:8]   # default: top 8 common params
    )

    params = {
        "format":        "json",
        "sites":         site_id,
        "parameterCd":   ",".join(param_codes),
        "period":        period,
        "siteStatus":    "active",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(f"{BASE_URL}/iv/", params=params)
        resp.raise_for_status()
        data = resp.json()

    readings = []
    time_series = data.get("value", {}).get("timeSeries", [])

    for ts in time_series:
        var_code = ts.get("variable", {}).get("variableCode", [{}])
        if not var_code:
            continue
        pcode = var_code[0].get("value", "")
        param_key = USGS_PARAM_CODES.get(pcode)
        if not param_key:
            continue

        unit = ts.get("variable", {}).get("unit", {}).get("unitCode", "")

        for obs in ts.get("values", [{}])[0].get("value", []):
            raw_val = obs.get("value")
            raw_dt  = obs.get("dateTime")
            if raw_val is None or raw_val == "-999999":
                continue
            try:
                value       = float(raw_val)
                recorded_at = datetime.fromisoformat(raw_dt.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                continue

            qual_codes = obs.get("qualifiers", [])
            quality    = "good" if "P" in qual_codes else "suspect"

            readings.append({
                "parameter":    param_key,
                "value":        value,
                "unit":         unit,
                "recorded_at":  recorded_at,
                "source":       "usgs",
                "quality_flag": quality,
            })
            if len(readings) >= limit:
                return readings

    return readings


# ── Fetch Daily Values (averages) ─────────────────────────────────────────────

async def get_usgs_daily_values(
    site_id: str,
    parameter: Optional[str] = None,
    start_date: Optional[str] = None,   # "YYYY-MM-DD"
    end_date: Optional[str] = None,
) -> list[dict]:
    """
    Fetch daily averaged readings from USGS — good for trend charts.
    """
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.utcnow().strftime("%Y-%m-%d")

    param_codes = (
        [OUR_TO_USGS[parameter]]
        if parameter and parameter in OUR_TO_USGS
        else list(USGS_PARAM_CODES.keys())[:6]
    )

    params = {
        "format":      "json",
        "sites":       site_id,
        "parameterCd": ",".join(param_codes),
        "startDT":     start_date,
        "endDT":       end_date,
        "statCd":      "mean",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(f"{BASE_URL}/dv/", params=params)
        resp.raise_for_status()
        data = resp.json()

    readings = []
    for ts in data.get("value", {}).get("timeSeries", []):
        var_code  = ts.get("variable", {}).get("variableCode", [{}])
        pcode     = var_code[0].get("value", "") if var_code else ""
        param_key = USGS_PARAM_CODES.get(pcode)
        if not param_key:
            continue
        unit = ts.get("variable", {}).get("unit", {}).get("unitCode", "")

        for obs in ts.get("values", [{}])[0].get("value", []):
            raw_val = obs.get("value")
            raw_dt  = obs.get("dateTime")
            if not raw_val or raw_val == "-999999":
                continue
            try:
                readings.append({
                    "parameter":    param_key,
                    "value":        float(raw_val),
                    "unit":         unit,
                    "recorded_at":  datetime.fromisoformat(raw_dt.replace("Z", "+00:00")),
                    "source":       "usgs",
                    "quality_flag": "good",
                })
            except (ValueError, TypeError):
                continue

    return readings


# ── Check API Status ───────────────────────────────────────────────────────────

async def check_usgs_status() -> dict:
    """Ping USGS API and return status."""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                f"{BASE_URL}/iv/",
                params={"format": "json", "sites": "01646500", "period": "PT1H"}
            )
        return {"api": "USGS Water Resources", "status": "online", "http_code": r.status_code}
    except Exception as e:
        return {"api": "USGS Water Resources", "status": "offline", "error": str(e)}