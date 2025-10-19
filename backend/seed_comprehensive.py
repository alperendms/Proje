"""
Comprehensive seed data for QuoteVibe
Creates users, categories, quotes, and blogs in English with Turkish translations
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# English content with Turkish translations
CATEGORIES = [
    {
        "name": "Love",
        "slug": "love",
        "description": "Quotes about love and relationships",
        "icon": "❤️",
        "translations": {
            "tr": {"name": "Aşk", "description": "Aşk ve ilişkiler hakkında sözler"}
        }
    },
    {
        "name": "Motivation",
        "slug": "motivation", 
        "description": "Inspirational and motivational quotes",
        "icon": "💪",
        "translations": {
            "tr": {"name": "Motivasyon", "description": "İlham verici ve motive edici sözler"}
        }
    },
    {
        "name": "Wisdom",
        "slug": "wisdom",
        "description": "Wise words and life lessons",
        "icon": "🦉",
        "translations": {
            "tr": {"name": "Bilgelik", "description": "Bilge sözler ve hayat dersleri"}
        }
    },
    {
        "name": "Success",
        "slug": "success",
        "description": "Quotes about achieving success",
        "icon": "🏆",
        "translations": {
            "tr": {"name": "Başarı", "description": "Başarıya ulaşma hakkında sözler"}
        }
    },
    {
        "name": "Happiness",
        "slug": "happiness",
        "description": "Quotes about joy and happiness",
        "icon": "😊",
        "translations": {
            "tr": {"name": "Mutluluk", "description": "Neşe ve mutluluk hakkında sözler"}
        }
    },
    {
        "name": "Life",
        "slug": "life",
        "description": "Quotes about life and living",
        "icon": "🌱",
        "translations": {
            "tr": {"name": "Hayat", "description": "Hayat ve yaşam hakkında sözler"}
        }
    }
]

QUOTES_EN = [
    {"content": "The only way to do great work is to love what you do.", "author": "Steve Jobs", "category": "success"},
    {"content": "Life is what happens when you're busy making other plans.", "author": "John Lennon", "category": "life"},
    {"content": "The best time to plant a tree was 20 years ago. The second best time is now.", "author": "Chinese Proverb", "category": "motivation"},
    {"content": "Happiness is not something ready made. It comes from your own actions.", "author": "Dalai Lama", "category": "happiness"},
    {"content": "The only impossible journey is the one you never begin.", "author": "Tony Robbins", "category": "motivation"},
    {"content": "Love all, trust a few, do wrong to none.", "author": "William Shakespeare", "category": "love"},
    {"content": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill", "category": "success"},
    {"content": "In the end, we only regret the chances we didn't take.", "author": "Lewis Carroll", "category": "life"},
    {"content": "The purpose of our lives is to be happy.", "author": "Dalai Lama", "category": "happiness"},
    {"content": "Get busy living or get busy dying.", "author": "Stephen King", "category": "motivation"},
    {"content": "You only live once, but if you do it right, once is enough.", "author": "Mae West", "category": "life"},
    {"content": "The way to get started is to quit talking and begin doing.", "author": "Walt Disney", "category": "success"},
    {"content": "Don't let yesterday take up too much of today.", "author": "Will Rogers", "category": "wisdom"},
    {"content": "You learn more from failure than from success. Don't let it stop you. Failure builds character.", "author": "Unknown", "category": "wisdom"},
    {"content": "It's not whether you get knocked down, it's whether you get up.", "author": "Vince Lombardi", "category": "motivation"},
    {"content": "We loved with a love that was more than love.", "author": "Edgar Allan Poe", "category": "love"},
    {"content": "To love and be loved is to feel the sun from both sides.", "author": "David Viscott", "category": "love"},
    {"content": "The greatest glory in living lies not in never falling, but in rising every time we fall.", "author": "Nelson Mandela", "category": "success"},
    {"content": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt", "category": "motivation"},
    {"content": "The only true wisdom is in knowing you know nothing.", "author": "Socrates", "category": "wisdom"}
]

BLOGS_EN = [
    {
        "title": "The Power of Positive Thinking",
        "slug": "power-of-positive-thinking",
        "excerpt": "Discover how positive thinking can transform your life and help you achieve your goals.",
        "content": """# The Power of Positive Thinking

