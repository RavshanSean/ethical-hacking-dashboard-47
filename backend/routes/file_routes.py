from fastapi import APIRouter, UploadFile, File, HTTPException

from services.file_scanner_service import analyze_file

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

    return result