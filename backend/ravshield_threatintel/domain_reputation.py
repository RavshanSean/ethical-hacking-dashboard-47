import re
import socket
import whois
from datetime import datetime, timezone


SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "wallet",
    "bank",
    "paypal",
    "crypto",
    "password",
    "support",
]

SUSPICIOUS_TLDS = [
    "xyz",
    "top",
    "click",
    "link",
    "work",
    "country",
    "gq",
    "tk",
    "ml",
    "cf",
]

LOCAL_DOMAIN_BLACKLIST = {
    "paypal-login-secure.xyz": {
        "category": "Phishing",
        "severity": "HIGH",
        "source": "Local RavShield blacklist",
        "description": "Known phishing-style test domain manually added for local detection.",
    },
}


def normalize_domain(domain: str):
    domain = domain.lower().strip()
    domain = domain.replace("https://", "")
    domain = domain.replace("http://", "")
    domain = domain.split("/")[0]
    domain = domain.split(":")[0]

    if domain.startswith("www."):
        domain = domain[4:]

    return domain


def is_valid_domain(domain: str):
    pattern = r"^(?!-)[a-zA-Z0-9.-]{1,253}(?<!-)\.[a-zA-Z]{2,}$"
    return re.match(pattern, domain) is not None


def get_whois_intelligence(domain: str):
    try:
        info = whois.whois(domain)

        creation_date = info.creation_date
        expiration_date = info.expiration_date
        registrar = info.registrar
        name_servers = info.name_servers

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        domain_age_days = None
        expires_in_days = None

        if creation_date:
            if creation_date.tzinfo is None:
                creation_date = creation_date.replace(tzinfo=timezone.utc)

            domain_age_days = (
                datetime.now(timezone.utc) - creation_date
            ).days

        if expiration_date:
            if expiration_date.tzinfo is None:
                expiration_date = expiration_date.replace(tzinfo=timezone.utc)

            expires_in_days = (
                expiration_date - datetime.now(timezone.utc)
            ).days

        return {
            "available": True,
            "registrar": str(registrar) if registrar else "Unknown",
            "creation_date": creation_date.isoformat() if creation_date else None,
            "expiration_date": expiration_date.isoformat() if expiration_date else None,
            "domain_age_days": domain_age_days,
            "expires_in_days": expires_in_days,
            "name_servers": name_servers if name_servers else [],
            "status": "WHOIS lookup successful",
        }

    except Exception as error:
        return {
            "available": False,
            "registrar": "Unknown",
            "creation_date": None,
            "expiration_date": None,
            "domain_age_days": None,
            "expires_in_days": None,
            "name_servers": [],
            "status": f"WHOIS lookup unavailable: {error}",
        }


def check_local_domain_blacklist(domain: str):
    record = LOCAL_DOMAIN_BLACKLIST.get(domain)

    if not record:
        return {
            "matched": False,
            "status": "No local blacklist match",
        }

    return {
        "matched": True,
        "status": "Matched local blacklist",
        "record": record,
    }


def analyze_domain_reputation(domain: str):
    normalized_domain = normalize_domain(domain)
    reasons = []
    risk_score = 0

    if not is_valid_domain(normalized_domain):
        return {
            "domain": normalized_domain,
            "valid": False,
            "reputation": "INVALID",
            "risk_score": 100,
            "threat_intel_status": "Domain format validation only",
            "reasons": ["Invalid domain format"],
        }

    domain_parts = normalized_domain.split(".")
    tld = domain_parts[-1]
    subdomain_count = max(len(domain_parts) - 2, 0)

    resolved_ips = []

    try:
        resolved_ips = list(
            {
                result[4][0]
                for result in socket.getaddrinfo(normalized_domain, None)
            }
        )
    except Exception:
        reasons.append("Domain does not currently resolve to an IP address.")
        risk_score += 25

    whois_intelligence = get_whois_intelligence(normalized_domain)

    if whois_intelligence.get("available"):
        domain_age_days = whois_intelligence.get("domain_age_days")
        expires_in_days = whois_intelligence.get("expires_in_days")

        if domain_age_days is not None and domain_age_days < 30:
            risk_score += 25
            reasons.append(
                f"Domain is very new: {domain_age_days} days old."
            )

        elif domain_age_days is not None and domain_age_days < 90:
            risk_score += 15
            reasons.append(
                f"Domain is relatively new: {domain_age_days} days old."
            )

        if expires_in_days is not None and expires_in_days < 30:
            risk_score += 10
            reasons.append(
                f"Domain expires soon: {expires_in_days} days remaining."
            )

    blacklist_result = check_local_domain_blacklist(normalized_domain)

    if blacklist_result.get("matched"):
        record = blacklist_result["record"]
        risk_score += 50
        reasons.append(
            f"Local blacklist match: {record['category']}."
        )

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in normalized_domain:
            risk_score += 10
            reasons.append(f"Domain contains suspicious keyword: {keyword}")

    if tld in SUSPICIOUS_TLDS:
        risk_score += 20
        reasons.append(f"Domain uses suspicious TLD: .{tld}")

    if "xn--" in normalized_domain:
        risk_score += 30
        reasons.append(
            "Domain uses punycode, which can be used for homograph phishing."
        )

    if subdomain_count >= 3:
        risk_score += 15
        reasons.append("Domain has many subdomain levels.")

    if len(normalized_domain) > 45:
        risk_score += 15
        reasons.append("Domain name is unusually long.")

    if "-" in normalized_domain:
        risk_score += 5
        reasons.append("Domain contains hyphens.")

    risk_score = min(risk_score, 100)

    if risk_score >= 70:
        reputation = "HIGH_RISK"
    elif risk_score >= 30:
        reputation = "SUSPICIOUS"
    else:
        reputation = "LOW_RISK"

    if not reasons:
        reasons.append("No obvious local domain reputation risks detected.")

    return {
        "domain": normalized_domain,
        "valid": True,
        "reputation": reputation,
        "risk_score": risk_score,
        "resolved_ips": resolved_ips,
        "tld": tld,
        "subdomain_count": subdomain_count,
        "known_malicious": None,
        "blacklist": blacklist_result,
        "blacklist_status": blacklist_result.get("status"),
        "whois": whois_intelligence,
        "whois_status": whois_intelligence.get("status"),
        "confidence": None,
        "threat_intel_status": "Local RavShield domain reputation V1 only. External threat intelligence not connected yet.",
        "reasons": reasons,
    }