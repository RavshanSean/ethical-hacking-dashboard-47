from fastapi import APIRouter
import psutil
import socket
import time

router = APIRouter(prefix="/system", tags=["System"])

_cpu_primed = False
_network_cache = {"status": "Online", "checked_at": 0.0}
_NETWORK_TTL_SECONDS = 45.0


def _network_status() -> str:
    now = time.monotonic()
    if now - _network_cache["checked_at"] < _NETWORK_TTL_SECONDS:
        return str(_network_cache["status"])

    status = "Offline"
    try:
        with socket.create_connection(("1.1.1.1", 443), timeout=0.4):
            status = "Online"
    except OSError:
        status = "Offline"

    _network_cache["status"] = status
    _network_cache["checked_at"] = now
    return status


@router.get("/scan")
def system_scan():
    global _cpu_primed

    # Non-blocking sample. First call primes counters; later calls are instant.
    cpu = psutil.cpu_percent(interval=None if _cpu_primed else 0.0)
    _cpu_primed = True

    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu_percent": cpu,
        "memory_percent": memory.percent,
        "disk_percent": disk.percent,
        "network_status": _network_status(),
    }
