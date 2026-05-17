from fastapi import FastAPI
from pydantic import BaseModel
from urllib.parse import urlparse
import whois

app = FastAPI()

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

    return {
        "url": request.url,
        "domain": domain,
        "registrar": info.registrar,
        "creation_date": str(info.creation_date),
        "expiration_date": str(info.expiration_date),
        "status": "Scan complete"
    }