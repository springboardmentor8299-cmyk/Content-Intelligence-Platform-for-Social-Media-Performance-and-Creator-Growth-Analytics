from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Revenue(Base):
    __tablename__ = "revenue"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    creator_id: Mapped[int] = mapped_column(ForeignKey("creators.id"))
    platform: Mapped[str] = mapped_column(String(50))
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )