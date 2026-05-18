from fastapi import WebSocket


# Stores all connected frontend clients
active_connections = []


class ConnectionManager:

    async def connect(self, websocket: WebSocket):
        """
        Accept new WebSocket connection.
        """

        await websocket.accept()

        active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """
        Remove disconnected client.
        """

        if websocket in active_connections:
            active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """
        Send event to all connected clients.
        """

        disconnected = []

        for connection in active_connections:
            try:
                await connection.send_json(message)

            except Exception:
                disconnected.append(connection)

        # Cleanup dead connections
        for connection in disconnected:
            self.disconnect(connection)


# Global WebSocket manager instance
manager = ConnectionManager()