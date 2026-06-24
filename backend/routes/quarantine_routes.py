from fastapi import APIRouter, HTTPException

from services.quarantine_service import (
    get_quarantined_files,
    delete_quarantined_file,
)

router = APIRouter(prefix="/quarantine", tags=["Quarantine"])


@router.get("")
def list_quarantined_files():
    return {
        "items": get_quarantined_files()
    }


@router.delete("/{quarantine_id}")
def delete_quarantine_item(quarantine_id: str):
    deleted = delete_quarantined_file(quarantine_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Quarantined file not found",
        )

    return {
        "deleted": True,
        "id": quarantine_id,
    }