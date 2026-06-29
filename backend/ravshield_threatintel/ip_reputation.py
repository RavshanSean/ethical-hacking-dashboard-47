import ipaddress
import requests


TRUSTED_PUBLIC_DNS = {
    "8.8.8.8": "Google Public DNS",
    "8.8.4.4": "Google Public DNS",
    "1.1.1.1": "Cloudflare DNS",
    "1.0.0.1": "Cloudflare DNS",
    "9.9.9.9": "Quad9 DNS",
}


SUSPICIOUS_HOSTING_KEYWORDS = [
    "hosting",
    "datacenter",
    "data center",
    "cloud",
    "vps",
    "server",
    "digitalocean",
    "ovh",
    "hetzner",
    "linode",
    "amazon",
    "aws",
    "google cloud",
    "azure",
]


def analyze_ip_reputation(ip: str):
    reasons = []
    risk_score = 0

    try:
        ip_obj = ipaddress.ip_address(ip)
    except ValueError:
        return {
            "ip": ip,
            "valid": False,
            "reputation": "INVALID",
            "risk_score": 100,
            "confidence": 100,
            "reasons": ["Invalid IP address format"],
        }

    if ip_obj.is_private:
        return {
            "ip": ip,
            "valid": True,
            "ip_type": "PRIVATE",
            "reputation": "INTERNAL",
            "risk_score": 0,
            "confidence": 100,
            "country": None,
            "city": None,
            "asn": None,
            "isp": None,
            "org": None,
            "is_private": True,
            "is_reserved": ip_obj.is_reserved,
            "is_loopback": ip_obj.is_loopback,
            "is_multicast": ip_obj.is_multicast,
            "is_hosting_provider": False,
            "is_known_public_dns": False,
            "known_malicious": False,
            "reasons": [
                "Private/internal IP address. Public reputation lookup is not available."
            ],
        }

    if ip_obj.is_loopback:
        return {
            "ip": ip,
            "valid": True,
            "ip_type": "LOOPBACK",
            "reputation": "LOCALHOST",
            "risk_score": 0,
            "confidence": 100,
            "country": None,
            "city": None,
            "asn": None,
            "isp": None,
            "org": None,
            "is_private": False,
            "is_reserved": ip_obj.is_reserved,
            "is_loopback": True,
            "is_multicast": ip_obj.is_multicast,
            "is_hosting_provider": False,
            "is_known_public_dns": False,
            "known_malicious": False,
            "reasons": ["Loopback address used by the local machine."],
        }

    if ip_obj.is_reserved or ip_obj.is_multicast:
        risk_score += 10
        reasons.append("Reserved or multicast IP range detected.")

    geo_data = {}

    try:
        response = requests.get(
            f"http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,isp,org,as,hosting,proxy,query",
            timeout=8,
        )

        geo_data = response.json()

        if geo_data.get("status") != "success":
            reasons.append(
                geo_data.get("message", "Public IP lookup failed.")
            )
    except Exception as error:
        reasons.append(f"Public IP lookup unavailable: {error}")

    isp = geo_data.get("isp")
    org = geo_data.get("org")
    asn = geo_data.get("as")

    combined_provider_text = f"{isp or ''} {org or ''} {asn or ''}".lower()

    is_hosting_provider = bool(geo_data.get("hosting")) or any(
        keyword in combined_provider_text
        for keyword in SUSPICIOUS_HOSTING_KEYWORDS
    )

    is_proxy = bool(geo_data.get("proxy"))

    is_known_public_dns = ip in TRUSTED_PUBLIC_DNS

    if is_known_public_dns:
        
        reasons.append(
            f"Known trusted public DNS provider: {TRUSTED_PUBLIC_DNS[ip]}."
        )
        risk_score = 2
    else:
        if is_hosting_provider:
            risk_score += 20
            reasons.append("IP appears to belong to a hosting/cloud provider.")

    if is_proxy:
        risk_score += 25
        reasons.append("IP appears to be associated with proxy/VPN behavior.")

    known_malicious = False

    if known_malicious:
        risk_score = 100
        reasons.insert(0, "IP matched known malicious intelligence.")

    risk_score = min(risk_score, 100)

    if risk_score >= 70:
        reputation = "HIGH_RISK"
    elif risk_score >= 30:
        reputation = "SUSPICIOUS"
    elif is_known_public_dns:
        reputation = "TRUSTED"
    else:
        reputation = "LOW_RISK"

    if not reasons:
        reasons.append("No obvious public IP reputation risks detected.")

    return {
        "ip": ip,
        "valid": True,
        "ip_type": "PUBLIC",
        "reputation": reputation,
        "risk_score": risk_score,
        "confidence": 70 if geo_data else 40,
        "country": geo_data.get("country"),
        "region": geo_data.get("regionName"),
        "city": geo_data.get("city"),
        "asn": asn,
        "isp": isp,
        "org": org,
        "is_private": False,
        "is_reserved": ip_obj.is_reserved,
        "is_loopback": ip_obj.is_loopback,
        "is_multicast": ip_obj.is_multicast,
        "is_hosting_provider": is_hosting_provider,
        "is_proxy_or_vpn": is_proxy,
        "is_known_public_dns": is_known_public_dns,
        "known_malicious": known_malicious,
        "reasons": reasons,
    }