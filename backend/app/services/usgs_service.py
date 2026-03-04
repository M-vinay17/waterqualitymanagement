import requests

def get_water_data():
    url = "https://waterservices.usgs.gov/nwis/iv/"
    
    params = {
        "format": "json",
        "sites": "01646500",
        "parameterCd": "00010"
    }

    response = requests.get(url, params=params)
    data = response.json()

    try:
        time_series = data["value"]["timeSeries"][0]
        site_name = time_series["sourceInfo"]["siteName"]
        value = time_series["values"][0]["value"][0]["value"]
        date_time = time_series["values"][0]["value"][0]["dateTime"]

        return {
            "site": site_name,
            "temperature": value,
            "dateTime": date_time
        }

    except Exception:
        return {"error": "Data not available"}