Positive thinking is more than just a feel-good phrase. It's a powerful tool that can significantly impact your mental health, relationships, and overall success in life.

## Why Positive Thinking Matters

Research has shown that people who maintain a positive outlook tend to:
- Experience less stress
- Have better cardiovascular health
- Build stronger relationships
- Achieve more of their goals

## How to Cultivate Positive Thinking

1. **Practice Gratitude**: Start each day by listing three things you're grateful for
2. **Surround Yourself with Positivity**: Choose friends and content that uplift you
3. **Challenge Negative Thoughts**: When you catch yourself thinking negatively, reframe the thought
4. **Focus on Solutions**: Instead of dwelling on problems, focus on finding solutions

Remember, positive thinking doesn't mean ignoring life's challenges. It means approaching them with a constructive mindset.

*Start your positive thinking journey today!*""",
        "featured_image": "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800"
    },
    {
        "title": "Building Meaningful Relationships",
        "slug": "building-meaningful-relationships",
        "excerpt": "Learn the secrets to creating deep, lasting connections with the people in your life.",
        "content": """# Building Meaningful Relationships

In our fast-paced digital world, meaningful relationships are more valuable than ever. Here's how to build and maintain them.

## The Foundation of Strong Relationships

**Trust and Communication** are the cornerstones of any meaningful relationship. Without these, connections remain superficial.

## Key Principles

1. **Be Present**: Put away your phone and give people your full attention
2. **Listen Actively**: Hear not just words, but emotions and intentions
3. **Show Vulnerability**: Open up about your own struggles and feelings
4. **Be Reliable**: Follow through on your commitments

## Maintaining Relationships

Relationships require ongoing effort. Regular check-ins, quality time together, and showing appreciation keep bonds strong.

Remember: Quality matters more than quantity when it comes to relationships.""",
        "featured_image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"
    },
    {
        "title": "Achieving Your Dreams: A Practical Guide",
        "slug": "achieving-your-dreams",
        "excerpt": "Turn your dreams into reality with these proven strategies and actionable steps.",
        "content": """# Achieving Your Dreams: A Practical Guide

Everyone has dreams, but not everyone achieves them. The difference lies in taking action.

## Step 1: Define Your Dream

Be specific about what you want. Vague dreams lead to vague results.

## Step 2: Break It Down

Divide your big dream into smaller, manageable goals. This makes the journey less overwhelming.

## Step 3: Create a Timeline

Set deadlines for your goals. This creates urgency and helps you stay on track.

## Step 4: Take Daily Action

Consistency is key. Do something every day that moves you closer to your dream.

## Step 5: Stay Flexible

Be willing to adjust your approach as you learn and grow.

## Step 6: Celebrate Progress

Acknowledge your wins, no matter how small. This keeps motivation high.

Your dreams are achievable. Start today!""",
        "featured_image": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800"
    },
    {
        "title": "The Art of Self-Care",
        "slug": "art-of-self-care",
        "excerpt": "Discover why self-care is essential and learn practical ways to prioritize your wellbeing.",
        "content": """# The Art of Self-Care

Self-care isn't selfish—it's necessary. You can't pour from an empty cup.

## What is Self-Care?

Self-care means taking deliberate actions to maintain your physical, mental, and emotional health.

## Types of Self-Care

**Physical**: Exercise, nutrition, sleep
**Emotional**: Journaling, therapy, expressing feelings
**Social**: Spending time with loved ones
**Spiritual**: Meditation, nature, reflection
**Intellectual**: Reading, learning, creativity

## Making Time for Self-Care

1. Schedule it like any other important appointment
2. Start small—even 10 minutes counts
3. Find what works for YOU
4. Don't feel guilty about taking time for yourself

## The Ripple Effect

When you take care of yourself, you're better able to care for others and handle life's challenges.

