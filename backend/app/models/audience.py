from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Audience(Base):
    __tablename__ = "audience"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False)

    age_group = Column(String, nullable=False)

    gender = Column(String, nullable=True)

    location = Column(String, nullable=True)

    device = Column(String, nullable=True)

    active_hour = Column(String, nullable=True)

    engagement_rate = Column(Float, nullable=True)

    audience_count = Column(Integer, nullable=False, default=0)