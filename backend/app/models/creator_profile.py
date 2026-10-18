from sqlalchemy import Column, Integer, String, ForeignKey

from app.database import Base


class CreatorProfile(Base):
    __tablename__ = "creator_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bio = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)