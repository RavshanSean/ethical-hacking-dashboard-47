from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import whois

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

suspicious_words = ["login", "verify", "secure", "bank", "paypal"]

trusted_tlds = [".com", ".org", ".gov", ".edu", ".us"]


class UrlRequest(BaseModel):
    url: str


@app.get("/")
def home():
    return {"message": "Ethical Hacking Dashboard #47 backend is alive"}


@app.post("/scan-url")
def scan_url(request: UrlRequest):
    try:
        input_url = request.url.strip()

        if not input_url.startswith(("http://", "https://")):
            input_url = "https://" + input_url

        parsed_url = urlparse(input_url)
        domain = parsed_url.netloc or parsed_url.path

        if not domain:
            return {
                "url": request.url,
                "domain": "",
                "risk_score": 0,
                "threat_level": "UNKNOWN",
                "reasons": ["Invalid URL format"],
                "status": "Scan failed",
                "error": "Invalid URL format",
            }

        registrar = "Unknown"
        creation_date = "Unknown"
        expiration_date = "Unknown"

        try:
            info = whois.whois(domain)
            registrar = str(info.registrar)
            creation_date = str(info.creation_date)
            expiration_date = str(info.expiration_date)
        except Exception:
            registrar = "WHOIS lookup failed"
            creation_date = "Unknown"
            expiration_date = "Unknown"

        html = ""

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(input_url, timeout=15000, wait_until="domcontentloaded")
                page.wait_for_timeout(2000)
                html = page.content()
                browser.close()
        except Exception:
            html = ""

        soup = BeautifulSoup(html, "html.parser")
        page_text = html.lower()

        risk_score = 0
        reasons = []

        login_forms = len(soup.find_all("form"))
        password_fields = len(soup.find_all("input", {"type": "password"}))
        scripts = len(soup.find_all("script"))

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

        for word in suspicious_words:
            if word in domain.lower():
                risk_score += 25
                reasons.append(f"Contains suspicious word: {word}")

        domain_is_trusted = False

        for tld in trusted_tlds:
            if domain.endswith(tld):
                domain_is_trusted = True

        if not domain_is_trusted:
            risk_score += 30
            reasons.append("Uses uncommon or suspicious domain ending")

        if len(domain) > 30:
            risk_score += 20
            reasons.append("Domain length is suspiciously long")

        if password_fields > 0:
            risk_score += 15
            reasons.append("Website contains password fields")

        if login_forms > 0:
            reasons.append("Website contains login forms")

        if scripts > 20:
            risk_score += 10
            reasons.append("Website uses many scripts")

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

        risk_score = min(risk_score, 100)

        if risk_score < 30:
            threat_level = "LOW"
        elif risk_score < 70:
            threat_level = "MEDIUM"
        else:
            threat_level = "HIGH"

        if len(reasons) == 0:
            reasons.append("No major suspicious indicators detected")

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
            "permission_note": "No permission request detected on initial page load. Some sites may request permissions later after login or user interaction.",
            "reasons": reasons,
            "status": "Scan complete",
        }

    except Exception as error:
        return {
            "url": request.url,
            "domain": "Unknown",
            "registrar": "Unknown",
            "creation_date": "Unknown",
            "expiration_date": "Unknown",
            "risk_score": 0,
            "threat_level": "UNKNOWN",
            "login_forms_detected": 0,
            "password_fields_detected": 0,
            "scripts_detected": 0,
            "camera_microphone_access": False,
            "location_access": False,
            "notification_access": False,
            "cookie_usage": False,
            "redirect_behavior": False,
            "download_links": False,
            "permission_note": "Scan failed before permission analysis could complete.",
            "reasons": ["Could not analyze this website safely"],
            "status": "Scan failed",
            "error": str(error),
        }