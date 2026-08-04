from fastapi import APIRouter, Request
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from services.scanner_service import scan_website
from services.event_service import create_event
from utils.rate_limit import scan_rate_limiter, client_key
from utils.ssrf import validate_scan_url


router = APIRouter()


class UrlRequest(BaseModel):
    url: str


@router.post("/scan-url")
async def scan_url(request_body: UrlRequest, request: Request):
    scan_rate_limiter.check(client_key(request, "scan"))
    safe_url = validate_scan_url(request_body.url)

    result = await run_in_threadpool(scan_website, safe_url)

    create_event(
        event_type="SCAN",
        severity=result["threat_level"],
        message=(
            f"URL scan completed for "
            f"{result['domain']} "
            f"with {result['threat_level']} risk"
        ),
    )

    return result
