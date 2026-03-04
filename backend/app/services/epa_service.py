import httpx

EPA_BASE_URL = "https://www.waterqualitydata.us/data/Station/search"

async def fetch_epa_data(state: str, parameter: str):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                EPA_BASE_URL,
                params={
                    "statecode": state,
                    "characteristicName": parameter,
                    "mimeType": "json"
                },
                headers={
                    "User-Agent": "Mozilla/5.0"
                }
            )

            response.raise_for_status()
            return response.json()

    except httpx.ReadTimeout:
        return {"error": "EPA server timeout"}
    except Exception as e:
        return {"error": str(e)}