from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import time
import asyncio
import uuid

app = FastAPI()

# ID unique du serveur - change à chaque redémarrage
server_id = str(uuid.uuid4())


# Gestionnaire de connexions WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Envoyer un message à tous les clients connectés"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}


@app.websocket("/ws/reload")
async def websocket_reload(websocket: WebSocket):
    """WebSocket pour notifier les clients des changements de fichiers"""
    await manager.connect(websocket)
    try:
        # Envoyer l'ID du serveur au client à la connexion
        await websocket.send_json({"type": "connected", "server_id": server_id})

        # Garder la connexion active avec heartbeat
        while True:
            await asyncio.sleep(5)
            await websocket.send_json({"type": "heartbeat", "server_id": server_id})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
