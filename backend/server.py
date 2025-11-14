from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'shindora-secret-key-change-in-production')
ALGORITHM = "HS256"
ADMIN_PASSWORD = "Emilia9@#$"

app = FastAPI(title="ShinDora Nesub API")
api_router = APIRouter(prefix="/api")

# ===== MODELS =====
class BilingualText(BaseModel):
    id: str = ""
    en: str = ""

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    email: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: Optional[str]
    avatar_url: str
    watch_later: List[str] = []
    liked_videos: List[str] = []

class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = None

class Video(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: BilingualText
    description: BilingualText
    embed_url: str
    category: BilingualText
    episode: str = ""
    views: int = 0
    thumbnail_url: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VideoCreate(BaseModel):
    title: BilingualText
    description: BilingualText
    embed_url: str
    category: BilingualText
    episode: str = ""
    thumbnail_url: str = ""

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    user_id: str
    username: str
    avatar: str
    comment: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CommentCreate(BaseModel):
    video_id: str
    comment: str

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: BilingualText

class Theme(BaseModel):
    primaryColor: str = "#3B82F6"
    darkBg: str = "#0F0F0F"
    lightBg: str = "#FFFFFF"
    textColor: str = "#E5E7EB"

class Ad(BaseModel):
    image: str = ""
    link: str = ""
    title: BilingualText = BilingualText(id="", en="")

class Settings(BaseModel):
    logo_url: str = ""
    theme: Theme = Theme()
    ads: Ad = Ad()

class Page(BaseModel):
    page_name: str
    content: BilingualText

class AdminLogin(BaseModel):
    password: str

# ===== UTILS =====
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"username": username}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===== AUTH ROUTES =====
@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"username": data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_doc = {
        "username": data.username,
        "password_hash": hash_password(data.password),
        "email": data.email,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.username,
        "watch_later": [],
        "liked_videos": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token({"sub": data.username})
    return {"token": token, "user": UserResponse(**{k: v for k, v in user_doc.items() if k != "password_hash"})}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"username": data.username})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token({"sub": data.username})
    return {"token": token, "user": UserResponse(**{k: v for k, v in user.items() if k not in ["password_hash", "_id"]})}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return UserResponse(**{k: v for k, v in user.items() if k != "password_hash"})

