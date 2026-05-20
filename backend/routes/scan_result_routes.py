from fastapi import APIRouter

from services.scan_result_service import get_recent_scan_results


router = APIRouter()


@router.get("/scan-results")
def scan_results():

    return {
        "scan_results": get_recent_scan_results()
    }