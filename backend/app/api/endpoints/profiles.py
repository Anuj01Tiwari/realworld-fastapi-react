from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileData
from app.api.deps import get_current_user_optional, get_current_user_required

from app.api.endpoints.notifications import create_and_send_notification

router = APIRouter()

def make_profile_response(target_user: User, current_user: Optional[User]) -> ProfileResponse:
    is_following = False
    if current_user and target_user in current_user.followed:
        is_following = True
    return ProfileResponse(
        profile=ProfileData(
            username=target_user.username,
            bio=target_user.bio,
            image=target_user.image,
            following=is_following,
        )
    )

@router.get("/profiles/{username}", response_model=ProfileResponse)
def get_profile(
    username: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"profile": ["not found"]}}
        )
    return make_profile_response(user, current_user)

@router.post("/profiles/{username}/follow", response_model=ProfileResponse)
def follow_user(
    username: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.username == username).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"profile": ["not found"]}}
        )
    if target_user not in current_user.followed:
        current_user.followed.append(target_user)
        db.commit()
        create_and_send_notification(db, recipient_id=target_user.id, actor_id=current_user.id, type="follow")
    return make_profile_response(target_user, current_user)

@router.delete("/profiles/{username}/follow", response_model=ProfileResponse)
def unfollow_user(
    username: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.username == username).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"profile": ["not found"]}}
        )
    if target_user in current_user.followed:
        current_user.followed.remove(target_user)
        db.commit()
    return make_profile_response(target_user, current_user)
