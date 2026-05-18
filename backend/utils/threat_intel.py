# Local threat intelligence rules
# Later connect to real APIs like VirusTotal, AbuseIPDB, PhishTank, etc.

MALICIOUS_KEYWORDS = [
    "free-money",
    "account-verify",
    "password-reset",
    "gift-card",
    "crypto-wallet",
]

SUSPICIOUS_TLDS = [
    ".xyz",
    ".top",
    ".ru",
    ".click",
    ".cam",
]


def check_threat_intel(domain: str):
    """
    Checks domain against local threat intelligence rules.
    Returns risk points and reasons.
    """

    risk_points = 0
    reasons = []

    lower_domain = domain.lower()

    for keyword in MALICIOUS_KEYWORDS:
        if keyword in lower_domain:
            risk_points += 20
            reasons.append(f"Threat intel match: suspicious keyword '{keyword}'")

    for tld in SUSPICIOUS_TLDS:
        if lower_domain.endswith(tld):
            risk_points += 15
            reasons.append(f"Threat intel warning: suspicious TLD '{tld}'")

    return {
        "risk_points": risk_points,
        "reasons": reasons,
    }