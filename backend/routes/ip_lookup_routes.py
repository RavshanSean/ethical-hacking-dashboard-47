from fastapi import APIRouter
import requests

from utils.ssrf import validate_public_ip

router = APIRouter()


@router.get("/ip-lookup/{ip}")
def ip_lookup(ip: str):
    safe_ip = validate_public_ip(ip)

    try:
        # Prefer HTTPS enrichment when available.
        response = requests.get(
            f"https://ipapi.co/{safe_ip}/json/",
            timeout=5,
            headers={"User-Agent": "EHD47-SecurityDashboard/1.0"},
        )

        data = response.json()

        if data.get("error"):
            raise RuntimeError(data.get("reason") or "lookup failed")

        return {
            "ip": safe_ip,
            "country": data.get("country_name") or data.get("country"),
            "region": data.get("region"),
            "city": data.get("city"),
            "isp": data.get("org"),
            "org": data.get("org"),
            "asn": data.get("asn"),
            "lat": data.get("latitude"),
            "lon": data.get("longitude"),
        }

    except Exception as e:
        return {
            "error": str(e)
        }
