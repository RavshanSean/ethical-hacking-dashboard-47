from fastapi import APIRouter
import ipaddress
import socket
import subprocess

import psutil

router = APIRouter(prefix="/network", tags=["Network"])


COMMON_PORTS = [22, 80, 443, 445, 3389, 5432, 8000, 8080]


def get_local_private_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except Exception:
        return None


def ping_host(ip: str):
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "1", ip],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=2,
        )

        return result.returncode == 0

    except Exception:
        return False


def check_open_ports(ip: str):
    open_ports = []

    for port in COMMON_PORTS:
        try:
            with socket.create_connection((ip, port), timeout=0.4):
                open_ports.append(port)
        except Exception:
            continue

    return open_ports


@router.get("")
def get_network_status():
    counters = psutil.net_io_counters()

    connections = []

    try:
        connections = psutil.net_connections(kind="inet")
        permission_limited = False
    except Exception:
        connections = []
        permission_limited = True

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


@router.get("/discovery")
def discover_local_network():
    local_ip = get_local_private_ip()

    if not local_ip:
        return {
            "status": "UNAVAILABLE",
            "message": "Unable to detect local private IP.",
            "local_ip": None,
            "private_range": None,
            "detected_hosts": [],
        }

    network = ipaddress.ip_network(f"{local_ip}/24", strict=False)

    detected_hosts = []

    for ip in list(network.hosts())[:30]:
        ip_text = str(ip)

        if ip_text == local_ip:
            continue

        alive = ping_host(ip_text)

        if not alive:
            continue

        open_ports = check_open_ports(ip_text)

        risk_score = 0
        risk_reasons = []

        if open_ports:
            risk_score += min(len(open_ports) * 10, 50)
            risk_reasons.append("Host has open common ports.")

        if 3389 in open_ports:
            risk_score += 30
            risk_reasons.append("Remote Desktop port is open.")

        if 445 in open_ports:
            risk_score += 20
            risk_reasons.append("SMB port is open.")

        risk_score = min(risk_score, 100)

        if risk_score >= 70:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        elif risk_score > 0:
            risk_level = "LOW"
        else:
            risk_level = "INFO"

        detected_hosts.append(
            {
                "ip": ip_text,
                "open_ports": open_ports,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "reasons": risk_reasons or ["Host responded to local discovery."],
            }
        )

    return {
        "status": "COMPLETE",
        "local_ip": local_ip,
        "private_range": str(network),
        "scanned_hosts_limit": 30,
        "detected_count": len(detected_hosts),
        "detected_hosts": detected_hosts,
        "note": "This scans only the backend machine's local /24 network. Full user-device visibility will require RavShield Agent.",
    }