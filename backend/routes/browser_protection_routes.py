from fastapi import APIRouter
from pydantic import BaseModel
from routes.vulnerability_routes import vulnerability_scan, VulnerabilityScanRequest

router = APIRouter(prefix="/browser-protection", tags=["Browser Protection"])


class BrowserProtectionRequest(BaseModel):
    url: str


@router.post("/check")
def check_browser_protection(payload: BrowserProtectionRequest):
    scan_result = vulnerability_scan(
        VulnerabilityScanRequest(url=payload.url)
    )

    score = scan_result.get("score", 0)
    findings = scan_result.get("findings", [])

    high_count = len([
        finding for finding in findings
        if finding.get("severity") == "HIGH"
    ])

    medium_count = len([
        finding for finding in findings
        if finding.get("severity") == "MEDIUM"
    ])

    if high_count > 0 or score < 40:
        status = "BLOCKED"
        recommendation = "Do not visit this website."
    elif medium_count > 0 or score < 75:
        status = "WARNING"
        recommendation = "Use caution before visiting this website."
    else:
        status = "SAFE"
        recommendation = "No major browser protection issues detected."

    return {
        "target": scan_result.get("target"),
        "hostname": scan_result.get("hostname"),
        "score": score,
        "status": status,
        "recommendation": recommendation,
        "ssl": scan_result.get("ssl"),
        "findings": findings,
        "summary": {
            "high": high_count,
            "medium": medium_count,
            "total": len(findings),
        },
    }