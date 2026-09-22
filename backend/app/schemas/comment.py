from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.schemas.profile import ProfileData

class NewComment(BaseModel):
    body: str

class NewCommentRequest(BaseModel):
    comment: NewComment

class CommentData(BaseModel):
    id: int
    createdAt: datetime
    updatedAt: datetime
    body: str
    author: ProfileData

class SingleCommentResponse(BaseModel):
    comment: CommentData

class MultipleCommentsResponse(BaseModel):
    comments: List[CommentData]
