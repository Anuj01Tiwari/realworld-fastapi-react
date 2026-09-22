from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginUser(BaseModel):
    email: str
    password: str

class LoginUserRequest(BaseModel):
    user: LoginUser

class NewUser(BaseModel):
    username: str
    email: str
    password: str

class NewUserRequest(BaseModel):
    user: NewUser

class UpdateUser(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    image: Optional[str] = None

class UpdateUserRequest(BaseModel):
    user: UpdateUser

class UserResponseData(BaseModel):
    email: str
    token: str
    username: str
    bio: Optional[str] = None
    image: Optional[str] = None

class UserResponse(BaseModel):
    user: UserResponseData
