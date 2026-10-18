
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Date,
    ForeignKey,
    Text,
)

from app.database import Base


class Sponsorship(Base):
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    brand_name = Column(String, nullable=False)
    campaign_name = Column(String, nullable=False)

    amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String, nullable=False, default="INR")

    payment_status = Column(
        String,
        nullable=False,
        default="Pending",
    )

    start_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    paid_date = Column(Date, nullable=True)

    notes = Column(Text, nullable=True)
