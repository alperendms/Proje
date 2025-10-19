"""
Add Turkish content to test language filtering
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def add_turkish_content():
    print("🇹🇷 Adding Turkish content...")
    
    # Get sample user
    user = await db.users.find_one({"username": "@quotelover"}, {"_id": 0})
    if not user:
        print("❌ Sample user not found")
        return
    
    # Get categories
    categories = await db.categories.find({}, {"_id": 0}).to_list(10)
    
    # Turkish quotes
    turkish_quotes = [
        {"content": "Hayatta en büyük mutluluk, yapamam denilen şeyi başarmaktır.", "author": "Mustafa Kemal Atatürk", "category_slug": "motivation"},
        {"content": "Hayat bir keredir, güzel yaşa.", "author": "Türk Atasözü", "category_slug": "life"},
        {"content": "Aşk acı çekmektir, ama acı çekmeden aşk olmaz.", "author": "Mevlana", "category_slug": "love"},
        {"content": "Bilgi güçtür.", "author": "Francis Bacon", "category_slug": "wisdom"},
        {"content": "Başarı, başarısızlıktan başarısızlığa şevkinizi kaybetmeden yürümektir.", "author": "Winston Churchill", "category_slug": "success"},
    ]
    
    for i, quote_data in enumerate(turkish_quotes):
        category = next((c for c in categories if c['slug'] == quote_data['category_slug']), None)
        if not category:
            continue
            
        quote_id = str(uuid.uuid4())
        quote = {
            "id": quote_id,
            "user_id": user['id'],
            "content": quote_data["content"],
            "author": quote_data["author"],
            "category_id": category['id'],
            "tags": [],
            "language": "tr",
            "country": "Turkey",
            "likes_count": 10 + i * 5,
            "saves_count": 5 + i * 3,
            "views_count": 50 + i * 20,
            "shares_count": 0,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=5 - i)).isoformat()
        }
        await db.quotes.insert_one(quote)
        
        # Update category quote count
        await db.categories.update_one(
            {"id": category['id']},
            {"$inc": {"quotes_count": 1}}
        )
    
    print(f"   ✅ {len(turkish_quotes)} Türkçe quote eklendi")
    
    # Turkish blogs
    turkish_blogs = [
        {
            "title": "Pozitif Düşüncenin Gücü",
            "slug": "pozitif-dusuncenin-gucu",
            "excerpt": "Pozitif düşüncenin hayatınızı nasıl değiştirebileceğini keşfedin.",
            "content": """# Pozitif Düşüncenin Gücü

Pozitif düşünce sadece iyi hissetmekten öte bir şeydir. Hayatınızı değiştirebilecek güçlü bir araçtır.

## Neden Önemli?

Araştırmalar gösteriyor ki pozitif düşünen insanlar:
- Daha az stres yaşıyor
- Daha sağlıklı kalp-damar sistemine sahip
- Daha güçlü ilişkiler kuruyor
- Hedeflerine daha kolay ulaşıyor

## Nasıl Geliştirilir?

1. **Şükür Pratiği**: Her gün 3 şey için şükret
2. **Pozitif Çevre**: Sizi yükseltecek insanlarla çevrelin
3. **Olumsuz Düşüncelere Meydan Okuma**: Düşüncelerinizi yeniden çerçeveleyin

Bugün başlayın!""",
            "featured_image": "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800"
        },
        {
            "title": "Başarıya Giden Yol",
            "slug": "basariya-giden-yol",
            "excerpt": "Hayallerinizi gerçeğe dönüştürmek için pratik adımlar.",
            "content": """# Başarıya Giden Yol

Herkesin hayalleri var, ama herkes başarılı olamıyor. Fark, harekete geçmektedir.

## Adım 1: Hedef Belirle

Net olun. Belirsiz hayaller, belirsiz sonuçlar verir.

## Adım 2: Parçalara Ayır

Büyük hedefinizi küçük, yönetilebilir parçalara bölün.

## Adım 3: Her Gün İlerle

Tutarlılık anahtardır. Her gün bir adım atın.

Hayalleriniz gerçekleşebilir!""",
            "featured_image": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800"
        }
    ]
    
    for i, blog_data in enumerate(turkish_blogs):
        blog_id = str(uuid.uuid4())
        blog = {
            "id": blog_id,
            "title": blog_data["title"],
            "slug": blog_data["slug"],
            "content": blog_data["content"],
            "excerpt": blog_data["excerpt"],
            "featured_image": blog_data["featured_image"],
            "language": "tr",
            "country": "Turkey",
            "published": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=10 - i*5)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=10 - i*5)).isoformat()
        }
        await db.blogs.insert_one(blog)
    
    print(f"   ✅ {len(turkish_blogs)} Türkçe blog eklendi")
    
    # Update user quote count
    total_quotes = await db.quotes.count_documents({"user_id": user['id']})
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"quotes_count": total_quotes}}
    )
    
    print("\n✅ Türkçe içerik ekleme tamamlandı!")

if __name__ == "__main__":
    asyncio.run(add_turkish_content())
