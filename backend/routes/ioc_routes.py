from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from ravshield_threatintel.ioc_database import (
    create_ioc_record,
    list_ioc_records,
    check_ioc_record,
    delete_ioc_record,
)


router = APIRouter(prefix="/ioc", tags=["RavShield IOC Database"])


class IOCRequest(BaseModel):
    ioc_type: str
    value: str
    severity: str = "UNKNOWN"
    source: str = "Local RavShield IOC Database"
    description: str = ""
    tags: List[str] = []


@router.post("")
def create_ioc(payload: IOCRequest):
    result = create_ioc_record(payload.model_dump())

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result)

    return result


@router.get("")
def get_iocs(limit: int = 100):
    return {
        "items": list_ioc_records(limit=limit)
    }


@router.get("/check/{ioc_type}/{value}")
def check_ioc(ioc_type: str, value: str):
    return check_ioc_record(ioc_type=ioc_type, value=value)


@router.delete("/{ioc_id}")
def delete_ioc(ioc_id: int):
    deleted = delete_ioc_record(ioc_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="IOC record not found",
        )

    return {
        "deleted": True,
        "ioc_id": ioc_id,
    }