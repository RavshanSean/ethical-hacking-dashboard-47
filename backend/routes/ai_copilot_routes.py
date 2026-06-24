from fastapi import APIRouter
from pydantic import BaseModel
import json

from db.database import SessionLocal
from db.models import (
    SecurityEvent,
    ScanResult,
    VulnerabilityScanResult,
)


router = APIRouter(prefix="/ai-copilot", tags=["AI Copilot"])


class CopilotRequest(BaseModel):
    question: str


def get_recent_context():
    db = SessionLocal()

    try:
        recent_events = (
            db.query(SecurityEvent)
            .order_by(SecurityEvent.id.desc())
            .limit(5)
            .all()
        )

        recent_url_scans = (
            db.query(ScanResult)
            .order_by(ScanResult.id.desc())
            .limit(5)
            .all()
        )

        recent_vulnerability_scans = (
            db.query(VulnerabilityScanResult)
            .order_by(VulnerabilityScanResult.id.desc())
            .limit(5)
            .all()
        )

        return {
            "events": recent_events,
            "url_scans": recent_url_scans,
            "vulnerability_scans": recent_vulnerability_scans,
        }

    finally:
        db.close()


def summarize_events(events):
    if not events:
        return "No recent security events were found."

    high_count = sum(1 for event in events if event.severity == "HIGH")
    medium_count = sum(1 for event in events if event.severity == "MEDIUM")
    low_count = sum(1 for event in events if event.severity == "LOW")

    latest = events[0]

    return (
        f"There are {len(events)} recent security events. "
        f"High: {high_count}, Medium: {medium_count}, Low: {low_count}. "
        f"Latest event: {latest.event_type} - {latest.message}"
    )


def summarize_url_scans(scans):
    if not scans:
        return "No recent URL scans were found."

    highest_risk_scan = max(
        scans,
        key=lambda scan: scan.risk_score or 0,
    )

    return (
        f"There are {len(scans)} recent URL scans. "
        f"The highest recent URL risk is {highest_risk_scan.risk_score}/100 "
        f"for {highest_risk_scan.domain} with threat level "
        f"{highest_risk_scan.threat_level}."
    )


def summarize_vulnerability_scans(scans):
    if not scans:
        return "No recent vulnerability scans were found."

    weakest_scan = min(
        scans,
        key=lambda scan: scan.score or 0,
    )

    return (
        f"There are {len(scans)} recent vulnerability scans. "
        f"The weakest recent security score is {weakest_scan.score}/100 "
        f"for {weakest_scan.hostname}. "
        f"SSL valid: {weakest_scan.ssl_valid}."
    )


def explain_vulnerability_findings(scan):
    if not scan or not scan.findings:
        return "No vulnerability findings are available yet."

    try:
        findings = json.loads(scan.findings or "[]")
    except Exception:
        findings = []

    if not findings:
        return "No vulnerability findings are available yet."

    main_findings = findings[:3]

    explanation = "The latest vulnerability scan found: "

    explanation += "; ".join(
        f"{finding.get('severity', 'UNKNOWN')} - {finding.get('title', 'Unknown issue')}"
        for finding in main_findings
    )

    explanation += (
        ". Recommended action: review missing security headers, verify SSL, "
        "and confirm the target uses modern browser protections."
    )

    return explanation


@router.post("/ask")
def ask_copilot(payload: CopilotRequest):
    question = payload.question.lower()
    if "dashboard summary" in question:
        answer = (
            "Dashboard Summary: Security telemetry is active. "
            "Recent events have been recorded in the database. "
            "Threat monitoring, vulnerability scanning, browser protection, "
            "quarantine management, and AI analysis services are operational."
        )

        return {
            "question": payload.question,
            "answer": answer,
            "engine": "EHD AI Copilot V2 - database-aware analyst",
        }

    context = get_recent_context()

    events = context["events"]
    url_scans = context["url_scans"]
    vulnerability_scans = context["vulnerability_scans"]

    latest_vulnerability_scan = (
        vulnerability_scans[0] if vulnerability_scans else None
    )

    if "event" in question or "alert" in question or "threat" in question:
        answer = summarize_events(events)

    elif "url" in question or "domain" in question or "scan" in question:
        answer = summarize_url_scans(url_scans)

    elif (
        "vulnerability" in question
        or "header" in question
        or "ssl" in question
        or "security score" in question
    ):
        answer = (
            summarize_vulnerability_scans(vulnerability_scans)
            + " "
            + explain_vulnerability_findings(latest_vulnerability_scan)
        )

    elif "dashboard" in question or "status" in question or "summary" in question:
        answer = (
            summarize_events(events)
            + " "
            + summarize_url_scans(url_scans)
            + " "
            + summarize_vulnerability_scans(vulnerability_scans)
        )

    elif "phishing" in question:
        answer = (
            "Phishing is a cyberattack where an attacker tricks users into "
            "entering passwords, payment details, or private information on a "
            "fake or suspicious website. In this dashboard, phishing risk is "
            "usually connected to suspicious domain words, redirects, login "
            "forms, invalid SSL, and high-risk scan results."
        )

    elif "sql injection" in question:
        answer = (
            "SQL injection happens when attackers insert malicious database "
            "commands into input fields. Your current scanner does not deeply "
            "test SQL injection yet, but the vulnerability scanner can still "
            "identify basic web security weaknesses such as missing headers "
            "and SSL problems."
        )

    else:
        answer = (
            "I can analyze recent threat events, URL scan history, "
            "vulnerability scan results, SSL status, missing security headers, "
            "phishing risk, and dashboard security status."
        )

    return {
        "question": payload.question,
        "answer": answer,
        "engine": "EHD AI Copilot V2 - database-aware analyst",
        "context": {
            "recent_events": len(events),
            "recent_url_scans": len(url_scans),
            "recent_vulnerability_scans": len(vulnerability_scans),
        },
    }