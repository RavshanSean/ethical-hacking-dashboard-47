"""SSRF protections for outbound scan / lookup targets."""

from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse

from fastapi import HTTPException


BLOCKED_HOSTNAMES = {
    "localhost",
    "localhost.localdomain",
    "metadata.google.internal",
    "metadata",
    "kubernetes.default",
    "kubernetes.default.svc",
}

# Extra networks beyond ipaddress private/reserved helpers.
BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]


def is_blocked_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return True

    if (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    ):
        return True

    return any(ip in network for network in BLOCKED_NETWORKS)


def _hostname_is_blocked(hostname: str) -> bool:
    host = hostname.strip(".").lower()
    if not host:
        return True
    if host in BLOCKED_HOSTNAMES:
        return True
    if host.endswith(".localhost") or host.endswith(".local") or host.endswith(".internal"):
        return True

    try:
        if is_blocked_ip(host):
            return True
    except Exception:
        pass

    return False


def resolve_and_validate_host(hostname: str) -> list[str]:
    if _hostname_is_blocked(hostname):
        raise HTTPException(
            status_code=400,
            detail="Target host is blocked for security reasons",
        )

    try:
        addrinfo = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to resolve host: {hostname}",
        ) from exc

    resolved: list[str] = []
    for info in addrinfo:
        ip = info[4][0]
        if is_blocked_ip(ip):
            raise HTTPException(
                status_code=400,
                detail="Target resolves to a private or blocked address",
            )
        if ip not in resolved:
            resolved.append(ip)

    if not resolved:
        raise HTTPException(status_code=400, detail="Unable to resolve host")

    return resolved


def normalize_http_url(url: str) -> str:
    value = (url or "").strip()
    if not value:
        raise HTTPException(status_code=400, detail="URL is required")

    if value.startswith("file:") or value.startswith("//"):
        raise HTTPException(status_code=400, detail="Unsupported URL scheme")

    if not value.startswith(("http://", "https://")):
        value = f"https://{value}"

    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=400,
            detail="Only http and https URLs are allowed",
        )

    if not parsed.hostname:
        raise HTTPException(status_code=400, detail="URL must include a hostname")

    if parsed.username or parsed.password:
        raise HTTPException(
            status_code=400,
            detail="URLs with embedded credentials are not allowed",
        )

    return value


def validate_scan_url(url: str) -> str:
    """Normalize and ensure the URL host does not resolve to blocked addresses."""
    normalized = normalize_http_url(url)
    hostname = urlparse(normalized).hostname
    assert hostname is not None
    resolve_and_validate_host(hostname)
    return normalized


def validate_public_ip(ip: str) -> str:
    value = (ip or "").strip()
    if not value or is_blocked_ip(value):
        raise HTTPException(
            status_code=400,
            detail="IP lookup is limited to public addresses",
        )
    return value
