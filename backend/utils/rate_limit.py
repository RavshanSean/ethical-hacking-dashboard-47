"""Simple in-memory rate limiting for auth and scan endpoints."""

from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request


class RateLimiter:
    def __init__(self, max_calls: int, period_seconds: float):
        self.max_calls = max_calls
        self.period_seconds = period_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        bucket = self._hits[key]

        while bucket and bucket[0] <= now - self.period_seconds:
            bucket.popleft()

        if len(bucket) >= self.max_calls:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
            )

        bucket.append(now)


auth_rate_limiter = RateLimiter(max_calls=10, period_seconds=60)
scan_rate_limiter = RateLimiter(max_calls=20, period_seconds=60)
discovery_rate_limiter = RateLimiter(max_calls=3, period_seconds=60)


def client_key(request: Request, prefix: str = "") -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    return f"{prefix}:{ip}"
