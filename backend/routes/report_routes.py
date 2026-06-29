from collections import Counter
from datetime import datetime

from fastapi import APIRouter

from services.event_service import get_recent_events
from services.scan_result_service import get_recent_scan_results
from services.quarantine_service import get_quarantined_files

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/security-summary")
def get_security_summary():
    events = get_recent_events(limit=50)
    url_scans = get_recent_scan_results(limit=50, page=1)
    quarantined_files = get_quarantined_files()

    scan_items = url_scans.get("items", [])

    severity_counts = Counter(event["severity"] for event in events)
    event_type_counts = Counter(event["type"] for event in events)

    high_risk_urls = [
        scan for scan in scan_items
        if scan.get("threat_level") == "HIGH"
    ]

    medium_risk_urls = [
        scan for scan in scan_items
        if scan.get("threat_level") == "MEDIUM"
    ]

    high_quarantine = [
        item for item in quarantined_files
        if item.get("threat_level") == "HIGH"
    ]

    recommendations = []

    if high_risk_urls:
        recommendations.append(
            "Review high-risk URL scan results and block suspicious domains."
        )

    if high_quarantine:
        recommendations.append(
            "Inspect quarantined files and confirm whether they should remain isolated."
        )

    if severity_counts.get("HIGH", 0) > 0:
        recommendations.append(
            "Prioritize HIGH severity security events for immediate investigation."
        )

    if not recommendations:
        recommendations.append(
            "No critical activity detected. Continue monitoring security telemetry."
        )

    executive_summary = (
        f"EHD #47 reviewed {len(events)} recent security events, "
        f"{len(scan_items)} URL scan results, and "
        f"{len(quarantined_files)} quarantined files. "
        f"{severity_counts.get('HIGH', 0)} high-severity events were found."
    )

    return {
        "report_name": "EHD #47 Security Summary Report",
        "generated_at": datetime.now().isoformat(),
        "executive_summary": executive_summary,
        "events": {
            "total": len(events),
            "high": severity_counts.get("HIGH", 0),
            "medium": severity_counts.get("MEDIUM", 0),
            "low": severity_counts.get("LOW", 0),
            "top_event_types": [
                {
                    "type": event_type,
                    "count": count,
                }
                for event_type, count in event_type_counts.most_common(5)
            ],
            "recent": events[:10],
        },
        "url_scans": {
            "total": url_scans.get("total_results", 0),
            "high_risk": len(high_risk_urls),
            "medium_risk": len(medium_risk_urls),
            "recent": scan_items[:10],
        },
        "quarantine": {
            "total": len(quarantined_files),
            "high_risk": len(high_quarantine),
            "items": quarantined_files[:10],
        },
        "recommendations": recommendations,
    }