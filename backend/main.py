from fastapi import FastAPI
from pydantic import BaseModel
from urllib.parse import urlparse
import whois
import requests
from bs4 import BeautifulSoup

app = FastAPI()

suspicious_words = [
    "login",
    "verify",
    "secure",
    "bank",
    "paypal"
]

trusted_tlds = [
    ".com",
    ".org",
    ".gov",
    ".edu",
    ".us"
]

class UrlRequest(BaseModel):
    url: str


@app.get("/")
def home():
    return {
        "message": "Ethical Hacking Dashboard #47 backend is alive"
    }


@app.post("/scan-url")
def scan_url(request: UrlRequest):

    parsed_url = urlparse(request.url)
    domain = parsed_url.netloc

    if domain == "":
        domain = parsed_url.path

    info = whois.whois(domain)

    response = requests.get(request.url)
    html = response.text

    soup = BeautifulSoup(html, "html.parser")

    risk_score = 0
    reasons = []

    login_forms = len(soup.find_all("form"))
    password_fields = len(soup.find_all("input", {"type": "password"}))
    scripts = len(soup.find_all("script"))

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
        reasons.append("Website contains password fields")

    if login_forms > 0:
        reasons.append("Website contains login forms")

    if scripts > 20:
        risk_score += 10
        reasons.append("Website uses many scripts")

    risk_score = min(risk_score, 100)

    if risk_score < 30:
        threat_level = "LOW 🟢"

    elif risk_score < 70:
        threat_level = "MEDIUM 🟡"

    else:
        threat_level = "HIGH 🔴"

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
        "reasons": reasons,
        "status": "Scan complete"
    }