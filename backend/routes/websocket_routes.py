from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.websocket_manager import manager


router = APIRouter()


@router.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):

    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)