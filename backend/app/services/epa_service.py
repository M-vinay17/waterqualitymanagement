"""
EPA Water Quality Portal Service
--------------------------------
Public API (No API key required)
"""

import httpx
from datetime import datetime
from typing import Optional, List, Dict

# EPA endpoints
STATION_URL = "https://www.waterqualitydata.us/data/Station/search"
RESULT_URL  = "https://www.waterqualitydata.us/data/Result/search"

EPA_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "WaterQualityMonitor/1.0"
}

EPA_CHARACTERISTIC = {
    "pH": "pH",
    "turbidity": "Turbidity",
    "DO": "Dissolved oxygen (DO)",
    "lead": "Lead",
    "arsenic": "Arsenic",
    "iron": "Iron",
    "nitrate": "Nitrate",
    "temperature": "Temperature, water",
}

EPA_CHARACTERISTIC_REVERSE = {v.lower(): k for k, v in EPA_CHARACTERISTIC.items()}


# ---------------------------------------------------------
# Fetch EPA Stations
# ---------------------------------------------------------

async def get_epa_stations(
    state_code: Optional[str] = None,
    bbox: Optional[str] = None,
    site_type: str = "Stream",
    limit: int = 50
) -> List[Dict]:

    params = {
        "mimeType": "geojson",
        "siteType": site_type,
        "pagesize": str(limit),
        "zip": "no"
    }

    if state_code:
        params["statecode"] = state_code

    if bbox:
        params["bBox"] = bbox

    async with httpx.AsyncClient(timeout=20) as client:

        response = await client.get(
            STATION_URL,
            params=params,
            headers=EPA_HEADERS
        )

    response.raise_for_status()

    data = response.json()

    stations = []

    for feature in data.get("features", []):

        props = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates")

        if not coords or len(coords) < 2:
            continue

        stations.append({
            "external_id": props.get("MonitoringLocationIdentifier"),
            "name": props.get("MonitoringLocationName", "Unknown"),
            "latitude": coords[1],
            "longitude": coords[0],
            "location": f"{props.get('CountyName','')}, {props.get('StateName','')}",
            "state": props.get("StateName"),
            "country": "USA",
            "managed_by": props.get("OrganizationFormalName", "US EPA"),
            "station_type": props.get("MonitoringLocationTypeName", "river"),
            "external_source": "epa"
        })

    return stations


# ---------------------------------------------------------
# Fetch EPA Readings
# ---------------------------------------------------------

async def get_epa_readings(
    site_id: str,
    parameter: Optional[str] = None,
    limit: int = 100
) -> List[Dict]:

    org = site_id.split("-")[0]

    params = {
        "organization": org,
        "siteid": site_id,
        "mimeType": "geojson",
        "pagesize": str(limit),
        "zip": "no",
        "startDateLo": "2020-01-01"
    }

    if parameter and parameter in EPA_CHARACTERISTIC:
        params["characteristicName"] = EPA_CHARACTERISTIC[parameter]

    async with httpx.AsyncClient(timeout=25) as client:

        response = await client.get(
            RESULT_URL,
            params=params,
            headers=EPA_HEADERS
        )

    if response.status_code != 200:
        return []

    data = response.json()

    readings = []

    for feature in data.get("features", []):

        props = feature.get("properties", {})

        char = props.get("CharacteristicName", "").lower()
        param = EPA_CHARACTERISTIC_REVERSE.get(char)

        if not param:
            continue

        value = props.get("ResultMeasureValue")
        date = props.get("ActivityStartDate")

        if not value or not date:
            continue

        try:
            value = float(value)
            recorded_at = datetime.fromisoformat(date)
        except:
            continue

        readings.append({
            "parameter": param,
            "value": value,
            "unit": props.get("ResultMeasure/MeasureUnitCode", ""),
            "recorded_at": recorded_at,
            "source": "epa",
            "quality_flag": props.get("ResultStatusIdentifier", "good")
        })

    return readings


# ---------------------------------------------------------
# EPA API Health Check
# ---------------------------------------------------------

async def check_epa_status() -> Dict:

    try:

        async with httpx.AsyncClient(timeout=10) as client:

            response = await client.get(
                STATION_URL,
                params={
                    "statecode": "US:06",
                    "mimeType": "geojson",
                    "pagesize": "1",
                    "zip": "no"
                },
                headers=EPA_HEADERS
            )

        return {
            "api": "US EPA Water Quality Portal",
            "status": "online",
            "http_code": response.status_code
        }

    except Exception as e:

        return {
            "api": "US EPA Water Quality Portal",
            "status": "offline",
            "error": str(e)
        }