import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Sample data
sample_categories = [
    {"name": "Love", "description": "Quotes about love and relationships", "icon": "❤️"},
    {"name": "Motivation", "description": "Inspirational and motivational quotes", "icon": "🚀"},
    {"name": "Life", "description": "Wisdom about life", "icon": "🌟"},
    {"name": "Success", "description": "Quotes about achieving success", "icon": "🏆"},
    {"name": "Friendship", "description": "Quotes about friendship", "icon": "🤝"},
    {"name": "Wisdom", "description": "Words of wisdom", "icon": "🦉"},
    {"name": "Happiness", "description": "Quotes about happiness", "icon": "😊"},
    {"name": "Courage", "description": "Quotes about bravery", "icon": "💪"},
    {"name": "Peace", "description": "Quotes about inner peace", "icon": "☮️"},
    {"name": "Dreams", "description": "Quotes about dreams and aspirations", "icon": "✨"},
]

sample_users = [
    {"username": "sarah_writer", "email": "sarah@example.com", "full_name": "Sarah Johnson", "bio": "Writer and quote enthusiast"},
    {"username": "mike_poet", "email": "mike@example.com", "full_name": "Mike Poetry", "bio": "Poet sharing daily inspiration"},
    {"username": "emma_wisdom", "email": "emma@example.com", "full_name": "Emma Wise", "bio": "Philosophy student"},
    {"username": "john_motivator", "email": "john@example.com", "full_name": "John Smith", "bio": "Motivational speaker"},
    {"username": "lisa_dreamer", "email": "lisa@example.com", "full_name": "Lisa Dreams", "bio": "Life coach and dreamer"},
]

