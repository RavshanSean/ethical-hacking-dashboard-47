from fastapi import APIRouter, Request
from pydantic import BaseModel

from routes.vulnerability_routes import (
    vulnerability_scan,
    VulnerabilityScanRequest,
)
from services.scanner_service import scan_website
from utils.rate_limit import scan_rate_limiter, client_key
from utils.ssrf import validate_scan_url

router = APIRouter(prefix="/browser-protection", tags=["Browser Protection"])


class BrowserProtectionRequest(BaseModel):
    url: str


@router.post("/check")
def check_browser_protection(
    payload: BrowserProtectionRequest,
    request: Request,
):
    scan_rate_limiter.check(client_key(request, "scan"))
    safe_url = validate_scan_url(payload.url)

    vulnerability_result = vulnerability_scan(
        VulnerabilityScanRequest(url=safe_url)
    )

    url_result = scan_website(safe_url)

    vulnerability_score = vulnerability_result.get("score", 0)
    url_risk_score = url_result.get("risk_score", 0)

    findings = vulnerability_result.get("findings", [])

    suspicious_indicators = url_result.get(
        "suspicious_domain_indicators",
        []
    )

    redirect_count = url_result.get("redirect_count", 0)
    ssl_info = url_result.get("ssl_intelligence", {})
    ip_intelligence = url_result.get("ip_intelligence", {})
    threat_correlation = url_result.get("threat_correlation", {})

    matched_iocs = threat_correlation.get("matched_iocs", [])
    correlation_reasons = threat_correlation.get("reasons", [])
    correlation_level = threat_correlation.get("correlation_level", "NONE")
    correlation_risk = threat_correlation.get("risk_adjustment", 0)

    if suspicious_indicators:
        findings.append({
            "severity": "HIGH",
            "title": "Suspicious Domain Indicators",
            "description": ", ".join(suspicious_indicators),
        })

    if matched_iocs:
        findings.append({
            "severity": "HIGH",
            "title": "ThreatIntel IOC Match",
            "description": (
                "RavShield ThreatIntel matched this target against "
                "the local IOC database."
            ),
        })

    if correlation_level in ["HIGH", "MEDIUM"]:
        findings.append({
            "severity": correlation_level,
            "title": "Threat Correlation Match",
            "description": ", ".join(correlation_reasons),
        })

    if redirect_count >= 3:
        findings.append({
            "severity": "MEDIUM",
            "title": "Multiple Redirects",
            "description": (
                f"This website redirects {redirect_count} times before "
                "reaching the final destination."
            ),
        })

    if ssl_info.get("days_left") is not None and ssl_info.get("days_left") < 14:
        findings.append({
            "severity": "MEDIUM",
            "title": "SSL Certificate Expiring Soon",
            "description": (
                f"SSL certificate expires in "
                f"{ssl_info.get('days_left')} days."
            ),
        })

    combined_risk = max(
        url_risk_score,
        100 - vulnerability_score,
        correlation_risk,
    )

    if suspicious_indicators:
        combined_risk = max(combined_risk, 85)

    if matched_iocs:
        combined_risk = 100

    high_count = len([
        finding for finding in findings
        if finding.get("severity") == "HIGH"
    ])

    medium_count = len([
        finding for finding in findings
        if finding.get("severity") == "MEDIUM"
    ])

    if high_count > 0 or combined_risk >= 75:
        status = "BLOCKED"
        recommendation = "Do not visit this website."
    elif medium_count > 0 or combined_risk >= 40:
        status = "WARNING"
        recommendation = "Use caution before visiting this website."
    else:
        status = "SAFE"
        recommendation = "No major browser protection issues detected."

    explanation = (
        "Browser Protection reviewed URL reputation, vulnerability findings, "
        "SSL status, redirects, hosting intelligence, suspicious domain indicators, "
        "and RavShield ThreatIntel correlation. "
        f"Final verdict: {status}. "
    )

    if matched_iocs:
        explanation += (
            "This site matched the local IOC database, so it was treated as high risk."
        )
    elif status == "BLOCKED":
        explanation += (
            "This site should be avoided because it has high-risk signals or severe findings."
        )
    elif status == "WARNING":
        explanation += (
            "This site is not immediately blocked, but it has security weaknesses that require caution."
        )
    else:
        explanation += (
            "No major browser protection issues were detected."
        )

    return {
        "target": payload.url,
        "hostname": url_result.get("domain"),
        "score": max(0, 100 - combined_risk),
        "risk_score": combined_risk,
        "status": status,
        "recommendation": recommendation,
        "explanation": explanation,
        "threat_intel": {
            "correlation_level": correlation_level,
            "risk_adjustment": correlation_risk,
            "matched_iocs": matched_iocs,
            "reasons": correlation_reasons,
        },
        "ssl": {
            "valid": ssl_info.get("valid"),
            "issuer": ssl_info.get("issuer"),
            "expires_at": ssl_info.get("expires_at"),
            "days_left": ssl_info.get("days_left"),
        },
        "network": {
            "ip": url_result.get("resolved_ip"),
            "country": ip_intelligence.get("country"),
            "region": ip_intelligence.get("region"),
            "city": ip_intelligence.get("city"),
            "isp": ip_intelligence.get("isp"),
            "org": ip_intelligence.get("org"),
            "asn": ip_intelligence.get("asn"),
        },
        "redirects": {
            "count": redirect_count,
            "chain": url_result.get("redirect_chain"),
            "final_url": url_result.get("final_url"),
        },
        "url_risk_score": url_risk_score,
        "vulnerability_score": vulnerability_score,
        "findings": findings,
        "summary": {
            "high": high_count,
            "medium": medium_count,
            "total": len(findings),
        },
    }