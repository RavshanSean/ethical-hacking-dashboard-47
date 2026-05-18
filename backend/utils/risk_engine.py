# Suspicious keywords often used in phishing or scam domains
SUSPICIOUS_WORDS = [
    "login",
    "verify",
    "secure",
    "bank",
    "paypal",
]


# Domain endings we treat as more common/trusted
TRUSTED_TLDS = [
    ".com",
    ".org",
    ".gov",
    ".edu",
    ".us",
]


def calculate_risk(domain: str, indicators: dict):
    """
    Calculates risk score, threat level, and security reasons.

    domain:
        The website domain, example: instagram.com

    indicators:
        Data collected from scanner_service.py, like:
        - password_fields
        - login_forms
        - scripts
        - camera_microphone_access
        - location_access
        - notification_access
        - cookie_usage
        - redirect_behavior
        - download_links
    """

    risk_score = 0
    reasons = []

    # Check if domain contains suspicious phishing words
    for word in SUSPICIOUS_WORDS:
        if word in domain.lower():
            risk_score += 25
            reasons.append(f"Contains suspicious word: {word}")

    # Check domain ending, example: .com is common, .xyz is more suspicious
    domain_is_trusted = False

    for tld in TRUSTED_TLDS:
        if domain.endswith(tld):
            domain_is_trusted = True

    if not domain_is_trusted:
        risk_score += 30
        reasons.append("Uses uncommon or suspicious domain ending")

    # Very long domains can be used to hide scam/phishing wording
    if len(domain) > 30:
        risk_score += 20
        reasons.append("Domain length is suspiciously long")

    # Pull collected scanner values from indicators dictionary
    password_fields = indicators.get("password_fields", 0)
    login_forms = indicators.get("login_forms", 0)
    scripts = indicators.get("scripts", 0)

    camera_microphone_access = indicators.get("camera_microphone_access", False)
    location_access = indicators.get("location_access", False)
    notification_access = indicators.get("notification_access", False)
    cookie_usage = indicators.get("cookie_usage", False)
    redirect_behavior = indicators.get("redirect_behavior", False)
    download_links = indicators.get("download_links", False)

    # Password fields increase risk because phishing sites often steal login data
    if password_fields > 0:
        risk_score += 15
        reasons.append("Website contains password fields")

    # Login forms are not always dangerous, but they are important to report
    if login_forms > 0:
        reasons.append("Website contains login forms")

    # Many scripts may mean complex tracking, ads, or suspicious behavior
    if scripts > 20:
        risk_score += 10
        reasons.append("Website uses many scripts")

    # Browser permission indicators
    if camera_microphone_access:
        risk_score += 25
        reasons.append("Website may request camera or microphone access")

    if location_access:
        risk_score += 20
        reasons.append("Website may request location access")

    if notification_access:
        risk_score += 10
        reasons.append("Website may request notification permission")

    # Browser behavior indicators
    if cookie_usage:
        risk_score += 5
        reasons.append("Website uses browser cookies")

    if redirect_behavior:
        risk_score += 15
        reasons.append("Website contains redirect behavior")

    if download_links:
        risk_score += 20
        reasons.append("Website contains possible download links")

    # Keep score from going above 100
    risk_score = min(risk_score, 100)

    # Convert score into readable threat level
    if risk_score < 30:
        threat_level = "LOW"
    elif risk_score < 70:
        threat_level = "MEDIUM"
    else:
        threat_level = "HIGH"

    # If nothing suspicious was found, still give user a clear reason
    if len(reasons) == 0:
        reasons.append("No major suspicious indicators detected")

    return {
        "risk_score": risk_score,
        "threat_level": threat_level,
        "reasons": reasons,
    }