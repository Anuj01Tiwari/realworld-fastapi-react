from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.user import User
from app.models.article import Article
from app.models.tag import Tag
from app.schemas.article import (
    NewArticleRequest,
    UpdateArticleRequest,
    SingleArticleResponse,
    MultipleArticlesResponse,
    ArticleData,
)
from app.schemas.profile import ProfileData
from app.api.deps import get_current_user_optional, get_current_user_required
from app.core.slug import generate_slug

router = APIRouter()

def make_article_data(article: Article, current_user: Optional[User]) -> ArticleData:
    is_favorited = False
    if current_user and current_user in article.favorited_by:
        is_favorited = True

    is_following = False
    if current_user and article.author in current_user.followed:
        is_following = True

    author_profile = ProfileData(
        username=article.author.username,
        bio=article.author.bio,
        image=article.author.image,
        following=is_following,
    )

    tag_list = [tag.name for tag in article.tags]

    return ArticleData(
        slug=article.slug,
        title=article.title,
        description=article.description,
        body=article.body,
        tagList=tag_list,
        createdAt=article.created_at,
        updatedAt=article.updated_at,
        favorited=is_favorited,
        favoritesCount=len(article.favorited_by),
        author=author_profile,
    )

@router.get("/articles", response_model=MultipleArticlesResponse)
def get_articles(
    tag: Optional[str] = Query(None),
    author: Optional[str] = Query(None),
    favorited: Optional[str] = Query(None),
    limit: int = Query(20, ge=1),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    query = db.query(Article)

    if tag:
        query = query.filter(Article.tags.any(Tag.name == tag))

    if author:
        author_user = db.query(User).filter(User.username == author).first()
        if author_user:
            query = query.filter(Article.author_id == author_user.id)
        else:
            return MultipleArticlesResponse(articles=[], articlesCount=0)

    if favorited:
        fav_user = db.query(User).filter(User.username == favorited).first()
        if fav_user:
            query = query.filter(Article.favorited_by.any(User.id == fav_user.id))
        else:
            return MultipleArticlesResponse(articles=[], articlesCount=0)

    total_count = query.count()
    articles = query.order_by(desc(Article.created_at)).offset(offset).limit(limit).all()

    return MultipleArticlesResponse(
        articles=[make_article_data(a, current_user) for a in articles],
        articlesCount=total_count,
    )

@router.get("/articles/feed", response_model=MultipleArticlesResponse)
def get_articles_feed(
    limit: int = Query(20, ge=1),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    followed_ids = [u.id for u in current_user.followed]
    if not followed_ids:
        return MultipleArticlesResponse(articles=[], articlesCount=0)

    query = db.query(Article).filter(Article.author_id.in_(followed_ids))
    total_count = query.count()
    articles = query.order_by(desc(Article.created_at)).offset(offset).limit(limit).all()

    return MultipleArticlesResponse(
        articles=[make_article_data(a, current_user) for a in articles],
        articlesCount=total_count,
    )

@router.post("/articles", response_model=SingleArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    payload: NewArticleRequest,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    req_article = payload.article
    slug = generate_slug(req_article.title)

    article = Article(
        slug=slug,
        title=req_article.title,
        description=req_article.description,
        body=req_article.body,
        author_id=current_user.id,
    )

    if req_article.tagList:
        for tag_name in req_article.tagList:
            clean_tag_name = tag_name.strip()
            if not clean_tag_name:
                continue
            tag_obj = db.query(Tag).filter(Tag.name == clean_tag_name).first()
            if not tag_obj:
                tag_obj = Tag(name=clean_tag_name)
                db.add(tag_obj)
            article.tags.append(tag_obj)

    db.add(article)
    db.commit()
    db.refresh(article)

    return SingleArticleResponse(article=make_article_data(article, current_user))

@router.get("/articles/{slug}", response_model=SingleArticleResponse)
def get_article(
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
    return SingleArticleResponse(article=make_article_data(article, current_user))

@router.put("/articles/{slug}", response_model=SingleArticleResponse)
def update_article(
    slug: str,
    payload: UpdateArticleRequest,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"errors": {"article": ["not found"]}},
        )
    if article.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"errors": {"article": ["forbidden"]}},
        )

    req_article = payload.article
    if req_article.title is not None and req_article.title != article.title:
        article.title = req_article.title
        article.slug = generate_slug(req_article.title)

    if req_article.description is not None:
        article.description = req_article.description

    if req_article.body is not None:
        article.body = req_article.body

    if req_article.tagList is not None:
        article.tags.clear()
        for tag_name in req_article.tagList:
            clean_tag_name = tag_name.strip()
            if not clean_tag_name:
                continue
            tag_obj = db.query(Tag).filter(Tag.name == clean_tag_name).first()
            if not tag_obj:
                tag_obj = Tag(name=clean_tag_name)
                db.add(tag_obj)
            article.tags.append(tag_obj)

    db.add(article)
    db.commit()
    db.refresh(article)

    return SingleArticleResponse(article=make_article_data(article, current_user))

@router.delete("/articles/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
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
    if article.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"errors": {"article": ["forbidden"]}},
        )

    db.delete(article)
    db.commit()
    return None
