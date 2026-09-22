from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.article import Article
from app.schemas.article import SingleArticleResponse
from app.api.endpoints.articles import make_article_data
from app.api.deps import get_current_user_required

router = APIRouter()

@router.post("/articles/{slug}/favorite", response_model=SingleArticleResponse)
def favorite_article(
    slug: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"article": ["not found"]}},
        )

    if current_user not in article.favorited_by:
        article.favorited_by.append(current_user)
        db.commit()
        db.refresh(article)

    return SingleArticleResponse(article=make_article_data(article, current_user))

@router.delete("/articles/{slug}/favorite", response_model=SingleArticleResponse)
def unfavorite_article(
    slug: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"article": ["not found"]}},
        )

    if current_user in article.favorited_by:
        article.favorited_by.remove(current_user)
        db.commit()
        db.refresh(article)

    return SingleArticleResponse(article=make_article_data(article, current_user))
