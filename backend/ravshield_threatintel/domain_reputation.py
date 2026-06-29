import re
import socket


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
        "blacklist_status": "Not available yet",
        "whois_status": "Not available yet",
        "confidence": None,
        "threat_intel_status": "Local RavShield domain reputation V1 only. External threat intelligence not connected yet.",
        "reasons": reasons,
    }