@api_router.put("/auth/profile")
async def update_profile(data: UserUpdate, user=Depends(get_current_user)):
    update_data = {}
    if data.username:
        update_data["username"] = data.username
    if data.avatar_url:
        update_data["avatar_url"] = data.avatar_url
    if data.password:
        update_data["password_hash"] = hash_password(data.password)
    
    if update_data:
        await db.users.update_one({"username": user["username"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"username": data.username or user["username"]}, {"_id": 0})
    return UserResponse(**{k: v for k, v in updated_user.items() if k != "password_hash"})

# ===== VIDEO ROUTES =====
@api_router.get("/videos")
async def get_videos(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category and category != "All":
        query["$or"] = [
            {"category.id": category},
            {"category.en": category}
        ]
    if search:
        query["$or"] = [
            {"title.id": {"$regex": search, "$options": "i"}},
            {"title.en": {"$regex": search, "$options": "i"}}
        ]
    
    videos = await db.videos.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return videos

@api_router.get("/videos/{video_id}")
async def get_video(video_id: str):
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@api_router.post("/videos/{video_id}/view")
async def increment_view(video_id: str):
    await db.videos.update_one({"id": video_id}, {"$inc": {"views": 1}})
    return {"success": True}

@api_router.post("/videos/{video_id}/like")
async def like_video(video_id: str, user=Depends(get_current_user)):
    await db.users.update_one(
        {"username": user["username"]},
        {"$addToSet": {"liked_videos": video_id}}
    )
    return {"success": True}

@api_router.delete("/videos/{video_id}/like")
async def unlike_video(video_id: str, user=Depends(get_current_user)):
    await db.users.update_one(
        {"username": user["username"]},
        {"$pull": {"liked_videos": video_id}}
    )
    return {"success": True}

# ===== COMMENTS =====
@api_router.get("/comments/{video_id}")
async def get_comments(video_id: str):
    comments = await db.comments.find({"video_id": video_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return comments

@api_router.post("/comments")
async def create_comment(data: CommentCreate, user=Depends(get_current_user)):
    comment = Comment(
        video_id=data.video_id,
        user_id=user["username"],
        username=user["username"],
        avatar=user["avatar_url"],
        comment=data.comment
    )
    await db.comments.insert_one(comment.model_dump())
    return comment

@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, user=Depends(get_current_user)):
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment["user_id"] != user["username"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.comments.delete_one({"id": comment_id})
    return {"success": True}

# ===== USER ACTIONS =====
@api_router.get("/user/watch-later")
async def get_watch_later(user=Depends(get_current_user)):
    video_ids = user.get("watch_later", [])
    videos = await db.videos.find({"id": {"$in": video_ids}}, {"_id": 0}).to_list(100)
    return videos

@api_router.post("/user/watch-later/{video_id}")
async def add_watch_later(video_id: str, user=Depends(get_current_user)):
    await db.users.update_one(
        {"username": user["username"]},
        {"$addToSet": {"watch_later": video_id}}
    )
    return {"success": True}

@api_router.delete("/user/watch-later/{video_id}")
async def remove_watch_later(video_id: str, user=Depends(get_current_user)):
    await db.users.update_one(
        {"username": user["username"]},
        {"$pull": {"watch_later": video_id}}
    )
    return {"success": True}

@api_router.get("/user/liked-videos")
async def get_liked_videos(user=Depends(get_current_user)):
    video_ids = user.get("liked_videos", [])
    videos = await db.videos.find({"id": {"$in": video_ids}}, {"_id": 0}).to_list(100)
    return videos

# ===== CATEGORIES =====
@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

# ===== SETTINGS =====
@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        settings = Settings().model_dump()
        await db.settings.insert_one(settings)
    return settings

# ===== PAGES =====
@api_router.get("/pages/{page_name}")
async def get_page(page_name: str):
    page = await db.pages.find_one({"page_name": page_name}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

# ===== ADMIN ROUTES =====
@api_router.post("/admin/auth")
async def admin_login(data: AdminLogin):
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_token({"sub": "admin", "role": "admin"})
    return {"token": token}

@api_router.post("/admin/videos")
async def admin_create_video(video: VideoCreate, user=Depends(get_current_user)):
    if user.get("username") != "admin":
        payload = jwt.decode(user.get("token", ""), SECRET_KEY, algorithms=[ALGORITHM]) if "token" in user else {}
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    
    new_video = Video(**video.model_dump())
    await db.videos.insert_one(new_video.model_dump())
    return new_video

@api_router.put("/admin/videos/{video_id}")
async def admin_update_video(video_id: str, video: VideoCreate):
    await db.videos.update_one({"id": video_id}, {"$set": video.model_dump()})
    return {"success": True}

@api_router.delete("/admin/videos/{video_id}")
async def admin_delete_video(video_id: str):
    await db.videos.delete_one({"id": video_id})
    await db.comments.delete_many({"video_id": video_id})
    return {"success": True}

@api_router.put("/admin/settings")
async def admin_update_settings(settings: Settings):
    await db.settings.update_one({}, {"$set": settings.model_dump()}, upsert=True)
    return {"success": True}

@api_router.post("/admin/categories")
async def admin_create_category(category: Category):
    await db.categories.insert_one(category.model_dump())
    return category

@api_router.put("/admin/categories/{category_id}")
async def admin_update_category(category_id: str, category: Category):
    await db.categories.update_one({"id": category_id}, {"$set": category.model_dump()})
    return {"success": True}

@api_router.delete("/admin/categories/{category_id}")
async def admin_delete_category(category_id: str):
    await db.categories.delete_one({"id": category_id})
    return {"success": True}

@api_router.put("/admin/pages/{page_name}")
async def admin_update_page(page_name: str, page: Page):
    await db.pages.update_one({"page_name": page_name}, {"$set": page.model_dump()}, upsert=True)
    return {"success": True}

# ===== INIT DEFAULT DATA =====
@api_router.post("/init-defaults")
async def init_defaults():
    # Check if already initialized
    existing_categories = await db.categories.count_documents({})
    if existing_categories > 0:
        return {"message": "Already initialized"}
    
    # Default categories
    default_categories = [
        Category(name=BilingualText(id="Doraemon", en="Doraemon")),
        Category(name=BilingualText(id="Crayon Shin-chan", en="Crayon Shin-chan")),
        Category(name=BilingualText(id="Ninja Hattori-kun", en="Ninja Hattori-kun")),
        Category(name=BilingualText(id="Chibi Maruko-chan", en="Chibi Maruko-chan"))
    ]
    await db.categories.insert_many([c.model_dump() for c in default_categories])
    
    # Default pages
    default_pages = [
        Page(
            page_name="about",
            content=BilingualText(
                id="ShinDoraNesub adalah proyek penggemar yang dibuat dengan cinta untuk para penggemar anime klasik. Kami menyediakan subtitle Indonesia untuk anime favorit Anda. Hubungi: shindoranesub@gmail.com",
                en="ShinDoraNesub is a fan-made project created with love for classic anime fans. We provide Indonesian subtitles for your favorite anime. Contact: shindoranesub@gmail.com"
            )
        ),
        Page(
            page_name="disclaimer",
            content=BilingualText(
                id="Website ini hanya untuk tujuan edukasi dan penggemar. Kami tidak memiliki hak cipta atas konten anime yang ditampilkan. Semua hak cipta milik pemilik aslinya.",
                en="This website is for educational and fan purposes only. We do not own the copyright to the anime content displayed. All rights belong to their respective owners."
            )
        ),
        Page(
            page_name="privacy",
            content=BilingualText(
                id="Kami menghargai privasi Anda. Data pengguna hanya digunakan untuk fungsi website dan tidak akan dibagikan kepada pihak ketiga.",
                en="We respect your privacy. User data is only used for website functionality and will not be shared with third parties."
            )
        ),
        Page(
            page_name="terms",
            content=BilingualText(
                id="Dengan menggunakan website ini, Anda setuju untuk mengikuti aturan dan ketentuan kami. Dilarang menyalahgunakan konten atau melakukan aktivitas ilegal.",
                en="By using this website, you agree to follow our rules and terms. Misuse of content or illegal activities are prohibited."
            )
        )
    ]
    await db.pages.insert_many([p.model_dump() for p in default_pages])
    
    # Default settings
    default_settings = Settings(
        logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=ShinDora",
        theme=Theme(),
        ads=Ad()
    )
    await db.settings.insert_one(default_settings.model_dump())
    
    return {"message": "Defaults initialized successfully"}

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
