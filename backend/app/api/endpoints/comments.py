from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.article import Article
from app.models.comment import Comment
from app.schemas.comment import (
    NewCommentRequest,
    SingleCommentResponse,
    MultipleCommentsResponse,
    CommentData,
)
from app.schemas.profile import ProfileData
from app.api.deps import get_current_user_optional, get_current_user_required

router = APIRouter()

def make_comment_data(comment: Comment, current_user: Optional[User]) -> CommentData:
    is_following = False
    if current_user and comment.author in current_user.followed:
        is_following = True

    author_profile = ProfileData(
        username=comment.author.username,
        bio=comment.author.bio,
        image=comment.author.image,
        following=is_following,
    )

    return CommentData(
        id=comment.id,
        createdAt=comment.created_at,
        updatedAt=comment.updated_at,
        body=comment.body,
        author=author_profile,
    )

@router.get("/articles/{slug}/comments", response_model=MultipleCommentsResponse)
def get_comments(
    slug: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"article": ["not found"]}},
        )

    comments = db.query(Comment).filter(Comment.article_id == article.id).order_by(Comment.created_at.desc()).all()
    return MultipleCommentsResponse(
        comments=[make_comment_data(c, current_user) for c in comments]
    )

@router.post("/articles/{slug}/comments", response_model=SingleCommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    slug: str,
    payload: NewCommentRequest,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"article": ["not found"]}},
        )

    comment = Comment(
        body=payload.comment.body,
        article_id=article.id,
        author_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return SingleCommentResponse(comment=make_comment_data(comment, current_user))

@router.delete("/articles/{slug}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    slug: str,
    comment_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"article": ["not found"]}},
        )

    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.article_id == article.id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"comment": ["not found"]}},
        )

    if comment.author_id != current_user.id and article.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"errors": {"comment": ["forbidden"]}},
        )

    db.delete(comment)
    db.commit()
    return None
