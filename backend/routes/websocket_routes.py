from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from services.websocket_manager import manager
from utils.auth_utils import get_current_user_from_token
from utils.settings_service import get_app_settings


router = APIRouter()


@router.websocket("/ws/events")
async def websocket_events(websocket: WebSocket, token: str | None = None):
    settings = get_app_settings()
    if not settings.get("websocket_enabled", True):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        get_current_user_from_token(token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
