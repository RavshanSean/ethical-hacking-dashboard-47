from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import whois

from utils.domain_utils import normalize_url, extract_domain
from utils.risk_engine import calculate_risk


# Main scanning function
# Receives a URL from FastAPI
def scan_website(input_url: str):

    # Clean and standardize URL
    input_url = normalize_url(input_url)

    # Extract domain from URL
    domain = extract_domain(input_url)

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
        info = whois.whois(domain)

        registrar = str(info.registrar)
        creation_date = str(info.creation_date)
        expiration_date = str(info.expiration_date)

    except Exception:
        registrar = "WHOIS lookup failed"

    # HTML content placeholder
    html = ""

    # Open real browser with Playwright
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto(
                input_url,
                timeout=15000,
                wait_until="domcontentloaded",
            )

            page.wait_for_timeout(2000)

            html = page.content()

            browser.close()

    except Exception:
        html = ""

    # Parse HTML
    soup = BeautifulSoup(html, "html.parser")

    # Lowercase HTML text for easier detection
    page_text = html.lower()

    # Count forms
    login_forms = len(soup.find_all("form"))

    # Count password fields
    password_fields = len(
        soup.find_all("input", {"type": "password"})
    )

    # Count scripts
    scripts = len(soup.find_all("script"))

    # Detect browser permission requests
    camera_microphone_access = "getusermedia" in page_text
    location_access = "geolocation" in page_text
    notification_access = "notification.requestpermission" in page_text

    # Detect cookies
    cookie_usage = "document.cookie" in page_text

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

    # All collected security indicators
    indicators = {
        "login_forms": login_forms,
        "password_fields": password_fields,
        "scripts": scripts,
        "camera_microphone_access": camera_microphone_access,
        "location_access": location_access,
        "notification_access": notification_access,
        "cookie_usage": cookie_usage,
        "redirect_behavior": redirect_behavior,
        "download_links": download_links,
    }

    # Send collected evidence to risk engine
    risk_result = calculate_risk(domain, indicators)

    # Extract risk engine result
    risk_score = risk_result["risk_score"]
    threat_level = risk_result["threat_level"]
    reasons = risk_result["reasons"]

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