from fastapi import APIRouter
from pydantic import BaseModel
import json

from db.database import SessionLocal
from db.models import (
    SecurityEvent,
    ScanResult,
    VulnerabilityScanResult,
)

from services.quarantine_service import get_quarantined_files
from ravshield_threatintel.ioc_database import list_ioc_records

router = APIRouter(prefix="/ai-copilot", tags=["AI Copilot"])


class CopilotRequest(BaseModel):
    question: str


def get_recent_context():
    db = SessionLocal()

    try:
        events = (
            db.query(SecurityEvent)
            .order_by(SecurityEvent.id.desc())
            .limit(10)
            .all()
        )

        url_scans = (
            db.query(ScanResult)
            .order_by(ScanResult.id.desc())
            .limit(10)
            .all()
        )

        vulnerability_scans = (
            db.query(VulnerabilityScanResult)
            .order_by(VulnerabilityScanResult.id.desc())
            .limit(10)
            .all()
        )

        quarantine_items = get_quarantined_files()

        return {
            "events": events,
            "url_scans": url_scans,
            "vulnerability_scans": vulnerability_scans,
            "quarantine_items": quarantine_items,
        }

    finally:
        db.close()


def safe_json_loads(value, fallback):
    try:
        return json.loads(value or fallback)
    except Exception:
        return json.loads(fallback)


def explain_latest_url_scan(scans):
    if not scans:
        return "No URL scan results are available yet."

    scan = scans[0]
    reasons = safe_json_loads(scan.reasons, "[]")

    answer = (
        f"Latest URL Scan Analysis:\n\n"
        f"Target: {scan.url or scan.domain}\n"
        f"Domain: {scan.domain}\n"
        f"Threat Level: {scan.threat_level}\n"
        f"Risk Score: {scan.risk_score}/100\n\n"
    )

    if reasons:
        answer += "Main risk indicators:\n"
        for reason in reasons[:5]:
            answer += f"- {reason}\n"
    else:
        answer += "No detailed risk indicators were stored for this scan.\n"

    answer += (
        "\nRecommended next actions:\n"
        "- Review the domain and registrar information.\n"
        "- Avoid entering credentials if login forms were detected.\n"
        "- Re-scan suspicious domains before trusting them.\n"
    )

    return answer


def explain_latest_file_activity(events, quarantine_items):
    file_events = [
        event for event in events
        if "FILE" in event.event_type or "MALWARE" in event.event_type
    ]

    latest_quarantine = quarantine_items[0] if quarantine_items else None

    if not file_events and not latest_quarantine:
        return (
            "No recent file scan or quarantine activity is available yet. "
            "Run a file scan first, then I can explain the result."
        )

    answer = "Latest File Security Analysis:\n\n"

    if latest_quarantine:
        answer += (
            f"Quarantined File: {latest_quarantine.get('original_filename')}\n"
            f"Threat Level: {latest_quarantine.get('threat_level')}\n"
            f"Risk Score: {latest_quarantine.get('risk_score')}/100\n"
            f"Threat Name: {latest_quarantine.get('threat') or 'Unknown'}\n"
            f"Status: {latest_quarantine.get('status')}\n\n"
        )

        answer += (
            "Meaning:\n"
            "This file was isolated because the scanner classified it as risky "
            "or infected. Keeping it quarantined prevents accidental use while "
            "you review it.\n\n"
        )

    if file_events:
        latest_event = file_events[0]
        answer += (
            f"Latest File Event: {latest_event.event_type}\n"
            f"Severity: {latest_event.severity}\n"
            f"Message: {latest_event.message}\n\n"
        )

    answer += (
        "Recommended next actions:\n"
        "- Do not open quarantined files.\n"
        "- Review hash reputation and antivirus result.\n"
        "- Delete confirmed malware.\n"
        "- Restore only if you are sure it is a false positive.\n"
    )

    return answer


def explain_latest_vulnerability_scan(scans):
    if not scans:
        return "No vulnerability scan results are available yet."

    scan = scans[0]
    findings = safe_json_loads(scan.findings, "[]")
    headers = safe_json_loads(scan.security_headers, "{}")

    answer = (
        f"Latest Vulnerability Scan Analysis:\n\n"
        f"Target: {scan.target}\n"
        f"Hostname: {scan.hostname}\n"
        f"Security Score: {scan.score}/100\n"
        f"SSL Valid: {scan.ssl_valid}\n"
        f"SSL Days Left: {scan.ssl_days_left}\n\n"
    )

    if findings:
        answer += "Main findings:\n"
        for finding in findings[:6]:
            answer += (
                f"- {finding.get('severity', 'UNKNOWN')}: "
                f"{finding.get('title', 'Unknown issue')} — "
                f"{finding.get('description', 'No description')}\n"
            )
    else:
        answer += "No vulnerability findings were stored for this scan.\n"

    missing_headers = [
        header for header, value in headers.items()
        if not value
    ]

    if missing_headers:
        answer += "\nMissing or unavailable security headers:\n"
        for header in missing_headers[:6]:
            answer += f"- {header}\n"

    answer += (
        "\nRecommended next actions:\n"
        "- Add missing browser security headers.\n"
        "- Confirm HTTPS redirects correctly.\n"
        "- Review exposed server headers.\n"
        "- Re-test after applying fixes.\n"
    )

    return answer


