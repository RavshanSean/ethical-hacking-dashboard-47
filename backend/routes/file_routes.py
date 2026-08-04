from fastapi import APIRouter, UploadFile, File, HTTPException, Request

from services.event_service import create_event
from services.file_scanner_service import analyze_file
from services.quarantine_service import quarantine_file
from utils.rate_limit import scan_rate_limiter, client_key
from utils.settings_service import get_app_settings


router = APIRouter()


@router.post("/scan-file")
async def scan_file(request: Request, file: UploadFile = File(...)):
    scan_rate_limiter.check(client_key(request, "scan"))

    settings = get_app_settings()
    max_bytes = max(1, int(settings["max_file_size"])) * 1024 * 1024

    file_bytes = await file.read()

    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large. Maximum allowed size is "
                f"{settings['max_file_size']}MB."
            ),
        )

    result = analyze_file(
        filename=file.filename,
        file_bytes=file_bytes,
        max_archive_depth=int(settings["max_archive_depth"]),
        zip_inspection=bool(settings["zip_inspection"]),
        ai_analysis=bool(settings["ai_analysis"]),
    )

    if (
        result.get("antivirus", {}).get("status") == "INFECTED"
        or result.get("hash_reputation", {}).get("status") == "KNOWN_MALICIOUS"
        or result.get("threat_level") == "HIGH"
    ):
        quarantine_item = quarantine_file(
            filename=file.filename,
            file_bytes=file_bytes,
            scan_result=result,
        )
        result["quarantine"] = quarantine_item

    create_event(
        event_type="FILE_SCAN",
        severity=result["threat_level"],
        message=(
            f"File scan completed: "
            f"{result['filename']} "
            f"(Risk {result['risk_score']}/100)"
        ),
    )

    return result
