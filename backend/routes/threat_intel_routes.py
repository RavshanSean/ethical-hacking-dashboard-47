from fastapi import APIRouter

from ravshield_threatintel.ip_reputation import analyze_ip_reputation
from ravshield_threatintel.domain_reputation import analyze_domain_reputation

router = APIRouter(prefix="/threat-intel", tags=["RavShield ThreatIntel"])


@router.get("/ip/{ip}")
def check_ip_reputation(ip: str):
    return analyze_ip_reputation(ip)


@router.get("/domain/{domain}")
def check_domain_reputation(domain: str):
    return analyze_domain_reputation(domain)