def generate_investigation_notes(context):
    events = context["events"]
    url_scans = context["url_scans"]
    vulnerability_scans = context["vulnerability_scans"]
    quarantine_items = context["quarantine_items"]

    high_events = [
        event for event in events
        if event.severity == "HIGH"
    ]

    answer = "Investigation Notes:\n\n"

    answer += "Scope:\n"
    answer += (
        f"- Reviewed {len(events)} recent security events.\n"
        f"- Reviewed {len(url_scans)} recent URL scans.\n"
        f"- Reviewed {len(vulnerability_scans)} recent vulnerability scans.\n"
        f"- Reviewed {len(quarantine_items)} quarantine records.\n\n"
    )

    answer += "Key Findings:\n"

    if high_events:
        for event in high_events[:5]:
            answer += f"- HIGH event: {event.event_type} — {event.message}\n"
    else:
        answer += "- No high-severity events found in the recent event window.\n"

    if quarantine_items:
        item = quarantine_items[0]
        answer += (
            f"- Latest quarantined file: {item.get('original_filename')} "
            f"with risk {item.get('risk_score')}/100.\n"
        )

    if url_scans:
        riskiest = max(url_scans, key=lambda scan: scan.risk_score or 0)
        answer += (
            f"- Riskiest recent URL: {riskiest.domain} "
            f"with score {riskiest.risk_score}/100.\n"
        )

    if vulnerability_scans:
        weakest = min(vulnerability_scans, key=lambda scan: scan.score or 0)
        answer += (
            f"- Weakest vulnerability score: {weakest.hostname} "
            f"with score {weakest.score}/100.\n"
        )

    answer += (
        "\nRecommended Actions:\n"
        "- Prioritize HIGH severity items first.\n"
        "- Keep quarantined files isolated until reviewed.\n"
        "- Re-scan risky domains after changes.\n"
        "- Patch missing security headers and SSL weaknesses.\n"
    )

    return answer


def threat_intelligence_summary():
    iocs = list_ioc_records(limit=20)

    if not iocs:
        return (
            "Threat Intelligence Summary:\n\n"
            "No IOC records are currently stored."
        )

    high = [
        item
        for item in iocs
        if item["severity"] == "HIGH"
    ]

    answer = (
        "Threat Intelligence Summary:\n\n"
        f"IOC Records: {len(iocs)}\n"
        f"High Severity: {len(high)}\n\n"
    )

    answer += "Recent Indicators:\n"

    for item in iocs[:5]:
        answer += (
            f"- {item['ioc_type']}: "
            f"{item['value']} "
            f"({item['severity']})\n"
        )

    answer += (
        "\nRecommendation:\n"
        "Review HIGH severity indicators, monitor related infrastructure, "
        "and continue expanding the IOC database."
    )

    return answer


def dashboard_summary(context):
    events = context["events"]
    url_scans = context["url_scans"]
    vulnerability_scans = context["vulnerability_scans"]
    quarantine_items = context["quarantine_items"]

    high_events = sum(1 for event in events if event.severity == "HIGH")
    medium_events = sum(1 for event in events if event.severity == "MEDIUM")
    low_events = sum(1 for event in events if event.severity == "LOW")

    return (
        "Dashboard Security Summary:\n\n"
        f"- Recent events: {len(events)}\n"
        f"- High: {high_events}, Medium: {medium_events}, Low: {low_events}\n"
        f"- Recent URL scans: {len(url_scans)}\n"
        f"- Recent vulnerability scans: {len(vulnerability_scans)}\n"
        f"- Quarantined files: {len(quarantine_items)}\n\n"
        "Overall recommendation: review high-severity events first, "
        "keep suspicious files quarantined, and re-check weak vulnerability scores."
    )


@router.post("/ask")
def ask_copilot(payload: CopilotRequest):
    question = payload.question.lower()
    context = get_recent_context()

    if "url" in question or "domain" in question:
        answer = explain_latest_url_scan(context["url_scans"])

    elif "file" in question or "malware" in question or "quarantine" in question:
        answer = explain_latest_file_activity(
            context["events"],
            context["quarantine_items"],
        )

    elif (
        "vulnerability" in question
        or "ssl" in question
        or "header" in question
        or "security score" in question
    ):
        answer = explain_latest_vulnerability_scan(
            context["vulnerability_scans"]
        )

    elif (
        "investigation" in question
        or "notes" in question
        or "report" in question
        or "analyst" in question
    ):
        answer = generate_investigation_notes(context)
        
    elif (
        "threat intel" in question
        or "ioc" in question
        or "indicator" in question
    ):
        answer = threat_intelligence_summary()

    elif "phishing" in question:
        answer = (
            "Phishing is an attack where a fake or suspicious website tricks "
            "users into entering credentials, payment details, or private data. "
            "In EHD, phishing risk can be connected to suspicious domains, "
            "redirects, login forms, weak SSL, and high URL risk scores."
        )

    elif "sql injection" in question:
        answer = (
            "SQL injection happens when attackers insert malicious database "
            "commands into input fields. EHD does not deeply exploit-test SQL "
            "injection yet, but it can identify general web security weaknesses "
            "such as missing headers, SSL problems, and risky site behavior."
        )

    elif "summary" in question or "dashboard" in question or "status" in question:
        answer = dashboard_summary(context)

    else:
        answer = (
            "I can help explain recent URL scans, file scans, quarantine records, "
            "vulnerability scans, SSL issues, security headers, recent events, "
            "and generate investigation notes. Try asking: "
            "'Explain latest URL scan', 'Explain latest file scan', "
            "'Explain latest vulnerability scan', or 'Generate investigation notes'."
        )

    return {
        "question": payload.question,
        "answer": answer,
        "engine": "EHD AI Copilot V3 - analyst mode",
        "context": {
            "recent_events": len(context["events"]),
            "recent_url_scans": len(context["url_scans"]),
            "recent_vulnerability_scans": len(context["vulnerability_scans"]),
            "quarantine_items": len(context["quarantine_items"]),
        },
    }