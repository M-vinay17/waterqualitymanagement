# backend/app/services/ws_manager.py

from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, data: dict):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(data))
            except Exception:
                disconnected.add(connection)
        # clean up dead connections
        self.active_connections -= disconnected


# ── singleton — import this everywhere ──
ws_manager = ConnectionManager()