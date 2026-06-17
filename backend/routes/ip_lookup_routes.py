from fastapi import APIRouter
import requests

router = APIRouter()

@router.get("/ip-lookup/{ip}")
def ip_lookup(ip: str):
    try:
        response = requests.get(
            f"http://ip-api.com/json/{ip}",
            timeout=5,
        )

        data = response.json()

        return {
            "ip": ip,
            "country": data.get("country"),
            "region": data.get("regionName"),
            "city": data.get("city"),
            "isp": data.get("isp"),
            "org": data.get("org"),
            "asn": data.get("as"),
            "lat": data.get("lat"),
            "lon": data.get("lon"),
        }

    except Exception as e:
        return {
            "error": str(e)
        }