from urllib.parse import urlparse

# Browser automation
from playwright.sync_api import sync_playwright

# HTML parser
from bs4 import BeautifulSoup

# Domain information lookup
import whois


# Suspicious keywords often used in phishing sites
suspicious_words = [
    "login",
    "verify",
    "secure",
    "bank",
    "paypal"
]


# Trusted domain endings
trusted_tlds = [
    ".com",
    ".org",
    ".gov",
    ".edu",
    ".us"
]


# Main scanning function
# Receives a URL from FastAPI
def scan_website(input_url: str):

    # Remove spaces from URL
    input_url = input_url.strip()

    # Auto-add https:// if user forgot it
    if not input_url.startswith(("http://", "https://")):
        input_url = "https://" + input_url

    # Break URL into parts
    parsed_url = urlparse(input_url)

    # Extract domain
    domain = parsed_url.netloc or parsed_url.path

    # Invalid URL protection
    if not domain:
        return {
            "url": input_url,
            "domain": "",
            "risk_score": 0,
            "threat_level": "UNKNOWN",
            "reasons": ["Invalid URL format"],
            "status": "Scan failed",
        }

    # Default WHOIS values
    registrar = "Unknown"
    creation_date = "Unknown"
    expiration_date = "Unknown"

    # Try WHOIS lookup
    try:

        # Get domain registration info
        info = whois.whois(domain)

        registrar = str(info.registrar)

        creation_date = str(info.creation_date)

        expiration_date = str(info.expiration_date)

    # WHOIS sometimes fails
    except Exception:

        registrar = "WHOIS lookup failed"

    # HTML content placeholder
    html = ""

    # Open real browser with Playwright
    try:

        with sync_playwright() as p:

            # Launch hidden Chromium browser
            browser = p.chromium.launch(headless=True)

            # Create new browser tab
            page = browser.new_page()

            # Open website
            page.goto(
                input_url,
                timeout=15000,
                wait_until="domcontentloaded"
            )

            # Wait for JavaScript to load
            page.wait_for_timeout(2000)

            # Get final rendered HTML
            html = page.content()

            # Close browser
            browser.close()

    # Browser scan failed
    except Exception:

        html = ""

    # Parse HTML
    soup = BeautifulSoup(html, "html.parser")

    # Lowercase HTML text for easier detection
    page_text = html.lower()

    # Starting threat score
    risk_score = 0

    # Why website is suspicious
    reasons = []

    # Count forms
    login_forms = len(soup.find_all("form"))

    # Count password fields
    password_fields = len(
        soup.find_all("input", {"type": "password"})
    )

    # Count scripts
    scripts = len(soup.find_all("script"))

    # Detect browser permission requests
    camera_microphone_access = (
        "getusermedia" in page_text
    )

    location_access = (
        "geolocation" in page_text
    )

    notification_access = (
        "notification.requestpermission" in page_text
    )

    # Detect cookies
    cookie_usage = (
        "document.cookie" in page_text
    )

    # Detect redirects
    redirect_behavior = (
        "window.location" in page_text
        or 'http-equiv="refresh"' in page_text
    )

    # Detect possible downloads
    download_links = (
        ".exe" in page_text
        or ".apk" in page_text
        or ".dmg" in page_text
    )

    # Check suspicious keywords in domain
    for word in suspicious_words:

        if word in domain.lower():

            risk_score += 25

            reasons.append(
                f"Contains suspicious word: {word}"
            )

    # Trusted TLD check
    domain_is_trusted = False

    for tld in trusted_tlds:

        if domain.endswith(tld):

            domain_is_trusted = True

    # Suspicious domain ending
    if not domain_is_trusted:

        risk_score += 30

        reasons.append(
            "Uses uncommon or suspicious domain ending"
        )

    # Very long domains are suspicious
    if len(domain) > 30:

        risk_score += 20

        reasons.append(
            "Domain length is suspiciously long"
        )

    # Password field detection
    if password_fields > 0:

        risk_score += 15

        reasons.append(
            "Website contains password fields"
        )

    # Login forms
    if login_forms > 0:

        reasons.append(
            "Website contains login forms"
        )

    # Too many scripts
    if scripts > 20:

        risk_score += 10

        reasons.append(
            "Website uses many scripts"
        )

    # Camera/microphone access
    if camera_microphone_access:

        risk_score += 25

        reasons.append(
            "Website may request camera or microphone access"
        )

    # Location access
    if location_access:

        risk_score += 20

        reasons.append(
            "Website may request location access"
        )

    # Notification permission
    if notification_access:

        risk_score += 10

        reasons.append(
            "Website may request notification permission"
        )

    # Cookies
    if cookie_usage:

        risk_score += 5

        reasons.append(
            "Website uses browser cookies"
        )

    # Redirect behavior
    if redirect_behavior:

        risk_score += 15

        reasons.append(
            "Website contains redirect behavior"
        )

    # Download detection
    if download_links:

        risk_score += 20

        reasons.append(
            "Website contains possible download links"
        )

    # Max risk score = 100
    risk_score = min(risk_score, 100)

    # Threat levels
    if risk_score < 30:

        threat_level = "LOW"

    elif risk_score < 70:

        threat_level = "MEDIUM"

    else:

        threat_level = "HIGH"

    # No suspicious indicators found
    if len(reasons) == 0:

        reasons.append(
            "No major suspicious indicators detected"
        )

    # Final JSON response sent to frontend
    return {

        "url": input_url,

        "domain": domain,

        "registrar": registrar,

        "creation_date": creation_date,

        "expiration_date": expiration_date,

        "risk_score": risk_score,

        "threat_level": threat_level,

        "login_forms_detected": login_forms,

        "password_fields_detected": password_fields,

        "scripts_detected": scripts,

        "camera_microphone_access": camera_microphone_access,

        "location_access": location_access,

        "notification_access": notification_access,

        "cookie_usage": cookie_usage,

        "redirect_behavior": redirect_behavior,

        "download_links": download_links,

        "permission_note": (
            "No permission request detected on initial "
            "page load. Some sites may request "
            "permissions later after login or interaction."
        ),

        "reasons": reasons,

        "status": "Scan complete",
    }