sample_quotes = [
    {"content": "The only way to do great work is to love what you do.", "author": "Steve Jobs"},
    {"content": "Life is what happens when you're busy making other plans.", "author": "John Lennon"},
    {"content": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt"},
    {"content": "It is during our darkest moments that we must focus to see the light.", "author": "Aristotle"},
    {"content": "Be yourself; everyone else is already taken.", "author": "Oscar Wilde"},
    {"content": "The only impossible journey is the one you never begin.", "author": "Tony Robbins"},
    {"content": "In the end, we only regret the chances we didn't take.", "author": "Lewis Carroll"},
    {"content": "Life is either a daring adventure or nothing at all.", "author": "Helen Keller"},
    {"content": "The best time to plant a tree was 20 years ago. The second best time is now.", "author": "Chinese Proverb"},
    {"content": "Don't watch the clock; do what it does. Keep going.", "author": "Sam Levenson"},
    {"content": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt"},
    {"content": "Everything you've ever wanted is on the other side of fear.", "author": "George Addair"},
    {"content": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"},
    {"content": "The only limit to our realization of tomorrow will be our doubts of today.", "author": "Franklin D. Roosevelt"},
    {"content": "Do what you can, with what you have, where you are.", "author": "Theodore Roosevelt"},
    {"content": "It does not matter how slowly you go as long as you do not stop.", "author": "Confucius"},
    {"content": "Act as if what you do makes a difference. It does.", "author": "William James"},
    {"content": "Success usually comes to those who are too busy to be looking for it.", "author": "Henry David Thoreau"},
    {"content": "Don't be afraid to give up the good to go for the great.", "author": "John D. Rockefeller"},
    {"content": "I find that the harder I work, the more luck I seem to have.", "author": "Thomas Jefferson"},
    {"content": "Don't let yesterday take up too much of today.", "author": "Will Rogers"},
    {"content": "You learn more from failure than from success. Don't let it stop you.", "author": "Unknown"},
    {"content": "It's not whether you get knocked down, it's whether you get up.", "author": "Vince Lombardi"},
    {"content": "People who are crazy enough to think they can change the world, are the ones who do.", "author": "Rob Siltanen"},
    {"content": "We may encounter many defeats but we must not be defeated.", "author": "Maya Angelou"},
    {"content": "Knowing is not enough; we must apply. Wishing is not enough; we must do.", "author": "Johann Wolfgang Von Goethe"},
    {"content": "Whether you think you can or think you can't, you're right.", "author": "Henry Ford"},
    {"content": "The two most important days in your life are the day you are born and the day you find out why.", "author": "Mark Twain"},
    {"content": "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.", "author": "Johann Wolfgang von Goethe"},
    {"content": "The best revenge is massive success.", "author": "Frank Sinatra"},
]

sample_blogs = [
    {
        "title": "The Power of Positive Thinking",
        "content": "Positive thinking is more than just a tagline. It changes the way we behave. And I firmly believe that when I am positive, it not only makes me better, but it also makes those around me better. Here's how you can harness the power of positive thinking in your daily life...",
        "excerpt": "Discover how positive thinking can transform your life and relationships.",
        "featured_image": "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800"
    },
    {
        "title": "Finding Inspiration in Everyday Life",
        "content": "Inspiration is everywhere if you know where to look. From the smile of a stranger to the beauty of nature, everyday moments can spark creativity and motivation. In this post, we explore practical ways to stay inspired...",
        "excerpt": "Learn to find inspiration in the ordinary moments of life.",
        "featured_image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
    },
    {
        "title": "Building Meaningful Connections",
        "content": "In our digital age, true connections are more valuable than ever. This article discusses how to build and maintain meaningful relationships that enrich your life and the lives of others...",
        "excerpt": "Explore the art of creating lasting, meaningful relationships.",
        "featured_image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"
    },
    {
        "title": "Overcoming Life's Challenges",
        "content": "Life is full of obstacles, but each challenge is an opportunity for growth. This comprehensive guide provides strategies for overcoming difficulties and emerging stronger than before...",
        "excerpt": "Turn life's challenges into opportunities for personal growth.",
        "featured_image": "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800"
    },
]

async def seed_database():
    print("Starting database seeding...")
    
    # Create categories
    print("Creating categories...")
    category_ids = []
    for cat_data in sample_categories:
        cat = {
            "id": str(uuid.uuid4()),
            "name": cat_data["name"],
            "slug": cat_data["name"].lower().replace(" ", "-"),
            "description": cat_data["description"],
            "parent_id": None,
            "icon": cat_data["icon"],
            "quotes_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.categories.insert_one(cat)
        category_ids.append(cat["id"])
    print(f"Created {len(category_ids)} categories")
    
    # Create users
    print("Creating users...")
    user_ids = []
    for user_data in sample_users:
        user = {
            "id": str(uuid.uuid4()),
            "username": user_data["username"],
            "email": user_data["email"],
            "password_hash": pwd_context.hash("password123"),
            "full_name": user_data["full_name"],
            "bio": user_data["bio"],
            "avatar": None,
            "country": "US",
            "country_code": "+1",
            "phone": None,
            "language": "en",
            "social_links": {},
            "followers_count": random.randint(10, 500),
            "following_count": random.randint(5, 200),
            "quotes_count": 0,
            "score": random.randint(100, 1000),
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
        user_ids.append(user["id"])
    print(f"Created {len(user_ids)} users")
    
    # Create quotes
    print("Creating quotes...")
    for quote_data in sample_quotes:
        user_id = random.choice(user_ids)
        category_id = random.choice(category_ids)
        
        quote = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "content": quote_data["content"],
            "author": quote_data["author"],
            "category_id": category_id,
            "tags": [],
            "likes_count": random.randint(5, 200),
            "saves_count": random.randint(2, 100),
            "views_count": random.randint(50, 1000),
            "shares_count": random.randint(1, 50),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))).isoformat()
        }
        await db.quotes.insert_one(quote)
        
        # Update user quotes count
        await db.users.update_one({"id": user_id}, {"$inc": {"quotes_count": 1}})
        
        # Update category quotes count
        await db.categories.update_one({"id": category_id}, {"$inc": {"quotes_count": 1}})
    
    print(f"Created {len(sample_quotes)} quotes")
    
    # Create blogs
    print("Creating blogs...")
    for blog_data in sample_blogs:
        blog = {
            "id": str(uuid.uuid4()),
            "title": blog_data["title"],
            "slug": blog_data["title"].lower().replace(" ", "-").replace("'", ""),
            "content": blog_data["content"],
            "excerpt": blog_data["excerpt"],
            "featured_image": blog_data["featured_image"],
            "published": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 15))).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.blogs.insert_one(blog)
    print(f"Created {len(sample_blogs)} blogs")
    
    print("Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())
