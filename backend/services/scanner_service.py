from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import socket
import whois
import requests

from utils.domain_utils import normalize_url, extract_domain
from utils.risk_engine import calculate_risk

from services.scan_result_service import save_scan_result
from services.ai_report_service import generate_ai_summary

import ssl
from datetime import datetime, timezone

def resolve_ip_address(domain: str):
    try:
        return socket.gethostbyname(domain)
    except Exception:
        return "Unable to resolve"

def get_ip_intelligence(ip: str):
    if not ip or ip == "Unable to resolve":
        return {
            "ip": ip,
            "country": "Unknown",
            "region": "Unknown",
            "city": "Unknown",
            "isp": "Unknown",
            "org": "Unknown",
            "asn": "Unknown",
        }

    try:
        response = requests.get(
            f"http://ip-api.com/json/{ip}",
            timeout=5,
        )

        data = response.json()

        return {
            "ip": ip,
            "country": data.get("country") or "Unknown",
            "region": data.get("regionName") or "Unknown",
            "city": data.get("city") or "Unknown",
            "isp": data.get("isp") or "Unknown",
            "org": data.get("org") or "Unknown",
            "asn": data.get("as") or "Unknown",
        }

    except Exception:
        return {
            "ip": ip,
            "country": "Unknown",
            "region": "Unknown",
            "city": "Unknown",
            "isp": "Unknown",
            "org": "Unknown",
            "asn": "Unknown",
        }

def get_redirect_chain(url: str):
    try:
        response = requests.get(
            url,
            timeout=10,
            allow_redirects=True,
            headers={
                "User-Agent": "EHD47-SecurityScanner/1.0"
            },
        )

        redirect_chain = [
            item.url for item in response.history
        ]

        return {
            "final_url": response.url,
            "redirect_chain": redirect_chain,
            "redirect_count": len(redirect_chain),
            "https_enabled": response.url.startswith("https://"),
            "status_code": response.status_code,
        }

    except Exception as error:
        return {
            "final_url": url,
            "redirect_chain": [],
            "redirect_count": 0,
            "https_enabled": url.startswith("https://"),
            "status_code": None,
            "error": str(error),
        }


def detect_suspicious_domain_indicators(domain: str):
    indicators = []

    suspicious_keywords = [
        "login",
        "verify",
        "secure",
        "account",
        "update",
        "wallet",
        "crypto",
        "free",
        "gift",
        "bonus",
        "prize",
    ]

    if len(domain) > 40:
        indicators.append("Domain is unusually long")

    if domain.startswith("xn--"):
        indicators.append("Domain uses punycode encoding")

    if domain.count("-") >= 3:
        indicators.append("Domain contains many hyphens")

    if any(char.isdigit() for char in domain):
        indicators.append("Domain contains numbers")

    for keyword in suspicious_keywords:
        if keyword in domain.lower():
            indicators.append(
                f"Domain contains suspicious keyword: {keyword}"
            )

    return indicators
# Main scanning function
def get_ssl_intelligence(domain: str):
    try:
        context = ssl.create_default_context()

        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as secure_sock:
                cert = secure_sock.getpeercert()

        issuer_parts = cert.get("issuer", [])
        issuer = "Unknown"

        for part in issuer_parts:
            for key, value in part:
                if key == "organizationName":
                    issuer = value

        expires_raw = cert.get("notAfter")
        expires_at = "Unknown"
        days_left = None

        if expires_raw:
            expires_date = datetime.strptime(
                expires_raw,
                "%b %d %H:%M:%S %Y %Z"
            ).replace(tzinfo=timezone.utc)

            expires_at = expires_date.isoformat()
            days_left = (expires_date - datetime.now(timezone.utc)).days

        return {
            "valid": True,
            "issuer": issuer,
            "expires_at": expires_at,
            "days_left": days_left,
        }

    except Exception as error:
        return {
            "valid": False,
            "issuer": "Unknown",
            "expires_at": "Unknown",
            "days_left": None,
            "error": str(error),
        }
# Receives a URL from FastAPI
def scan_website(input_url: str):

    # Clean and standardize URL
    input_url = normalize_url(input_url)

    # Extract domain from URL
    domain = extract_domain(input_url)
    resolved_ip = resolve_ip_address(domain)
    ip_intelligence = get_ip_intelligence(resolved_ip)
    ssl_intelligence = get_ssl_intelligence(domain)
    redirect_info = get_redirect_chain(input_url)
    suspicious_domain_indicators = detect_suspicious_domain_indicators(domain)

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
    
    if suspicious_domain_indicators:
        risk_score += min(len(suspicious_domain_indicators) * 10, 30)
        reasons.extend(suspicious_domain_indicators)

    if redirect_info.get("redirect_count", 0) >= 3:
        risk_score += 15
        reasons.append("Multiple redirects detected")

    if not redirect_info.get("https_enabled"):
        risk_score += 20
        reasons.append("Final destination does not use HTTPS")

    risk_score = min(risk_score, 100)

    if risk_score >= 70:
        threat_level = "HIGH"
    elif risk_score >= 30:
        threat_level = "MEDIUM"
    else:
        threat_level = "LOW"
    
    # Generate AI-powered security summary
    ai_summary = generate_ai_summary({
        "risk_score": risk_score,
        "threat_level": threat_level,
        "scripts_detected": scripts,
        "login_forms_detected": login_forms,
        "reasons": reasons,
    })
    

    # Final JSON response sent to frontend
    # Final JSON response sent to frontend
    scan_result = {
        "url": input_url,
        "domain": domain,
        "resolved_ip": resolved_ip,
        "ip_intelligence": ip_intelligence,
        "ssl_intelligence": ssl_intelligence,
        "final_url": redirect_info.get("final_url"),
        "redirect_chain": redirect_info.get("redirect_chain"),
        "redirect_count": redirect_info.get("redirect_count"),
        "https_enabled": redirect_info.get("https_enabled"),
        "http_status_code": redirect_info.get("status_code"),
        "suspicious_domain_indicators": suspicious_domain_indicators,
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
        "ai_summary": ai_summary,
        "download_links": download_links,
        "permission_note": (
            "No permission request detected on initial "
            "page load. Some sites may request "
            "permissions later after login or interaction."
        ),
        "reasons": reasons,
        "scan_type": "Dynamic browser scan",
        "engine_version": "0.2.0-url-intel",
        "analysis_source": "Local rules + threat intelligence",
        "status": "Scan complete",
    }

# Save full scan report to database
    save_scan_result(scan_result)

    return scan_result