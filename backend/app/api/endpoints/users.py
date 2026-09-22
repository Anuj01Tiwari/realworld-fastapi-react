from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import (
    NewUserRequest,
    LoginUserRequest,
    UpdateUserRequest,
    UserResponse,
    UserResponseData
)
from app.api.deps import get_current_user_required

router = APIRouter()

def make_user_response(user: User, token: str = None) -> UserResponse:
    if not token:
        token = create_access_token(user.id)
    return UserResponse(
        user=UserResponseData(
            email=user.email,
            token=token,
            username=user.username,
            bio=user.bio,
            image=user.image,
        )
    )

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: NewUserRequest, db: Session = Depends(get_db)):
    req_user = payload.user
    # Check for existing username or email
    if db.query(User).filter(User.username == req_user.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"errors": {"username": ["has already been taken"]}}
        )
    if db.query(User).filter(User.email == req_user.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"errors": {"email": ["has already been taken"]}}
        )

    db_user = User(
        username=req_user.username,
        email=req_user.email,
        password_hash=get_password_hash(req_user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token(db_user.id)
    return make_user_response(db_user, token)

@router.post("/users/login", response_model=UserResponse)
def login_user(payload: LoginUserRequest, db: Session = Depends(get_db)):
    req_user = payload.user
    user = db.query(User).filter(User.email == req_user.email).first()
    if not user or not verify_password(req_user.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"errors": {"email or password": ["is invalid"]}}
        )
    token = create_access_token(user.id)
    return make_user_response(user, token)

@router.get("/user", response_model=UserResponse)
def get_current_user(current_user: User = Depends(get_current_user_required)):
    return make_user_response(current_user)

@router.put("/user", response_model=UserResponse)
def update_current_user(
    payload: UpdateUserRequest,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    update_data = payload.user
    if update_data.username is not None and update_data.username != current_user.username:
        existing = db.query(User).filter(User.username == update_data.username).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"errors": {"username": ["has already been taken"]}}
            )
        current_user.username = update_data.username

    if update_data.email is not None and update_data.email != current_user.email:
        existing = db.query(User).filter(User.email == update_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"errors": {"email": ["has already been taken"]}}
            )
        current_user.email = update_data.email

    if update_data.password is not None:
        current_user.password_hash = get_password_hash(update_data.password)

    if update_data.bio is not None:
        current_user.bio = update_data.bio

    if update_data.image is not None:
        current_user.image = update_data.image

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return make_user_response(current_user)
