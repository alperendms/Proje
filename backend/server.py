from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import phonenumbers
import base64
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str = ""
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    phone: Optional[str] = None
    language: str = "en"
    social_links: Optional[dict] = {}
    followers_count: int = 0
    following_count: int = 0
    quotes_count: int = 0
    score: int = 0
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    phone: Optional[str] = None
    language: str = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    social_links: Optional[dict] = {}
    followers_count: int = 0
    following_count: int = 0
    quotes_count: int = 0
    score: int = 0
    is_admin: bool = False
    created_at: datetime

class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    author: Optional[str] = None
    category_id: Optional[str] = None
    tags: List[str] = []
    likes_count: int = 0
    saves_count: int = 0
    views_count: int = 0
    shares_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    content: str
    author: Optional[str] = None
    category_id: Optional[str] = None
    tags: List[str] = []

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    quotes_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: str
    content: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class Follow(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    follower_id: str
    following_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Like(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    quote_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Save(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    quote_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BackgroundImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # 'story' or 'post'
    url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "admin_settings"
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Blog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    published: bool = True

class Language(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    native_name: str
    enabled: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LanguageCreate(BaseModel):
    code: str
    name: str
    native_name: str
    enabled: bool = True

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # 'like', 'follow', 'message', 'system'
    title: str
    message: str
    link: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    link: Optional[str] = None

class SystemSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "system_settings"
    # reCAPTCHA settings
    recaptcha_enabled: bool = False
    recaptcha_site_key: Optional[str] = None
    recaptcha_secret_key: Optional[str] = None
    # Twilio SMS settings
    sms_enabled: bool = False
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    # Email/SMTP settings
    email_enabled: bool = False
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: Optional[str] = None
    # Homepage content counts
    homepage_quotes_count: int = 5
    homepage_categories_count: int = 5
    homepage_users_count: int = 5
    homepage_blogs_count: int = 4
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SystemSettingsUpdate(BaseModel):
    recaptcha_enabled: Optional[bool] = None
    recaptcha_site_key: Optional[str] = None
    recaptcha_secret_key: Optional[str] = None
    sms_enabled: Optional[bool] = None
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    email_enabled: Optional[bool] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: Optional[str] = None
    homepage_quotes_count: Optional[int] = None
    homepage_categories_count: Optional[int] = None
    homepage_users_count: Optional[int] = None
    homepage_blogs_count: Optional[int] = None

class UserSettingsUpdate(BaseModel):
    bio: Optional[str] = None
    social_links: Optional[dict] = None
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    language: Optional[str] = None

# ============= AUTH UTILS =============

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"$or": [{"email": user_data.email}, {"username": user_data.username}]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already exists")
    
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password),
        full_name=user_data.full_name,
        country=user_data.country,
        phone=user_data.phone,
        country_code=user_data.country_code,
        language=user_data.language,
        social_links={}
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_access_token({"sub": user.id})
    
    return {"token": token, "user": UserProfile(**user.model_dump())}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    
    if not pwd_context.verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.id})
    
    return {"token": token, "user": UserProfile(**user.model_dump())}

@api_router.get("/auth/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(**current_user.model_dump())

# ============= USER ROUTES =============

@api_router.get("/users/{user_id}", response_model=UserProfile)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return UserProfile(**user)

@api_router.put("/users/profile")
async def update_profile(full_name: Optional[str] = None, bio: Optional[str] = None, 
                        avatar: Optional[str] = None, current_user: User = Depends(get_current_user)):
    update_data = {}
    if full_name is not None:
        update_data['full_name'] = full_name
    if bio is not None:
        update_data['bio'] = bio
    if avatar is not None:
        update_data['avatar'] = avatar
    
    await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    return {"message": "Profile updated"}

# ============= QUOTE ROUTES =============

@api_router.post("/quotes")
async def create_quote(quote_data: QuoteCreate, current_user: User = Depends(get_current_user)):
    quote = Quote(
        user_id=current_user.id,
        content=quote_data.content,
        author=quote_data.author,
        category_id=quote_data.category_id,
        tags=quote_data.tags
    )
    
    doc = quote.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.quotes.insert_one(doc)
    
    await db.users.update_one({"id": current_user.id}, {"$inc": {"quotes_count": 1}})
    if quote_data.category_id:
        await db.categories.update_one({"id": quote_data.category_id}, {"$inc": {"quotes_count": 1}})
    
    return quote

@api_router.get("/quotes")
async def get_quotes(skip: int = 0, limit: int = 20, category_id: Optional[str] = None, 
                    search: Optional[str] = None, user_id: Optional[str] = None):
    query = {}
    if category_id:
        query['category_id'] = category_id
    if user_id:
        query['user_id'] = user_id
    if search:
        query['$or'] = [
            {'content': {'$regex': search, '$options': 'i'}},
            {'author': {'$regex': search, '$options': 'i'}},
            {'tags': {'$in': [re.compile(search, re.IGNORECASE)]}}
        ]
    
    quotes = await db.quotes.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for q in quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes

@api_router.get("/quotes/{quote_id}")
async def get_quote(quote_id: str):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if isinstance(quote['created_at'], str):
        quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    
    await db.quotes.update_one({"id": quote_id}, {"$inc": {"views_count": 1}})
    return quote

@api_router.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: str, current_user: User = Depends(get_current_user)):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote['user_id'] != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.quotes.delete_one({"id": quote_id})
    await db.users.update_one({"id": quote['user_id']}, {"$inc": {"quotes_count": -1}})
    if quote.get('category_id'):
        await db.categories.update_one({"id": quote['category_id']}, {"$inc": {"quotes_count": -1}})
    
    return {"message": "Quote deleted"}

# ============= CATEGORY ROUTES =============

@api_router.post("/categories")
async def create_category(category_data: CategoryCreate, current_user: User = Depends(get_current_admin)):
    slug = category_data.name.lower().replace(" ", "-")
    existing = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = Category(
        name=category_data.name,
        slug=slug,
        description=category_data.description,
        parent_id=category_data.parent_id,
        icon=category_data.icon
    )
    
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

@api_router.get("/categories")
async def get_categories(parent_id: Optional[str] = None):
    query = {"parent_id": parent_id}
    categories = await db.categories.find(query, {"_id": 0}).sort("name", 1).to_list(1000)
    for c in categories:
        if isinstance(c['created_at'], str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return categories

@api_router.get("/categories/{category_id}")
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if isinstance(category['created_at'], str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    return category

# ============= LIKE/SAVE ROUTES =============

@api_router.post("/quotes/{quote_id}/like")
async def like_quote(quote_id: str, current_user: User = Depends(get_current_user)):
    existing = await db.likes.find_one({"user_id": current_user.id, "quote_id": quote_id}, {"_id": 0})
    if existing:
        await db.likes.delete_one({"user_id": current_user.id, "quote_id": quote_id})
        await db.quotes.update_one({"id": quote_id}, {"$inc": {"likes_count": -1}})
        return {"liked": False}
    
    like = Like(user_id=current_user.id, quote_id=quote_id)
    doc = like.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.likes.insert_one(doc)
    await db.quotes.update_one({"id": quote_id}, {"$inc": {"likes_count": 1}})
    return {"liked": True}

@api_router.post("/quotes/{quote_id}/save")
async def save_quote(quote_id: str, current_user: User = Depends(get_current_user)):
    existing = await db.saves.find_one({"user_id": current_user.id, "quote_id": quote_id}, {"_id": 0})
    if existing:
        await db.saves.delete_one({"user_id": current_user.id, "quote_id": quote_id})
        await db.quotes.update_one({"id": quote_id}, {"$inc": {"saves_count": -1}})
        return {"saved": False}
    
    save = Save(user_id=current_user.id, quote_id=quote_id)
    doc = save.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.saves.insert_one(doc)
    await db.quotes.update_one({"id": quote_id}, {"$inc": {"saves_count": 1}})
    return {"saved": True}

@api_router.get("/quotes/{quote_id}/status")
async def get_quote_status(quote_id: str, current_user: User = Depends(get_current_user)):
    liked = await db.likes.find_one({"user_id": current_user.id, "quote_id": quote_id}, {"_id": 0})
    saved = await db.saves.find_one({"user_id": current_user.id, "quote_id": quote_id}, {"_id": 0})
    return {"liked": bool(liked), "saved": bool(saved)}

# ============= DISCOVER ROUTES =============

@api_router.get("/discover/trending")
async def get_trending():
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    trending_quotes = await db.quotes.find(
        {"created_at": {"$gte": today.isoformat()}},
        {"_id": 0}
    ).sort("views_count", -1).limit(5).to_list(5)
    
    for q in trending_quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    
    return trending_quotes

@api_router.get("/discover/liked")
async def get_most_liked(skip: int = 0, limit: int = 20):
    quotes = await db.quotes.find({}, {"_id": 0}).sort("likes_count", -1).skip(skip).limit(limit).to_list(limit)
    for q in quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes

@api_router.get("/discover/saved")
async def get_most_saved(skip: int = 0, limit: int = 20):
    quotes = await db.quotes.find({}, {"_id": 0}).sort("saves_count", -1).skip(skip).limit(limit).to_list(limit)
    for q in quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes

@api_router.get("/discover/viewed")
async def get_most_viewed(skip: int = 0, limit: int = 20):
    quotes = await db.quotes.find({}, {"_id": 0}).sort("views_count", -1).skip(skip).limit(limit).to_list(limit)
    for q in quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes

@api_router.get("/user/saved")
async def get_user_saved(current_user: User = Depends(get_current_user)):
    saves = await db.saves.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    quote_ids = [s['quote_id'] for s in saves]
    quotes = await db.quotes.find({"id": {"$in": quote_ids}}, {"_id": 0}).to_list(1000)
    for q in quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes

# ============= FOLLOW ROUTES =============

@api_router.post("/users/{user_id}/follow")
async def follow_user(user_id: str, current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    existing = await db.follows.find_one({"follower_id": current_user.id, "following_id": user_id}, {"_id": 0})
    if existing:
        await db.follows.delete_one({"follower_id": current_user.id, "following_id": user_id})
        await db.users.update_one({"id": current_user.id}, {"$inc": {"following_count": -1}})
        await db.users.update_one({"id": user_id}, {"$inc": {"followers_count": -1}})
        return {"following": False}
    
    follow = Follow(follower_id=current_user.id, following_id=user_id)
    doc = follow.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.follows.insert_one(doc)
    await db.users.update_one({"id": current_user.id}, {"$inc": {"following_count": 1}})
    await db.users.update_one({"id": user_id}, {"$inc": {"followers_count": 1}})
    return {"following": True}

@api_router.get("/users/{user_id}/follow-status")
async def get_follow_status(user_id: str, current_user: User = Depends(get_current_user)):
    following = await db.follows.find_one({"follower_id": current_user.id, "following_id": user_id}, {"_id": 0})
    return {"following": bool(following)}

# ============= MESSAGE ROUTES =============

@api_router.post("/messages")
async def send_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    message = Message(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        content=message_data.content
    )
    
    doc = message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.messages.insert_one(doc)
    return message

@api_router.get("/messages/conversations")
async def get_conversations(current_user: User = Depends(get_current_user)):
    pipeline = [
        {"$match": {"$or": [{"sender_id": current_user.id}, {"receiver_id": current_user.id}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": {
                "$cond": [
                    {"$eq": ["$sender_id", current_user.id]},
                    "$receiver_id",
                    "$sender_id"
                ]
            },
            "last_message": {"$first": "$$ROOT"}
        }}
    ]
    
    result = await db.messages.aggregate(pipeline).to_list(1000)
    conversations = []
    for r in result:
        user_id = r['_id']
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if user:
            if isinstance(r['last_message']['created_at'], str):
                r['last_message']['created_at'] = datetime.fromisoformat(r['last_message']['created_at'])
            conversations.append({
                "user": user,
                "last_message": r['last_message']
            })
    return conversations

@api_router.get("/messages/{user_id}")
async def get_messages(user_id: str, current_user: User = Depends(get_current_user)):
    messages = await db.messages.find({
        "$or": [
            {"sender_id": current_user.id, "receiver_id": user_id},
            {"sender_id": user_id, "receiver_id": current_user.id}
        ]
    }, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    for m in messages:
        if isinstance(m['created_at'], str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    
    await db.messages.update_many(
        {"sender_id": user_id, "receiver_id": current_user.id, "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

@api_router.get("/messages/unread/count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    count = await db.messages.count_documents({"receiver_id": current_user.id, "read": False})
    return {"count": count}

# ============= RANKING ROUTES =============

@api_router.get("/ranking")
async def get_ranking(period: str = "daily"):
    now = datetime.now(timezone.utc)
    
    if period == "daily":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "monthly":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "yearly":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    
    rankings = []
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        quotes = await db.quotes.find({
            "user_id": user['id'],
            "created_at": {"$gte": start.isoformat()}
        }, {"_id": 0}).to_list(1000)
        
        total_views = sum(q.get('views_count', 0) for q in quotes)
        total_likes = sum(q.get('likes_count', 0) for q in quotes)
        total_saves = sum(q.get('saves_count', 0) for q in quotes)
        quotes_count = len(quotes)
        
        score = (quotes_count * 10) + (total_views * 1) + (total_likes * 5) + (total_saves * 8)
        
        rankings.append({
            "user": UserProfile(**user),
            "quotes_count": quotes_count,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_saves": total_saves,
            "score": score
        })
    
    rankings.sort(key=lambda x: x['score'], reverse=True)
    return rankings[:50]

# ============= ADMIN ROUTES =============

@api_router.get("/admin/settings")
async def get_admin_settings(current_user: User = Depends(get_current_admin)):
    settings = await db.admin_settings.find_one({"id": "admin_settings"}, {"_id": 0})
    if not settings:
        settings = AdminSettings().model_dump()
        settings['updated_at'] = settings['updated_at'].isoformat()
        await db.admin_settings.insert_one(settings)
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.put("/admin/settings")
async def update_admin_settings(smtp_host: Optional[str] = None, smtp_port: Optional[int] = None,
                               smtp_user: Optional[str] = None, smtp_password: Optional[str] = None,
                               smtp_from: Optional[str] = None, current_user: User = Depends(get_current_admin)):
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if smtp_host is not None:
        update_data['smtp_host'] = smtp_host
    if smtp_port is not None:
        update_data['smtp_port'] = smtp_port
    if smtp_user is not None:
        update_data['smtp_user'] = smtp_user
    if smtp_password is not None:
        update_data['smtp_password'] = smtp_password
    if smtp_from is not None:
        update_data['smtp_from'] = smtp_from
    
    await db.admin_settings.update_one({"id": "admin_settings"}, {"$set": update_data}, upsert=True)
    return {"message": "Settings updated"}

@api_router.post("/admin/backgrounds")
async def add_background(type: str, url: str, current_user: User = Depends(get_current_admin)):
    if type not in ['story', 'post']:
        raise HTTPException(status_code=400, detail="Type must be 'story' or 'post'")
    
    bg = BackgroundImage(type=type, url=url)
    doc = bg.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.backgrounds.insert_one(doc)
    return bg

@api_router.get("/backgrounds")
async def get_backgrounds(type: Optional[str] = None):
    query = {}
    if type:
        query['type'] = type
    backgrounds = await db.backgrounds.find(query, {"_id": 0}).to_list(1000)
    for bg in backgrounds:
        if isinstance(bg['created_at'], str):
            bg['created_at'] = datetime.fromisoformat(bg['created_at'])
    return backgrounds

@api_router.delete("/admin/backgrounds/{bg_id}")
async def delete_background(bg_id: str, current_user: User = Depends(get_current_admin)):
    await db.backgrounds.delete_one({"id": bg_id})
    return {"message": "Background deleted"}

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_admin)):
    users_count = await db.users.count_documents({})
    quotes_count = await db.quotes.count_documents({})
    categories_count = await db.categories.count_documents({})
    messages_count = await db.messages.count_documents({})
    
    return {
        "users_count": users_count,
        "quotes_count": quotes_count,
        "categories_count": categories_count,
        "messages_count": messages_count
    }

# ============= HOME PAGE DATA =============

# ============= BLOG ROUTES =============

@api_router.post("/admin/blogs")
async def create_blog(blog_data: BlogCreate, current_user: User = Depends(get_current_admin)):
    slug = blog_data.title.lower().replace(" ", "-").replace("'", "")
    existing = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if existing:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    
    blog = Blog(
        title=blog_data.title,
        slug=slug,
        content=blog_data.content,
        excerpt=blog_data.excerpt,
        featured_image=blog_data.featured_image,
        published=blog_data.published
    )
    
    doc = blog.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blogs.insert_one(doc)
    return blog

@api_router.get("/blogs")
async def get_blogs(skip: int = 0, limit: int = 20, published_only: bool = True):
    query = {"published": True} if published_only else {}
    blogs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for b in blogs:
        if isinstance(b['created_at'], str):
            b['created_at'] = datetime.fromisoformat(b['created_at'])
        if isinstance(b['updated_at'], str):
            b['updated_at'] = datetime.fromisoformat(b['updated_at'])
    return blogs

@api_router.get("/blogs/{blog_id}")
async def get_blog(blog_id: str):
    blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if isinstance(blog['created_at'], str):
        blog['created_at'] = datetime.fromisoformat(blog['created_at'])
    if isinstance(blog['updated_at'], str):
        blog['updated_at'] = datetime.fromisoformat(blog['updated_at'])
    return blog

@api_router.put("/admin/blogs/{blog_id}")
async def update_blog(blog_id: str, blog_data: BlogCreate, current_user: User = Depends(get_current_admin)):
    update_data = {
        "title": blog_data.title,
        "content": blog_data.content,
        "excerpt": blog_data.excerpt,
        "featured_image": blog_data.featured_image,
        "published": blog_data.published,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.blogs.update_one({"id": blog_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"message": "Blog updated"}

@api_router.delete("/admin/blogs/{blog_id}")
async def delete_blog(blog_id: str, current_user: User = Depends(get_current_admin)):
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"message": "Blog deleted"}

# ============= HOME PAGE DATA =============

@api_router.get("/home")
async def get_home_data():
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Trending quotes
    trending_quotes = await db.quotes.find(
        {"created_at": {"$gte": today.isoformat()}},
        {"_id": 0}
    ).sort("views_count", -1).limit(5).to_list(5)
    
    for q in trending_quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    
    # Trending categories
    categories = await db.categories.find({}, {"_id": 0}).sort("quotes_count", -1).limit(5).to_list(5)
    for c in categories:
        if isinstance(c['created_at'], str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    
    # Trending users
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("followers_count", -1).limit(5).to_list(5)
    for u in users:
        if isinstance(u['created_at'], str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
    
    # Recent blogs
    blogs = await db.blogs.find({"published": True}, {"_id": 0}).sort("created_at", -1).limit(4).to_list(4)
    for b in blogs:
        if isinstance(b['created_at'], str):
            b['created_at'] = datetime.fromisoformat(b['created_at'])
        if isinstance(b['updated_at'], str):
            b['updated_at'] = datetime.fromisoformat(b['updated_at'])
    
    return {
        "trending_quotes": trending_quotes,
        "trending_categories": categories,
        "trending_users": users,
        "recent_blogs": blogs
    }

# ============= LANGUAGE ROUTES =============

@api_router.get("/languages")
async def get_languages():
    languages = await db.languages.find({"enabled": True}, {"_id": 0}).to_list(None)
    for lang in languages:
        if isinstance(lang['created_at'], str):
            lang['created_at'] = datetime.fromisoformat(lang['created_at'])
    return languages

@api_router.post("/admin/languages")
async def create_language(lang_data: LanguageCreate, current_user: User = Depends(get_current_admin)):
    existing = await db.languages.find_one({"code": lang_data.code}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Language code already exists")
    
    language = Language(**lang_data.model_dump())
    doc = language.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.languages.insert_one(doc)
    return language

@api_router.put("/admin/languages/{lang_id}")
async def update_language(lang_id: str, lang_data: LanguageCreate, current_user: User = Depends(get_current_admin)):
    update_data = {**lang_data.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}
    result = await db.languages.update_one({"id": lang_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Language not found")
    return {"message": "Language updated"}

@api_router.delete("/admin/languages/{lang_id}")
async def delete_language(lang_id: str, current_user: User = Depends(get_current_admin)):
    result = await db.languages.delete_one({"id": lang_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Language not found")
    return {"message": "Language deleted"}

# ============= NOTIFICATION ROUTES =============

@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user.id}, 
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    for n in notifications:
        if isinstance(n['created_at'], str):
            n['created_at'] = datetime.fromisoformat(n['created_at'])
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.post("/admin/notifications/broadcast")
async def broadcast_notification(notification: NotificationCreate, current_user: User = Depends(get_current_admin)):
    # Send notification to all users
    users = await db.users.find({}, {"_id": 0, "id": 1}).to_list(None)
    notifications = []
    for user in users:
        notif = Notification(
            user_id=user['id'],
            type=notification.type,
            title=notification.title,
            message=notification.message,
            link=notification.link
        )
        doc = notif.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        notifications.append(doc)
    
    if notifications:
        await db.notifications.insert_many(notifications)
    return {"message": f"Sent {len(notifications)} notifications"}

@api_router.post("/notifications")
async def create_notification(notification: NotificationCreate, current_user: User = Depends(get_current_user)):
    notif = Notification(**notification.model_dump())
    doc = notif.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)
    return notif

# ============= SETTINGS ROUTES =============

@api_router.get("/settings/system")
async def get_system_settings():
    settings = await db.system_settings.find_one({"id": "system_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        return SystemSettings().model_dump()
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.put("/admin/settings/system")
async def update_system_settings(settings_data: SystemSettingsUpdate, current_user: User = Depends(get_current_admin)):
    update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.system_settings.update_one(
        {"id": "system_settings"},
        {"$set": update_data},
        upsert=True
    )
    return {"message": "Settings updated"}

@api_router.put("/settings/user")
async def update_user_settings(settings_data: UserSettingsUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    
    return {"message": "User settings updated"}

# ============= SHARE QUOTE ROUTE =============

@api_router.get("/quotes/{quote_id}/share")
async def get_share_data(quote_id: str):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Get user data
    user = await db.users.find_one({"id": quote['user_id']}, {"_id": 0, "password_hash": 0})
    if isinstance(quote['created_at'], str):
        quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    
    return {
        "quote": quote,
        "user": user,
        "share_url": f"/quote/{quote_id}"
    }

# ============= ADMIN USER MANAGEMENT =============

@api_router.get("/admin/users")
async def get_all_users(skip: int = 0, limit: int = 50, current_user: User = Depends(get_current_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    for u in users:
        if isinstance(u['created_at'], str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
    return users

@api_router.put("/admin/users/{user_id}/score")
async def update_user_score(user_id: str, score: int, current_user: User = Depends(get_current_admin)):
    result = await db.users.update_one({"id": user_id}, {"$set": {"score": score}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User score updated"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clean up user data
    await db.quotes.delete_many({"user_id": user_id})
    await db.messages.delete_many({"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]})
    await db.follows.delete_many({"$or": [{"follower_id": user_id}, {"following_id": user_id}]})
    await db.likes.delete_many({"user_id": user_id})
    await db.saves.delete_many({"user_id": user_id})
    
    return {"message": "User deleted"}

# ============= ADMIN MESSAGES MANAGEMENT =============

@api_router.get("/admin/messages")
async def get_all_messages(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_admin)):
    messages = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for m in messages:
        if isinstance(m['created_at'], str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return messages

@api_router.delete("/admin/messages/{message_id}")
async def delete_message_admin(message_id: str, current_user: User = Depends(get_current_admin)):
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}

# ============= ADMIN QUOTES MANAGEMENT =============

@api_router.get("/admin/quotes")
async def get_all_quotes_admin(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_admin)):
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for q in quotes:
        if isinstance(q['created_at'], str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes

@api_router.delete("/admin/quotes/{quote_id}")
async def delete_quote_admin(quote_id: str, current_user: User = Depends(get_current_admin)):
    result = await db.quotes.delete_one({"id": quote_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Clean up related data
    await db.likes.delete_many({"quote_id": quote_id})
    await db.saves.delete_many({"quote_id": quote_id})
    
    return {"message": "Quote deleted"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    admin = await db.users.find_one({"username": "admin"}, {"_id": 0})
    if not admin:
        admin_user = User(
            username="admin",
            email="admin@quotevibe.com",
            password_hash=pwd_context.hash("admin123"),
            full_name="Admin",
            is_admin=True,
            social_links={}
        )
        doc = admin_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logger.info("Admin user created")
    
    # Initialize default languages
    langs_count = await db.languages.count_documents({})
    if langs_count == 0:
        default_languages = [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "tr", "name": "Turkish", "native_name": "Türkçe"},
            {"code": "es", "name": "Spanish", "native_name": "Español"},
            {"code": "fr", "name": "French", "native_name": "Français"},
            {"code": "de", "name": "German", "native_name": "Deutsch"},
            {"code": "ar", "name": "Arabic", "native_name": "العربية"},
            {"code": "zh", "name": "Chinese", "native_name": "中文"},
            {"code": "ja", "name": "Japanese", "native_name": "日本語"},
            {"code": "ru", "name": "Russian", "native_name": "Русский"},
            {"code": "pt", "name": "Portuguese", "native_name": "Português"},
            {"code": "it", "name": "Italian", "native_name": "Italiano"},
            {"code": "nl", "name": "Dutch", "native_name": "Nederlands"},
            {"code": "ko", "name": "Korean", "native_name": "한국어"},
            {"code": "hi", "name": "Hindi", "native_name": "हिन्दी"},
            {"code": "sv", "name": "Swedish", "native_name": "Svenska"},
            {"code": "pl", "name": "Polish", "native_name": "Polski"},
            {"code": "no", "name": "Norwegian", "native_name": "Norsk"},
            {"code": "da", "name": "Danish", "native_name": "Dansk"},
            {"code": "fi", "name": "Finnish", "native_name": "Suomi"},
            {"code": "el", "name": "Greek", "native_name": "Ελληνικά"},
        ]
        
        for lang_data in default_languages:
            lang = Language(**lang_data, enabled=True)
            doc = lang.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.languages.insert_one(doc)
        
        logger.info("Default languages created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()