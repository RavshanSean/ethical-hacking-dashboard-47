from fastapi import APIRouter
from pydantic import BaseModel

from services.scanner_service import scan_website


router = APIRouter()


class UrlRequest(BaseModel):
    url: str


@router.post("/scan-url")
def scan_url(request: UrlRequest):

    return scan_website(request.url)