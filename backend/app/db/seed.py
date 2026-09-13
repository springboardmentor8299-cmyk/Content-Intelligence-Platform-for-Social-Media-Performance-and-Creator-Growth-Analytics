from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password
from app.models.models import (
    User, CreatorProfile, SocialAccount, ContentItem,
    AudienceDemographic, RevenueRecord, Notification, ScheduledReport
)

# Mandatory demo credentials for Milestone 1 + Milestone 2 mentor demo
DEMO_USERS_DATA = [
    {
        "email": "creator@creatoriq.io",
        "password": "Creator@123",
        "full_name": "Raw Talks With VK",
        "role": "creator",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        "niche": "Podcast & In-Depth Conversations",
        "bio": "Host of Raw Talks With VK — in-depth Telugu conversations, podcast interviews, entrepreneurial journeys, and inspiring life stories."
    },
    {
        "email": "agency@creatoriq.io",
        "password": "Agency@123",
        "full_name": "Apex Talent Media",
        "role": "agency",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        "niche": "Creator Talent Management",
        "bio": "Managing top tier regional & digital creators across YouTube, Instagram and podcast networks."
    },
    {
        "email": "marketing@creatoriq.io",
        "password": "Marketing@123",
        "full_name": "Sarah Chen",
        "role": "marketing_team",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
        "niche": "Sponsorships & Brand Partnerships",
        "bio": "Leading creator marketing campaigns, audience reach benchmarks, and brand collaborations."
    },
    {
        "email": "admin@creatoriq.io",
        "password": "Admin@123",
        "full_name": "CreatorIQ Admin",
        "role": "admin",
        "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
        "niche": "Platform Operations",
        "bio": "Global platform administrator and operations lead for CreatorIQ."
    }
]


