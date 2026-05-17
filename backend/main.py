from fastapi import FastAPI
from pydantic import BaseModel
from urllib.parse import urlparse
import whois

app = FastAPI()

suspicious_words = [
    "login",
    "verify",
    "secure",
    "bank",
    "paypal"
]

suspicious_tlds = [
    ".xyz",
    ".tk",
    ".top",
    ".ru"
]

class UrlRequest(BaseModel):
    url: str

@app.get("/")
def home():
    return {"message": "Ethical Hacking Dashboard #47 backend is alive"}

@app.post("/scan-url")
def scan_url(request: UrlRequest):
    parsed_url = urlparse(request.url)
    domain = parsed_url.netloc

    if domain == "":
        domain = parsed_url.path

    info = whois.whois(domain)

    risk_score = 0

    for word in suspicious_words:
        if word in domain.lower():
            risk_score += 25

    for tld in suspicious_tlds:
        if domain.endswith(tld):
            risk_score += 30

    if len(domain) > 30:
        risk_score += 20

    return {
        "url": request.url,
        "domain": domain,
        "registrar": info.registrar,
        "creation_date": str(info.creation_date),
        "expiration_date": str(info.expiration_date),
        "risk_score": risk_score,
        "status": "Scan complete"
    }