Start your self-care practice today. You deserve it.""",
        "featured_image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
    }
]

# Site translations
SITE_TRANSLATIONS = {
    "en": {
        "home": "Home",
        "explore": "Explore",
        "categories": "Categories",
        "discover": "Discover",
        "ranking": "Ranking",
        "blogs": "Blogs",
        "profile": "Profile",
        "settings": "Settings",
        "admin_panel": "Admin Panel",
        "logout": "Logout",
        "login": "Login",
        "create_quote": "Create Quote",
        "messages": "Messages",
        "notifications": "Notifications",
        "app_name": "QuoteVibe",
        "start_sharing": "Start Sharing Your Quotes",
        "how_it_works": "How It Works",
        "discover_quotes": "Discover Quotes",
        "discover_quotes_desc": "Browse thousands of inspiring quotes from various categories",
        "share_create": "Share & Create",
        "share_create_desc": "Share your favorite quotes or create your own to inspire others",
        "connect": "Connect",
        "connect_desc": "Follow users, save quotes, and build your collection",
        "trending_quotes": "Trending Quotes",
        "trending_categories": "Trending Categories",
        "trending_users": "Trending Users",
        "latest_from_blog": "Latest from Blog",
        "faq": "Frequently Asked Questions",
        "search_placeholder": "Search quotes...",
        "category": "Category",
        "search": "Search",
        "no_quotes_found": "No quotes found",
        "most_liked": "Most Liked",
        "most_saved": "Most Saved",
        "most_viewed": "Most Viewed",
        "quotes": "Quotes",
        "likes": "Likes",
        "saved": "Saved",
        "followers": "Followers",
        "following": "Following",
        "score": "Score",
        "follow": "Follow",
        "unfollow": "Unfollow",
        "message": "Message",
        "like": "Like",
        "save": "Save",
        "share": "Share",
        "copy": "Copy",
        "download": "Download",
        "delete": "Delete",
        "edit": "Edit",
        "about": "About",
        "contact": "Contact",
        "privacy": "Privacy Policy",
        "terms": "Terms of Service",
        "help": "Help",
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "cancel": "Cancel",
        "submit": "Submit",
        "save_changes": "Save Changes",
        "view_more": "View More",
        "view_all": "View All"
    },
    "tr": {
        "home": "Ana Sayfa",
        "explore": "Keşfet",
        "categories": "Kategoriler",
        "discover": "Keşif",
        "ranking": "Sıralama",
        "blogs": "Bloglar",
        "profile": "Profil",
        "settings": "Ayarlar",
        "admin_panel": "Admin Paneli",
        "logout": "Çıkış Yap",
        "login": "Giriş Yap",
        "create_quote": "Söz Oluştur",
        "messages": "Mesajlar",
        "notifications": "Bildirimler",
        "app_name": "QuoteVibe",
        "start_sharing": "Sözlerinizi Paylaşmaya Başlayın",
        "how_it_works": "Nasıl Çalışır",
        "discover_quotes": "Sözleri Keşfet",
        "discover_quotes_desc": "Çeşitli kategorilerden binlerce ilham verici sözü keşfedin",
        "share_create": "Paylaş & Oluştur",
        "share_create_desc": "Favori sözlerinizi paylaşın veya başkalarına ilham vermek için kendiniz oluşturun",
        "connect": "Bağlan",
        "connect_desc": "Kullanıcıları takip edin, sözleri kaydedin ve koleksiyonunuzu oluşturun",
        "trending_quotes": "Trend Sözler",
        "trending_categories": "Trend Kategoriler",
        "trending_users": "Trend Kullanıcılar",
        "latest_from_blog": "Blogdan En Son",
        "faq": "Sık Sorulan Sorular",
        "search_placeholder": "Söz ara...",
        "category": "Kategori",
        "search": "Ara",
        "no_quotes_found": "Söz bulunamadı",
        "most_liked": "En Çok Beğenilen",
        "most_saved": "En Çok Kaydedilen",
        "most_viewed": "En Çok Görüntülenen",
        "quotes": "Sözler",
        "likes": "Beğeniler",
        "saved": "Kaydedilenler",
        "followers": "Takipçiler",
        "following": "Takip Edilenler",
        "score": "Puan",
        "follow": "Takip Et",
        "unfollow": "Takibi Bırak",
        "message": "Mesaj",
        "like": "Beğen",
        "save": "Kaydet",
        "share": "Paylaş",
        "copy": "Kopyala",
        "download": "İndir",
        "delete": "Sil",
        "edit": "Düzenle",
        "about": "Hakkında",
        "contact": "İletişim",
        "privacy": "Gizlilik Politikası",
        "terms": "Kullanım Şartları",
        "help": "Yardım",
        "loading": "Yükleniyor...",
        "error": "Hata",
        "success": "Başarılı",
        "cancel": "İptal",
        "submit": "Gönder",
        "save_changes": "Değişiklikleri Kaydet",
        "view_more": "Daha Fazla",
        "view_all": "Hepsini Gör"
    }
}

async def seed_database():
    print("🌱 Starting comprehensive database seeding...")
    
    # Clear existing data (except admin user)
    print("🧹 Cleaning existing data...")
    await db.quotes.delete_many({"user_id": {"$ne": "admin"}})
    await db.blogs.delete_many({})
    await db.categories.delete_many({})
    await db.site_translations.delete_many({})
    
    # Create sample user
    print("👤 Creating sample user...")
    sample_user_id = str(uuid.uuid4())
    sample_user = {
        "id": sample_user_id,
        "username": "@quotelover",
        "email": "user@quotevibe.com",
        "password_hash": pwd_context.hash("user123"),
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "bio": "I love sharing inspiring quotes!",
        "avatar": None,
        "country": "United States",
        "country_code": "US",
        "phone": None,
        "phone_country_code": "+1",
        "language": "en",
        "social_links": {},
        "followers_count": 5,
        "following_count": 3,
        "quotes_count": 0,
        "score": 150,
        "is_admin": False,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    }
    await db.users.update_one(
        {"username": "@quotelover"},
        {"$set": sample_user},
        upsert=True
    )
    
    # Create categories
    print("📁 Creating categories...")
    category_map = {}
    for cat_data in CATEGORIES:
        cat_id = str(uuid.uuid4())
        category = {
            "id": cat_id,
            "name": cat_data["name"],
            "slug": cat_data["slug"],
            "description": cat_data["description"],
            "icon": cat_data["icon"],
            "translations": cat_data["translations"],
            "parent_id": None,
            "quotes_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.categories.insert_one(category)
        category_map[cat_data["slug"]] = cat_id
    
    # Create quotes
    print("💬 Creating quotes...")
    for i, quote_data in enumerate(QUOTES_EN):
        quote_id = str(uuid.uuid4())
        category_id = category_map.get(quote_data["category"])
        
        # Randomize some stats
        created_days_ago = 30 - (i % 10)
        likes = (i * 3) % 50
        saves = (i * 2) % 30
        views = (i * 10) % 200
        
        quote = {
            "id": quote_id,
            "user_id": sample_user_id,
            "content": quote_data["content"],
            "author": quote_data["author"],
            "category_id": category_id,
            "tags": [],
            "language": "en",
            "country": "United States",
            "likes_count": likes,
            "saves_count": saves,
            "views_count": views,
            "shares_count": 0,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=created_days_ago)).isoformat()
        }
        await db.quotes.insert_one(quote)
        
        # Update category quote count
        if category_id:
            await db.categories.update_one(
                {"id": category_id},
                {"$inc": {"quotes_count": 1}}
            )
    
    # Update user quote count
    await db.users.update_one(
        {"id": sample_user_id},
        {"$set": {"quotes_count": len(QUOTES_EN)}}
    )
    
    # Create blogs
    print("📝 Creating blogs...")
    for i, blog_data in enumerate(BLOGS_EN):
        blog_id = str(uuid.uuid4())
        blog = {
            "id": blog_id,
            "title": blog_data["title"],
            "slug": blog_data["slug"],
            "content": blog_data["content"],
            "excerpt": blog_data["excerpt"],
            "featured_image": blog_data["featured_image"],
            "language": "en",
            "country": "United States",
            "published": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=20 - i*5)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=20 - i*5)).isoformat()
        }
        await db.blogs.insert_one(blog)
    
    # Create site translations
    print("🌍 Creating site translations...")
    for lang_code, translations in SITE_TRANSLATIONS.items():
        translation_doc = {
            "id": str(uuid.uuid4()),
            "language_code": lang_code,
            "translations": translations,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.site_translations.update_one(
            {"language_code": lang_code},
            {"$set": translation_doc},
            upsert=True
        )
    
    print("\n✅ Database seeding completed successfully!")
    print(f"   - {len(CATEGORIES)} categories created")
    print(f"   - {len(QUOTES_EN)} quotes created")
    print(f"   - {len(BLOGS_EN)} blogs created")
    print(f"   - {len(SITE_TRANSLATIONS)} language translations created")
    print("   - 1 sample user created (@quotelover / user123)")

if __name__ == "__main__":
    asyncio.run(seed_database())
