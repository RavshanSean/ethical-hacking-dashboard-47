from fastapi import FastAPI
from pydantic import BaseModel
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import whois

# Create FastAPI app
app = FastAPI()

# Words commonly used in phishing/scam domains
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

# User sends JSON like: {"url": "https://instagram.com"}
class UrlRequest(BaseModel):
    url: str


# Basic test route
@app.get("/")
def home():
    return {
        "message": "Ethical Hacking Dashboard #47 backend is alive"
    }


# Main URL scanner route
@app.post("/scan-url")
def scan_url(request: UrlRequest):

    # Split URL into parts
    parsed_url = urlparse(request.url)

    # Extract domain
    domain = parsed_url.netloc

    # If user forgot https://, use path as domain
    if domain == "":
        domain = parsed_url.path

    # Get domain registration info
    info = whois.whois(domain)

    # Open real browser and load webpage
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto(request.url, timeout=10000)
            page.wait_for_timeout(3000)

            # HTML after JavaScript loads
            html = page.content()

        except:
            html = ""

        browser.close()

    # Parse final loaded HTML
    soup = BeautifulSoup(html, "html.parser")

    # Lowercase page text for searching
    page_text = html.lower()

    # Starting score
    risk_score = 0

    # Reasons shown to user
    reasons = []

    # Count visible page elements after JS loads
    login_forms = len(soup.find_all("form"))

    password_fields = len(
        soup.find_all("input", {"type": "password"})
    )

    scripts = len(soup.find_all("script"))

    # Detect browser permission/API behavior
    camera_microphone_access = "getusermedia" in page_text
    location_access = "geolocation" in page_text
    notification_access = "notification.requestpermission" in page_text
    cookie_usage = "document.cookie" in page_text

    redirect_behavior = (
        "window.location" in page_text
        or 'http-equiv="refresh"' in page_text
    )

    download_links = (
        ".exe" in page_text
        or ".apk" in page_text
        or ".dmg" in page_text
    )

    # Check suspicious words in domain
    for word in suspicious_words:
        if word in domain.lower():
            risk_score += 25
            reasons.append(f"Contains suspicious word: {word}")

    # Check trusted TLD
    domain_is_trusted = False

    for tld in trusted_tlds:
        if domain.endswith(tld):
            domain_is_trusted = True

    if not domain_is_trusted:
        risk_score += 30
        reasons.append("Uses uncommon or suspicious domain ending")

    # Long domain warning
    if len(domain) > 30:
        risk_score += 20
        reasons.append("Domain length is suspiciously long")

    # Page structure warnings
    if password_fields > 0:
        risk_score += 15
        reasons.append("Website contains password fields")

    if login_forms > 0:
        reasons.append("Website contains login forms")

    if scripts > 20:
        risk_score += 10
        reasons.append("Website uses many scripts")

    # Permission/privacy warnings
    if camera_microphone_access:
        risk_score += 25
        reasons.append("Website may request camera or microphone access")

    if location_access:
        risk_score += 20
        reasons.append("Website may request location access")

    if notification_access:
        risk_score += 10
        reasons.append("Website may request notification permission")

    if cookie_usage:
        risk_score += 5
        reasons.append("Website uses browser cookies")

    if redirect_behavior:
        risk_score += 15
        reasons.append("Website contains redirect behavior")

    if download_links:
        risk_score += 20
        reasons.append("Website contains possible download links")

    # Keep score max 100
    risk_score = min(risk_score, 100)

    # Threat label
    if risk_score < 30:
        threat_level = "LOW 🟢"
    elif risk_score < 70:
        threat_level = "MEDIUM 🟡"
    else:
        threat_level = "HIGH 🔴"

    # Final response
    return {
        "url": request.url,
        "domain": domain,
        "registrar": info.registrar,
        "creation_date": str(info.creation_date),
        "expiration_date": str(info.expiration_date),
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
        "permission_note": "No permission request detected on initial page load. Some sites may request permissions later after login or user interaction.",
        "reasons": reasons,
        "status": "Scan complete"
    }