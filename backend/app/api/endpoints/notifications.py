from typing import Dict, List, Optional
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.article import Article
from app.models.notification import Notification
from app.schemas.notification import (
    NotificationData,
    NotificationListResponse,
    NotificationActorData,
    NotificationArticleData
)
from app.core.security import decode_access_token
from app.api.deps import get_current_user_required

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_notification(self, user_id: int, notification_data: dict):
        if user_id in self.active_connections:
            dead_sockets = []
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json(notification_data)
                except Exception:
                    dead_sockets.append(websocket)
            for ws in dead_sockets:
                self.disconnect(user_id, ws)

manager = ConnectionManager()

def format_notification(notification: Notification) -> NotificationData:
    actor_data = NotificationActorData(
        username=notification.actor.username,
        image=notification.actor.image
    )
    article_data = None
    if notification.article:
        article_data = NotificationArticleData(
            slug=notification.article.slug,
            title=notification.article.title
        )
    return NotificationData(
        id=notification.id,
        type=notification.type,
        actor=actor_data,
        article=article_data,
        is_read=notification.is_read,
        created_at=notification.created_at
    )

def create_and_send_notification(
    db: Session,
    recipient_id: int,
    actor_id: int,
    type: str,
    article_id: Optional[int] = None
) -> Optional[Notification]:
    if recipient_id == actor_id:
        return None

    notification = Notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        type=type,
        article_id=article_id,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Build payload for WebSocket push
    actor = db.query(User).filter(User.id == actor_id).first()
    article = db.query(Article).filter(Article.id == article_id).first() if article_id else None

    data = {
        "id": notification.id,
        "type": notification.type,
        "actor": {
            "username": actor.username if actor else "Unknown",
            "image": actor.image if actor else None
        },
        "article": {
            "slug": article.slug,
            "title": article.title
        } if article else None,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat()
    }

    if recipient_id in manager.active_connections:
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(manager.send_notification(recipient_id, data))
        except RuntimeError:
            try:
                asyncio.run(manager.send_notification(recipient_id, data))
            except Exception:
                pass

    return notification

@router.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    if not token:
        try:
            # Check if token is passed on first message
            await websocket.accept()
            msg = await asyncio.wait_for(websocket.receive_json(), timeout=5.0)
            token = msg.get("token")
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    else:
        await websocket.accept()

    user_id_str = decode_access_token(token) if token else None
    if not user_id_str:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        user_id = int(user_id_str)
    except ValueError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Add to connection manager
    if user_id not in manager.active_connections:
        manager.active_connections[user_id] = []
    manager.active_connections[user_id].append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception:
        manager.disconnect(user_id, websocket)

@router.get("/notifications", response_model=NotificationListResponse)
def get_notifications(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.recipient_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    unread_count = (
        db.query(Notification)
        .filter(Notification.recipient_id == current_user.id, Notification.is_read == False)
        .count()
    )

    return NotificationListResponse(
        notifications=[format_notification(n) for n in notifications],
        unread_count=unread_count
    )

@router.post("/notifications/{notification_id}/read", response_model=NotificationData)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.recipient_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"notification": ["not found"]}}
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return format_notification(notification)

@router.post("/notifications/read-all")
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()

    return {"message": "All notifications marked as read"}
