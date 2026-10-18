from sqlalchemy import Column, Integer, Float, Date, ForeignKey

from app.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Creator/User reference
    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Analytics date
    date = Column(Date, nullable=False)

    # Content Performance Metrics
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)

    # Watch time
    watch_time = Column(Float, default=0.0)

    # Audience Metrics
    followers = Column(Integer, default=0)
    reach = Column(Integer, default=0)

    # Engagement
    engagement_rate = Column(Float, default=0.0)