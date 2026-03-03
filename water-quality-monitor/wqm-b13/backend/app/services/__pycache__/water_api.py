import httpx

BASE_URL = "https://www.waterqualitydata.us/wqx3/Result/search"

async def fetch_water_data(state_code: str, parameter: str):
    params = {
        "statecode": state_code,
        "characteristicName": parameter,
        "mimeType": "json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL, params=params)
        response.raise_for_status()
        return response.json()