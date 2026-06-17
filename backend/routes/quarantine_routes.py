from fastapi import APIRouter
from services.quarantine_service import get_quarantined_files

router = APIRouter(prefix="/quarantine", tags=["Quarantine"])


@router.get("")
def list_quarantined_files():
    return {
        "items": get_quarantined_files()
    }