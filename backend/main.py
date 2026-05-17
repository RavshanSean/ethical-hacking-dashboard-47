from fastapi import FastAPI
from pydantic import BaseModel
from urllib.parse import urlparse
import whois
import requests
from bs4 import BeautifulSoup

# Create FastAPI app
app = FastAPI()

# Words commonly used in phishing or scam websites
suspicious_words = [
    "login",
    "verify",
    "secure",
    "bank",
    "paypal"
]

# More trusted domain endings
trusted_tlds = [
    ".com",
    ".org",
    ".gov",
    ".edu",
    ".us"
]

# Defines what data user sends to API
class UrlRequest(BaseModel):
    url: str


# Home route
@app.get("/")
def home():
    return {
        "message": "Ethical Hacking Dashboard #47 backend is alive"
    }


# URL scanner route
@app.post("/scan-url")
def scan_url(request: UrlRequest):

    # Parse URL into parts
    parsed_url = urlparse(request.url)

    # Extract domain name
    domain = parsed_url.netloc

    # Fixes URLs without https://
    if domain == "":
        domain = parsed_url.path

    # Get WHOIS domain information
    info = whois.whois(domain)

    # Download webpage HTML
    response = requests.get(request.url)

    # Raw HTML content
    html = response.text

    # Parse webpage structure
    soup = BeautifulSoup(html, "html.parser")

    # Convert entire page to lowercase text
    page_text = html.lower()

    # Starting risk score
    risk_score = 0

    # Stores explanations for user
    reasons = []

    # Count forms on page
    login_forms = len(soup.find_all("form"))

    # Count password inputs
    password_fields = len(
        soup.find_all("input", {"type": "password"})
    )

    # Count JavaScript scripts
    scripts = len(soup.find_all("script"))

    # Detect camera/microphone requests
    camera_microphone_access = (
        "getusermedia" in page_text
    )

    # Detect location access
    location_access = (
        "geolocation" in page_text
    )

    # Detect browser notification requests
    notification_access = (
        "notification.requestpermission" in page_text
    )

    # Detect cookie usage
    cookie_usage = (
        "document.cookie" in page_text
    )

    # Detect redirects
    redirect_behavior = (
        "window.location" in page_text
        or 'http-equiv="refresh"' in page_text
    )

    # Detect possible downloadable files
    download_links = (
        ".exe" in page_text
        or ".apk" in page_text
        or ".dmg" in page_text
    )

    # Check suspicious words inside domain
    for word in suspicious_words:

        if word in domain.lower():

            risk_score += 25

            reasons.append(
                f"Contains suspicious word: {word}"
            )

    # Assume domain is NOT trusted first
    domain_is_trusted = False

    # Check if domain ends with trusted TLD
    for tld in trusted_tlds:

        if domain.endswith(tld):

            domain_is_trusted = True

    # Penalize uncommon domain endings
    if not domain_is_trusted:

        risk_score += 30

        reasons.append(
            "Uses uncommon or suspicious domain ending"
        )

    # Long domains are suspicious sometimes
    if len(domain) > 30:

        risk_score += 20

        reasons.append(
            "Domain length is suspiciously long"
        )

    # Detect password fields
    if password_fields > 0:

        risk_score += 15

        reasons.append(
            "Website contains password fields"
        )

    # Detect forms
    if login_forms > 0:

        reasons.append(
            "Website contains login forms"
        )

    # Too many scripts can be suspicious
    if scripts > 20:

        risk_score += 10

        reasons.append(
            "Website uses many scripts"
        )

    # Camera or microphone access
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

    # Browser notification access
    if notification_access:

        risk_score += 10

        reasons.append(
            "Website may request notification permission"
        )

    # Cookie tracking
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

    # Detect possible downloads
    if download_links:

        risk_score += 20

        reasons.append(
            "Website contains possible download links"
        )

    # Maximum risk score is 100
    risk_score = min(risk_score, 100)

    # Threat level logic
    if risk_score < 30:

        threat_level = "LOW 🟢"

    elif risk_score < 70:

        threat_level = "MEDIUM 🟡"

    else:

        threat_level = "HIGH 🔴"

    # API response
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

        "reasons": reasons,

        "status": "Scan complete"
    }