"""
WHO Global Health Observatory (GHO) Service
=============================================
Base URL : https://ghoapi.azureedge.net/api
Auth     : NONE — completely free, no API key required
Docs     : https://www.who.int/data/gho/info/gho-odata-api
"""

import httpx
from typing import Optional

BASE_URL = "https://ghoapi.azureedge.net/api"

# ── Useful WHO water-related indicator codes ──────────────────────────────────
WHO_INDICATORS = {
    "safely_managed_water":        "WSH_WATER_SAFELY_MANAGED",
    "safely_managed_sanitation":   "WSH_SANITATION_SAFELY_MANAGED",
    "basic_water_access":          "WSH_WATER_BASIC",
    "arsenic_exposure":            "WSH_10",
    "fluoride_exposure":           "WSH_11",
    "open_defecation":             "WSH_SANITATION_OD",
    "handwashing_facility":        "WSH_HYGIENE_BASIC",
    "water_borne_diseases":        "MORT_100000",
}


# ── Fetch Water Access Stats for a Country ────────────────────────────────────

async def get_who_country_stats(country_code: str = "IND") -> dict:
    """
    Get WHO water safety/access statistics for a country.

    country_code: ISO3 code
        India       → IND
        USA         → USA
        Bangladesh  → BGD
        Pakistan    → PAK
        Nigeria     → NGA
        Brazil      → BRA

    Returns a clean summary dict with latest values per indicator.
    """
    results = {}

    async with httpx.AsyncClient(timeout=20) as client:
        for key, indicator_code in WHO_INDICATORS.items():
            try:
                resp = await client.get(
                    f"{BASE_URL}/{indicator_code}",
                    params={
                        "$filter":  f"SpatialDim eq '{country_code}'",
                        "$orderby": "TimeDim desc",
                        "$top":     "1",
                    }
                )
                if resp.status_code == 200:
                    records = resp.json().get("value", [])
                    if records:
                        r = records[0]
                        results[key] = {
                            "value": r.get("NumericValue"),
                            "low":   r.get("Low"),
                            "high":  r.get("High"),
                            "year":  r.get("TimeDim"),
                            "unit":  "%",
                        }
            except Exception:
                continue

    return {
        "country":    country_code,
        "source":     "WHO GHO API",
        "indicators": results,
    }


# ── Fetch Global Data for One Indicator ──────────────────────────────────────

async def get_who_global_indicator(
    indicator_code: str = "WSH_WATER_SAFELY_MANAGED",
    year: Optional[int] = None,
    limit: int = 200
) -> list[dict]:
    """
    Fetch a WHO indicator across all countries.
    Useful for global comparison maps.
    """
    filters = []
    if year:
        filters.append(f"TimeDim eq {year}")

    params: dict = {"$top": str(limit), "$orderby": "TimeDim desc"}
    if filters:
        params["$filter"] = " and ".join(filters)

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{BASE_URL}/{indicator_code}", params=params)
        resp.raise_for_status()
        data = resp.json()

    return [
        {
            "country":   r.get("SpatialDim"),
            "year":      r.get("TimeDim"),
            "value":     r.get("NumericValue"),
            "low":       r.get("Low"),
            "high":      r.get("High"),
            "indicator": indicator_code,
            "source":    "who",
        }
        for r in data.get("value", [])
        if r.get("NumericValue") is not None
    ]


# ── List All WHO Water Indicators ────────────────────────────────────────────

async def list_who_water_indicators() -> list[dict]:
    """
    Search the WHO GHO catalogue for water/sanitation indicators.
    """
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{BASE_URL}/Indicator",
            params={
                "$filter": "contains(IndicatorName,'Water') "
                           "or contains(IndicatorName,'Sanitation') "
                           "or contains(IndicatorName,'Drinking')"
            }
        )
        resp.raise_for_status()
        data = resp.json()

    return [
        {"code": r.get("IndicatorCode"), "name": r.get("IndicatorName")}
        for r in data.get("value", [])
    ]


# ── Check API Status ──────────────────────────────────────────────────────────

async def check_who_status() -> dict:
    """Ping WHO GHO API and return status."""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(f"{BASE_URL}/Indicator?$top=1")
        return {"api": "WHO GHO API", "status": "online", "http_code": r.status_code}
    except Exception as e:
        return {"api": "WHO GHO API", "status": "offline", "error": str(e)}