from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class NotificationActorData(BaseModel):
    username: str
    image: Optional[str] = None

class NotificationArticleData(BaseModel):
    slug: str
    title: str

class NotificationData(BaseModel):
    id: int
    type: str
    actor: NotificationActorData
    article: Optional[NotificationArticleData] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    notifications: List[NotificationData]
    unread_count: int
