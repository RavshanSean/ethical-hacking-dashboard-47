from fastapi import APIRouter
import psutil

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/scan")
def system_scan():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu_percent": cpu,
        "memory_percent": memory.percent,
        "disk_percent": disk.percent,
        "network_status": "Online",
    }