def seed_database(db: Session, force: bool = False):
    """Seed or update database with Raw Talks With VK demo dataset."""
    existing_creator = db.query(User).filter(User.email == "creator@creatoriq.io").first()
    
    # If forced or if existing creator is named Alex Rivera, clean up and re-seed
    if force or (existing_creator and "Alex" in existing_creator.full_name):
        print("--- Resetting demo data for Raw Talks With VK ---")
        db.query(ContentItem).delete()
        db.query(SocialAccount).delete()
        db.query(AudienceDemographic).delete()
        db.query(RevenueRecord).delete()
        db.query(Notification).delete()
        db.query(ScheduledReport).delete()
        db.query(CreatorProfile).delete()
        db.query(User).delete()
        db.commit()
        existing_creator = None

    if existing_creator:
        # Ensure passwords and profile info are synced
        for u in DEMO_USERS_DATA:
            user = db.query(User).filter(User.email == u["email"]).first()
            if user:
                if not verify_password(u["password"], user.hashed_password):
                    user.hashed_password = get_password_hash(u["password"])
                user.full_name = u["full_name"]
                user.role = u["role"]
                if not user.profile:
                    db.add(CreatorProfile(
                        user_id=user.id,
                        bio=u["bio"],
                        niche=u["niche"],
                        total_reach=1880000 if u["role"] == "creator" else 0,
                        total_followers=1525000 if u["role"] == "creator" else 0,
                        avg_engagement_rate=7.84 if u["role"] == "creator" else 0.0,
                        agency_name="Apex Talent Media" if u["role"] == "creator" else None,
                        website="https://rawtalkswithvk.com"
                    ))
                else:
                    user.profile.bio = u["bio"]
                    user.profile.niche = u["niche"]
                    if u["role"] == "creator":
                        user.profile.website = "https://rawtalkswithvk.com"
                        user.profile.total_reach = 1880000
                        user.profile.total_followers = 1525000
                        user.profile.avg_engagement_rate = 7.84
        db.commit()
        return

    print("--- Seeding CreatorIQ Database with Raw Talks With VK Demo Data ---")
    
    # 1. Create Default Users
    created_users = {}
    for u in DEMO_USERS_DATA:
        user = User(
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            full_name=u["full_name"],
            role=u["role"],
            avatar_url=u["avatar_url"],
            is_active=True
        )
        db.add(user)
        db.flush()
        created_users[u["role"]] = user

        profile = CreatorProfile(
            user_id=user.id,
            bio=u["bio"],
            niche=u["niche"],
            total_reach=1880000 if u["role"] == "creator" else 0,
            total_followers=1525000 if u["role"] == "creator" else 0,
            avg_engagement_rate=7.84 if u["role"] == "creator" else 0.0,
            agency_name="Apex Talent Media" if u["role"] == "creator" else None,
            website="https://rawtalkswithvk.com"
        )
        db.add(profile)

    primary_creator = created_users["creator"]

    # 2. Social Accounts for Raw Talks With VK (Exactly the 6 required platforms)
    social_accounts_data = [
        {
            "platform": "youtube",
            "account_handle": "@RawTalksWithVK",
            "account_name": "Raw Talks With VK (Demo)",
            "followers_count": 840000,
            "profile_url": "https://youtube.com/@RawTalksWithVK",
            "is_connected": True
        },
        {
            "platform": "instagram",
            "account_handle": "@rawtalkswithvk",
            "account_name": "Raw Talks With VK (Demo)",
            "followers_count": 320000,
            "profile_url": "https://instagram.com/rawtalkswithvk",
            "is_connected": True
        },
        {
            "platform": "tiktok",
            "account_handle": "@rawtalks_clips",
            "account_name": "Raw Talks Clips (Demo)",
            "followers_count": 180000,
            "profile_url": "https://tiktok.com/@rawtalks_clips",
            "is_connected": True
        },
        {
            "platform": "facebook",
            "account_handle": "rawtalkswithvk",
            "account_name": "Raw Talks With VK Community (Demo)",
            "followers_count": 95000,
            "profile_url": "https://facebook.com/rawtalkswithvk",
            "is_connected": True
        },
        {
            "platform": "twitter",
            "account_handle": "@rawtalks_vk",
            "account_name": "Raw Talks With VK (Demo)",
            "followers_count": 62000,
            "profile_url": "https://x.com/rawtalks_vk",
            "is_connected": True
        },
        {
            "platform": "linkedin",
            "account_handle": "raw-talks-with-vk",
            "account_name": "Raw Talks Media (Demo)",
            "followers_count": 28000,
            "profile_url": "https://linkedin.com/in/raw-talks-with-vk",
            "is_connected": True
        }
    ]

    for acc in social_accounts_data:
        social_acc = SocialAccount(
            user_id=primary_creator.id,
            platform=acc["platform"],
            account_handle=acc["account_handle"],
            account_name=acc["account_name"],
            followers_count=acc["followers_count"],
            profile_url=acc["profile_url"],
            is_connected=acc["is_connected"],
            last_synced_at=datetime.utcnow() - timedelta(minutes=10)
        )
        db.add(social_acc)

    # 3. Content Items (Realistic Telugu podcast episodes, interviews & clips)
    now = datetime.utcnow()
    content_data = [
        {
            "platform": "youtube",
            "title": "Raw Talks Ep 45: From Village to 100 Cr Startup Founder - The Inspiring Journey (Sample)",
            "content_type": "video",
            "url": "https://youtube.com/watch?v=rawtalks45",
            "thumbnail_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
            "days_ago": 2,
            "views": 312000,
            "likes": 24500,
            "comments": 2800,
            "shares": 8400,
            "saves": 14200,
            "watch_time_hours": 38400.0,
            "reach": 460000,
            "impressions": 590000,
            "engagement_rate": 8.42
        },
        {
            "platform": "youtube",
            "title": "Raw Talks Ep 44: Inside Tollywood's Tech & VFX Revolution - Exclusive Conversation (Sample)",
            "content_type": "video",
            "url": "https://youtube.com/watch?v=rawtalks44",
            "thumbnail_url": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80",
            "days_ago": 6,
            "views": 245000,
            "likes": 19200,
            "comments": 1940,
            "shares": 5800,
            "saves": 9800,
            "watch_time_hours": 26500.0,
            "reach": 340000,
            "impressions": 450000,
            "engagement_rate": 7.85
        },
        {
            "platform": "youtube",
            "title": "The Brutal Truth About Building a Business in Telugu States | Ep 43 Highlights (Sample)",
            "content_type": "video",
            "url": "https://youtube.com/watch?v=rawtalks43",
            "thumbnail_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80",
            "days_ago": 12,
            "views": 189000,
            "likes": 14200,
            "comments": 1680,
            "shares": 4200,
            "saves": 7100,
            "watch_time_hours": 18200.0,
            "reach": 260000,
            "impressions": 340000,
            "engagement_rate": 7.24
        },
        {
            "platform": "instagram",
            "title": "Top 5 Life Lessons from our Most Viral Podcast Guests 🎙️ (Sample Reel)",
            "content_type": "reel",
            "url": "https://instagram.com/reel/rawtalks_reel1",
            "thumbnail_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
            "days_ago": 1,
            "views": 142000,
            "likes": 12800,
            "comments": 840,
            "shares": 4900,
            "saves": 8600,
            "watch_time_hours": 1280.0,
            "reach": 185000,
            "impressions": 225000,
            "engagement_rate": 8.92
        },
        {
            "platform": "instagram",
            "title": "Behind the Scenes: How We Set Up Raw Talks Studio (Gear & Microphones) (Sample)",
            "content_type": "post",
            "url": "https://instagram.com/p/rawtalks_bts",
            "thumbnail_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80",
            "days_ago": 4,
            "views": 68000,
            "likes": 6400,
            "comments": 410,
            "shares": 1200,
            "saves": 3900,
            "watch_time_hours": 420.0,
            "reach": 86000,
            "impressions": 104000,
            "engagement_rate": 6.25
        },
        {
            "platform": "tiktok",
            "title": "How this young founder rejected a 50L package to build in Hyderabad 💡 (Sample Clip)",
            "content_type": "video",
            "url": "https://tiktok.com/@rawtalks_clips/1",
            "thumbnail_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
            "days_ago": 3,
            "views": 425000,
            "likes": 38600,
            "comments": 2100,
            "shares": 18400,
            "saves": 24800,
            "watch_time_hours": 4800.0,
            "reach": 540000,
            "impressions": 660000,
            "engagement_rate": 10.82
        },
        {
            "platform": "linkedin",
            "title": "Creator Economy in South India: Why Regional Content is Skyrocketing in 2026 (Sample Post)",
            "content_type": "post",
            "url": "https://linkedin.com/posts/rawtalks1",
            "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
            "days_ago": 5,
            "views": 38500,
            "likes": 2900,
            "comments": 380,
            "shares": 840,
            "saves": 1620,
            "watch_time_hours": 620.0,
            "reach": 49000,
            "impressions": 62000,
            "engagement_rate": 6.54
        },
        {
            "platform": "twitter",
            "title": "10 key business insights from our conversation with serial entrepreneurs (Thread) 🧵 (Sample)",
            "content_type": "post",
            "url": "https://x.com/rawtalks_vk/1",
            "thumbnail_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
            "days_ago": 2,
            "views": 124000,
            "likes": 8400,
            "comments": 720,
            "shares": 2600,
            "saves": 5100,
            "watch_time_hours": 580.0,
            "reach": 165000,
            "impressions": 198000,
            "engagement_rate": 6.84
        },
        {
            "platform": "facebook",
            "title": "Full Episode Community Discussion: What is the biggest career dilemma in your 20s? (Sample)",
            "content_type": "post",
            "url": "https://facebook.com/rawtalkswithvk/posts/1",
            "thumbnail_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
            "days_ago": 4,
            "views": 54000,
            "likes": 3100,
            "comments": 580,
            "shares": 1100,
            "saves": 1400,
            "watch_time_hours": 240.0,
            "reach": 72000,
            "impressions": 88000,
            "engagement_rate": 5.82
        },
        {
            "platform": "youtube",
            "title": "Raw Talks Ep 42: Financial Literacy & Freedom for Young Telugu Professionals (Sample)",
            "content_type": "video",
            "url": "https://youtube.com/watch?v=rawtalks42",
            "thumbnail_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
            "days_ago": 15,
            "views": 276000,
            "likes": 21400,
            "comments": 2300,
            "shares": 6900,
            "saves": 12400,
            "watch_time_hours": 32100.0,
            "reach": 380000,
            "impressions": 495000,
            "engagement_rate": 8.12
        }
    ]

    for item in content_data:
        content = ContentItem(
            user_id=primary_creator.id,
            platform=item["platform"],
            title=item["title"],
            content_type=item["content_type"],
            url=item["url"],
            thumbnail_url=item["thumbnail_url"],
            published_at=now - timedelta(days=item["days_ago"]),
            views=item["views"],
            likes=item["likes"],
            comments=item["comments"],
            shares=item["shares"],
            saves=item["saves"],
            watch_time_hours=item["watch_time_hours"],
            reach=item["reach"],
            impressions=item["impressions"],
            engagement_rate=item["engagement_rate"]
        )
        db.add(content)

    # 4. Audience Demographics Data (Regional Telugu & Global Diaspora Profile)
    demographics_data = [
        # Age
        {"platform": "all", "category": "age", "label": "18-24", "percentage": 38.5, "count": 587125},
        {"platform": "all", "category": "age", "label": "25-34", "percentage": 43.8, "count": 667950},
        {"platform": "all", "category": "age", "label": "35-44", "percentage": 12.2, "count": 186050},
        {"platform": "all", "category": "age", "label": "45-54", "percentage": 3.8, "count": 57950},
        {"platform": "all", "category": "age", "label": "55+", "percentage": 1.7, "count": 25925},
        # Gender
        {"platform": "all", "category": "gender", "label": "Male", "percentage": 64.2, "count": 979050},
        {"platform": "all", "category": "gender", "label": "Female", "percentage": 32.6, "count": 497150},
        {"platform": "all", "category": "gender", "label": "Non-binary / Other", "percentage": 3.2, "count": 48800},
        # Geographic
        {"platform": "all", "category": "country", "label": "India", "percentage": 74.2, "count": 1131550},
        {"platform": "all", "category": "country", "label": "United States", "percentage": 12.4, "count": 189100},
        {"platform": "all", "category": "country", "label": "United Arab Emirates", "percentage": 5.1, "count": 77775},
        {"platform": "all", "category": "country", "label": "United Kingdom", "percentage": 3.2, "count": 48800},
        {"platform": "all", "category": "country", "label": "Australia", "percentage": 2.3, "count": 35075},
        {"platform": "all", "category": "country", "label": "Others", "percentage": 2.8, "count": 42700},
        # Device
        {"platform": "all", "category": "device", "label": "Mobile (iOS/Android)", "percentage": 76.5, "count": 1166625},
        {"platform": "all", "category": "device", "label": "Desktop (Mac/PC)", "percentage": 18.2, "count": 277550},
        {"platform": "all", "category": "device", "label": "Tablet & Smart TV", "percentage": 5.3, "count": 80825},
        # Active Hours (Peak IST/UTC)
        {"platform": "all", "category": "active_hour", "label": "12:00 PM", "percentage": 8.5, "count": 129625},
        {"platform": "all", "category": "active_hour", "label": "03:00 PM", "percentage": 11.2, "count": 170800},
        {"platform": "all", "category": "active_hour", "label": "06:00 PM", "percentage": 22.4, "count": 341600},
        {"platform": "all", "category": "active_hour", "label": "08:00 PM", "percentage": 26.8, "count": 408700},
        {"platform": "all", "category": "active_hour", "label": "10:00 PM", "percentage": 18.1, "count": 276025},
        {"platform": "all", "category": "active_hour", "label": "11:30 PM", "percentage": 13.0, "count": 198250},
    ]

    for d in demographics_data:
        demo = AudienceDemographic(
            user_id=primary_creator.id,
            platform=d["platform"],
            category=d["category"],
            label=d["label"],
            percentage=d["percentage"],
            count=d["count"]
        )
        db.add(demo)

    db.commit()
    print("--- Successfully Seeded CreatorIQ with Raw Talks With VK Demo Dataset! ---")
