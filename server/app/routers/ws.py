import json
from collections import defaultdict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.database import async_session
from app.models.user import User
from app.services.auth import decode_token

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections and node locks per mindmap room."""

    def __init__(self):
        # mindmap_id -> list of (websocket, user_info)
        self.rooms: dict[str, list[tuple[WebSocket, dict]]] = defaultdict(list)
        # mindmap_id -> { node_uid: { user_id, display_name } }
        self.locks: dict[str, dict[str, dict]] = defaultdict(dict)

    async def connect(self, mindmap_id: str, ws: WebSocket, user_info: dict):
        await ws.accept()
        self.rooms[mindmap_id].append((ws, user_info))
        # Send current lock state to the new connection
        if self.locks[mindmap_id]:
            await ws.send_json({
                "type": "lock_state_sync",
                "locks": self.locks[mindmap_id]
            })

    def disconnect(self, mindmap_id: str, ws: WebSocket):
        user_info = None
        remaining = []
        for w, u in self.rooms.get(mindmap_id, []):
            if w == ws:
                user_info = u
            else:
                remaining.append((w, u))
        self.rooms[mindmap_id] = remaining

        if not self.rooms[mindmap_id]:
            del self.rooms[mindmap_id]
            self.locks.pop(mindmap_id, None)
            return user_info, []

        # Release all locks held by this user
        released = []
        if user_info:
            locks = self.locks.get(mindmap_id, {})
            to_release = [
                uid for uid, info in locks.items()
                if info["user_id"] == user_info["user_id"]
            ]
            for uid in to_release:
                del locks[uid]
                released.append(uid)

        return user_info, released

    def try_lock(self, mindmap_id: str, node_uid: str, user_info: dict) -> dict | None:
        """Try to lock a node. Returns None on success, or the current locker info on failure."""
        locks = self.locks[mindmap_id]
        existing = locks.get(node_uid)
        if existing and existing["user_id"] != user_info["user_id"]:
            return existing
        locks[node_uid] = {
            "user_id": user_info["user_id"],
            "display_name": user_info["display_name"]
        }
        return None

    def unlock(self, mindmap_id: str, node_uid: str, user_info: dict) -> bool:
        """Unlock a node. Returns True if unlocked successfully."""
        locks = self.locks.get(mindmap_id, {})
        existing = locks.get(node_uid)
        if existing and existing["user_id"] == user_info["user_id"]:
            del locks[node_uid]
            return True
        return False

    async def broadcast(self, mindmap_id: str, message: dict, exclude: WebSocket | None = None):
        dead = []
        for ws, _user in self.rooms.get(mindmap_id, []):
            if ws == exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        # Clean up dead connections
        for ws in dead:
            self.disconnect(mindmap_id, ws)


manager = ConnectionManager()


async def authenticate_ws(token: str) -> dict | None:
    """Validate JWT token and return user info."""
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    async with async_session() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return {
            "user_id": user.id,
            "display_name": user.display_name
        }


@router.websocket("/api/ws/{mindmap_id}")
async def websocket_endpoint(websocket: WebSocket, mindmap_id: str):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    user_info = await authenticate_ws(token)
    if not user_info:
        await websocket.close(code=4001, reason="Invalid token")
        return

    await manager.connect(mindmap_id, websocket, user_info)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif msg_type == "lock_node":
                node_uid = data.get("node_uid")
                if not node_uid:
                    continue
                blocker = manager.try_lock(mindmap_id, node_uid, user_info)
                if blocker:
                    await websocket.send_json({
                        "type": "lock_failed",
                        "node_uid": node_uid,
                        "locked_by": blocker
                    })
                else:
                    await websocket.send_json({
                        "type": "lock_success",
                        "node_uid": node_uid
                    })
                    await manager.broadcast(mindmap_id, {
                        "type": "node_locked",
                        "node_uid": node_uid,
                        "locked_by": {
                            "user_id": user_info["user_id"],
                            "display_name": user_info["display_name"]
                        }
                    }, exclude=websocket)

            elif msg_type == "unlock_node":
                node_uid = data.get("node_uid")
                if not node_uid:
                    continue
                if manager.unlock(mindmap_id, node_uid, user_info):
                    await manager.broadcast(mindmap_id, {
                        "type": "node_unlocked",
                        "node_uid": node_uid
                    })

    except WebSocketDisconnect:
        user_info, released = manager.disconnect(mindmap_id, websocket)
        for uid in released:
            await manager.broadcast(mindmap_id, {
                "type": "node_unlocked",
                "node_uid": uid
            })
    except Exception:
        user_info, released = manager.disconnect(mindmap_id, websocket)
        for uid in released:
            await manager.broadcast(mindmap_id, {
                "type": "node_unlocked",
                "node_uid": uid
            })
