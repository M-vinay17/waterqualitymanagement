# backend/app/routes/websocket.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.ws_manager import manager as ws_manager

router = APIRouter()


@router.websocket("/ws/alerts")
async def alert_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # keep connection alive — wait for any client message
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)