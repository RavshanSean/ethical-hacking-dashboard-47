from fastapi import APIRouter
import psutil

router = APIRouter(prefix="/network", tags=["Network"])


@router.get("")
def get_network_status():
    counters = psutil.net_io_counters()
    connections = psutil.net_connections(kind="inet")

    active_connections = []

    for connection in connections[:100]:
        local_address = ""
        remote_address = ""

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
                "status": connection.status,
                "pid": connection.pid,
            }
        )

    return {
        "bytes_sent": counters.bytes_sent,
        "bytes_received": counters.bytes_recv,
        "packets_sent": counters.packets_sent,
        "packets_received": counters.packets_recv,
        "connections_count": len(connections),
        "connections": active_connections,
    }