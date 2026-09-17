import requests


COLORADO_BOUNDS = (
    "-109.060253,36.992426,"
    "-102.041524,41.003444"
)


def geocode_place(place):
    query = f"{place}, Colorado, USA"

    response = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={
            "q": query,
            "format": "json",
            "limit": 1,
            "countrycodes": "us",
            "viewbox": COLORADO_BOUNDS,
            "bounded": 1,
        },
        headers={
            "User-Agent":
                "ColoradoCrashObservationApp/1.0"
        },
        timeout=10,
    )

    response.raise_for_status()

    results = response.json()

    if not results:
        return None

    result = results[0]

    return {
        "latitude": float(result["lat"]),
        "longitude": float(result["lon"]),
        "display_name": result["display_name"],
    }