from fastapi import APIRouter
import psutil

router = APIRouter(prefix="/processes", tags=["Processes"])


@router.get("")
def get_processes():
    processes = []

    for process in psutil.process_iter(
        ["pid", "name", "username", "status", "cpu_percent", "memory_info"]
    ):
        try:
            info = process.info

            memory_mb = 0
            if info.get("memory_info"):
                memory_mb = round(info["memory_info"].rss / 1024 / 1024, 2)

            processes.append(
                {
                    "pid": info.get("pid"),
                    "name": info.get("name") or "Unknown",
                    "username": info.get("username") or "Unknown",
                    "status": info.get("status") or "unknown",
                    "cpu_percent": info.get("cpu_percent") or 0,
                    "memory_mb": memory_mb,
                }
            )

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    processes.sort(
        key=lambda item: item["memory_mb"],
        reverse=True,
    )

    return {
        "total": len(processes),
        "processes": processes[:50],
    }