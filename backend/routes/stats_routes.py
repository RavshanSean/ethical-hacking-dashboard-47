from fastapi import APIRouter

from services.stats_service import (
    calculate_stats,
    calculate_timeline_stats,
    get_recent_threats,
)


router = APIRouter()


@router.get("/stats")
def get_stats():

    return calculate_stats()


@router.get("/stats/timeline")
def get_timeline_stats():

    return calculate_timeline_stats()


@router.get("/stats/recent-threats")
def recent_threats():
    return get_recent_threats()