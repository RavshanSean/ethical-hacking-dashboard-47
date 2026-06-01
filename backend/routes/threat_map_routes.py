from fastapi import APIRouter

from services.event_service import get_recent_events

router = APIRouter()


LOCATION_POOL = [
    {
        "country": "United States",
        "city": "New York",
        "latitude": 40.7128,
        "longitude": -74.0060,
    },
    {
        "country": "Germany",
        "city": "Frankfurt",
        "latitude": 50.1109,
        "longitude": 8.6821,
    },
    {
        "country": "Brazil",
        "city": "São Paulo",
        "latitude": -23.5558,
        "longitude": -46.6396,
    },
    {
        "country": "Japan",
        "city": "Tokyo",
        "latitude": 35.6762,
        "longitude": 139.6503,
    },
    {
        "country": "United Kingdom",
        "city": "London",
        "latitude": 51.5072,
        "longitude": -0.1276,
    },
]


@router.get("/threat-map/events")
async def get_threat_map_events():
    recent_events = get_recent_events(limit=10)

    map_events = []

    for index, event in enumerate(recent_events):
        location = LOCATION_POOL[index % len(LOCATION_POOL)]

        map_events.append(
            {
                "id": index + 1,
                "country": location["country"],
                "city": location["city"],
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "threat_type": event["type"],
                "severity": event["severity"],
                "message": event["message"],
                "timestamp": event["timestamp"],
            }
        )

    return map_events