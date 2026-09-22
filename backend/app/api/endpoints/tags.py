from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tag import Tag
from app.schemas.tag import TagsResponse

router = APIRouter()

@router.get("/tags", response_model=TagsResponse)
def get_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    tag_names = [t.name for t in tags]
    return TagsResponse(tags=tag_names)
