from fastapi import APIRouter
import psutil

router = APIRouter(prefix="/network", tags=["Network"])


@router.get("")
def get_network_status():
    counters = psutil.net_io_counters()

    connections = []
    permission_limited = False

    try:
        connections = psutil.net_connections(kind="inet")
    except psutil.AccessDenied:
        permission_limited = True
        connections = []
    except Exception:
        permission_limited = True
        connections = []

    active_connections = []

    for connection in connections[:100]:
        local_address = ""
        remote_address = ""

        try:
            if connection.laddr:
                local_address = f"{connection.laddr.ip}:{connection.laddr.port}"

            if connection.raddr:
                remote_address = f"{connection.raddr.ip}:{connection.raddr.port}"

            active_connections.append(
                {
                    "fd": connection.fd,
                    "family": str(connection.family),
                    "type": str(connection.type),
                    "local_address": local_address,
                    "remote_address": remote_address,
                    "status": connection.status or "UNKNOWN",
                    "pid": connection.pid,
                }
            )
        except Exception:
            continue

    return {
        "bytes_sent": counters.bytes_sent,
        "bytes_received": counters.bytes_recv,
        "packets_sent": counters.packets_sent,
        "packets_received": counters.packets_recv,
        "connections_count": len(connections),
        "permission_limited": permission_limited,
        "connections": active_connections,
    }