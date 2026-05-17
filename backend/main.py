from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import whois

# Create FastAPI app
app = FastAPI()

# Allow frontend to connect to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# User sends JSON like:
# { "url": "https://instagram.com" }

class UrlRequest(BaseModel):
    url: str


# Test route
@app.get("/")
def home():
    return {
        "message": "Ethical Hacking Dashboard #47 backend is alive"
    }


# Main scanner route
@app.post("/scan-url")
def scan_url(request: UrlRequest):

    # Split URL
    parsed_url = urlparse(request.url)

    # Get domain
    domain = parsed_url.netloc

    # Fix missing https://
    if domain == "":
        domain = parsed_url.path

    # WHOIS info
    info = whois.whois(domain)

    # Open website using real browser
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=True)

        page = browser.new_page()

        try:
            # Load webpage
            page.goto(request.url, timeout=10000)

            # Wait for JavaScript
            page.wait_for_timeout(3000)

            # Final HTML after JS loads
            html = page.content()

        except:
            html = ""

        browser.close()

    # Parse HTML
    soup = BeautifulSoup(html, "html.parser")

    # Lowercase text
    page_text = html.lower()

    # Starting risk score
    risk_score = 0

    # Reasons list
    reasons = []

    # Count forms
    login_forms = len(
        soup.find_all("form")
    )

    # Count password inputs
    password_fields = len(
        soup.find_all("input", {"type": "password"})
    )

    # Count scripts
    scripts = len(
        soup.find_all("script")
    )

    # Browser/API detection
    camera_microphone_access = (
        "getusermedia" in page_text
    )

    location_access = (
        "geolocation" in page_text
    )

    notification_access = (
        "notification.requestpermission" in page_text
    )

    cookie_usage = (
        "document.cookie" in page_text
    )

    redirect_behavior = (
        "window.location" in page_text
        or 'http-equiv="refresh"' in page_text
    )

    download_links = (
        ".exe" in page_text
        or ".apk" in page_text
        or ".dmg" in page_text
    )

    # Suspicious domain words
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

    if not domain_is_trusted:

        risk_score += 30

        reasons.append(
            "Uses uncommon or suspicious domain ending"
        )

    # Long domain
    if len(domain) > 30:

        risk_score += 20

        reasons.append(
            "Domain length is suspiciously long"
        )

    # Password fields
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

    # Many scripts
    if scripts > 20:

        risk_score += 10

        reasons.append(
            "Website uses many scripts"
        )

    # Camera / mic
    if camera_microphone_access:

        risk_score += 25

        reasons.append(
            "Website may request camera or microphone access"
        )

    # Location
    if location_access:

        risk_score += 20

        reasons.append(
            "Website may request location access"
        )

    # Notifications
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

    # Redirects
    if redirect_behavior:

        risk_score += 15

        reasons.append(
            "Website contains redirect behavior"
        )

    # Download links
    if download_links:

        risk_score += 20

        reasons.append(
            "Website contains possible download links"
        )

    # Max score = 100
    risk_score = min(risk_score, 100)

    # Threat label
    if risk_score < 30:

        threat_level = "LOW"

    elif risk_score < 70:

        threat_level = "MEDIUM"

    else:

        threat_level = "HIGH"

    # Final JSON response
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

        "permission_note":
            "No permission request detected on initial page load. Some sites may request permissions later after login or user interaction.",

        "reasons": reasons,

        "status": "Scan complete"
    }