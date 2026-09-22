from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.profile import ProfileData

class NewArticle(BaseModel):
    title: str
    description: str
    body: str
    tagList: Optional[List[str]] = []

class NewArticleRequest(BaseModel):
    article: NewArticle

class UpdateArticle(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    body: Optional[str] = None
    tagList: Optional[List[str]] = None

class UpdateArticleRequest(BaseModel):
    article: UpdateArticle

class ArticleData(BaseModel):
    slug: str
    title: str
    description: str
    body: str
    tagList: List[str]
    createdAt: datetime
    updatedAt: datetime
    favorited: bool
    favoritesCount: int
    author: ProfileData

    class Config:
        populate_by_name = True

class SingleArticleResponse(BaseModel):
    article: ArticleData

class MultipleArticlesResponse(BaseModel):
    articles: List[ArticleData]
    articlesCount: int
