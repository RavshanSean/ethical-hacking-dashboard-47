from fastapi import APIRouter, HTTPException

from services.scan_result_service import (
    get_recent_scan_results,
    get_scan_result_by_id,
)


router = APIRouter()


@router.get("/scan-results")
def scan_results():

    return {
        "scan_results": get_recent_scan_results()
    }


@router.get("/scan-results/{scan_id}")
def scan_result_detail(scan_id: int):

    scan = get_scan_result_by_id(scan_id)

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan result not found",
        )

    return scan