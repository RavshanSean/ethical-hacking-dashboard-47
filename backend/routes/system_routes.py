from fastapi import APIRouter
import psutil
import socket

router = APIRouter(prefix="/system", tags=["System"])


def _network_status() -> str:
    try:
        with socket.create_connection(("1.1.1.1", 443), timeout=2):
            return "Online"
    except OSError:
        return "Offline"


@router.get("/scan")
def system_scan():
    cpu = psutil.cpu_percent(interval=0.3)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu_percent": cpu,
        "memory_percent": memory.percent,
        "disk_percent": disk.percent,
        "network_status": _network_status(),
    }
