from collections import Counter

from fastapi import APIRouter, Query

from services.event_service import get_recent_events

router = APIRouter()


MAP_EVENT_TYPES = [
    "HIGH_RISK_URL",
    "FILE_QUARANTINED",
    "MALWARE_DETECTED",
    "CRITICAL_VULNERABILITY",
    "DANGEROUS_IP_CONNECTION",
    "FILE_SCAN",
]


def has_real_geo(event: dict):
    return (
        event.get("country")
        and event.get("country") != "Unknown"
        and event.get("city")
        and event.get("city") != "Unknown"
        and event.get("latitude") is not None
        and event.get("longitude") is not None
    )


def build_map_events(limit: int = 100):
    recent_events = get_recent_events(limit=limit)
    map_events = []
    unmapped_events = []

    for event in recent_events:
        if event["type"] not in MAP_EVENT_TYPES:
            continue

        base_event = {
            "threat_type": event["type"],
            "severity": event["severity"],
            "message": event["message"],
            "timestamp": event["timestamp"],
            "country": event.get("country") or "Unknown",
            "city": event.get("city") or "Unknown",
            "latitude": event.get("latitude"),
            "longitude": event.get("longitude"),
        }

        if has_real_geo(event):
            map_events.append(
                {
                    "id": len(map_events) + 1,
                    **base_event,
                    "geo_source": "real",
                    "mapped": True,
                }
            )
        else:
            unmapped_events.append(
                {
                    "id": len(unmapped_events) + 1,
                    **base_event,
                    "geo_source": "unavailable",
                    "mapped": False,
                }
            )

    return map_events, unmapped_events


@router.get("/threat-map/events")
async def get_threat_map_events(
    severity: str | None = Query(default=None),
    event_type: str | None = Query(default=None),
):
    map_events, _ = build_map_events(limit=100)

    if severity and severity != "ALL":
        map_events = [
            event for event in map_events
            if event["severity"] == severity
        ]

    if event_type and event_type != "ALL":
        map_events = [
            event for event in map_events
            if event["threat_type"] == event_type
        ]

    return map_events


@router.get("/threat-map/unmapped-events")
async def get_unmapped_threat_events():
    _, unmapped_events = build_map_events(limit=100)

    return {
        "items": unmapped_events,
        "total": len(unmapped_events),
    }


@router.get("/threat-map/summary")
async def get_threat_map_summary():
    map_events, unmapped_events = build_map_events(limit=100)

    all_events = map_events + unmapped_events

    country_counts = Counter(
        event["country"]
        for event in map_events
    )

    type_counts = Counter(
        event["threat_type"]
        for event in all_events
    )

    severity_counts = Counter(
        event["severity"]
        for event in all_events
    )

    return {
        "total_events": len(all_events),
        "mapped_events": len(map_events),
        "unmapped_events": len(unmapped_events),
        "high_events": severity_counts.get("HIGH", 0),
        "medium_events": severity_counts.get("MEDIUM", 0),
        "low_events": severity_counts.get("LOW", 0),
        "countries": [
            {
                "country": country,
                "count": count,
            }
            for country, count in country_counts.most_common(5)
        ],
        "top_threat_types": [
            {
                "type": threat_type,
                "count": count,
            }
            for threat_type, count in type_counts.most_common(5)
        ],
        "severity_distribution": dict(severity_counts),
        "event_categories": MAP_EVENT_TYPES,
    }