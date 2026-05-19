from fastapi import APIRouter

from services.event_service import get_recent_events


router = APIRouter()


# Recent security events API route
@router.get("/events")
def get_events():
    return {
        "events": get_recent_events()
    }