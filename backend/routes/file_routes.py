from fastapi import APIRouter, UploadFile, File, HTTPException
from services.event_service import create_event
from services.file_scanner_service import analyze_file
from services.quarantine_service import quarantine_file

router = APIRouter()

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB limit for uploaded files


@router.post("/scan-file")
async def scan_file(file: UploadFile = File(...)):
    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum allowed size is 25MB.",
        )

    result = analyze_file(
        filename=file.filename,
        file_bytes=file_bytes,
    )
    
    if result.get("antivirus", {}).get("status") == "INFECTED":
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