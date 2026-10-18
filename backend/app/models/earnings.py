from sqlalchemy import (
    Column,
    Integer,
    Float,
    Date,
    ForeignKey,
    String
)

from app.database import Base


class Earnings(Base):
    __tablename__ = "earnings"

    # Primary Key
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Creator/User reference
    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Earnings date
    date = Column(
        Date,
        nullable=False
    )

    # YouTube estimated earnings
    estimated_revenue = Column(
        Float,
        default=0.0
    )

    # Estimated ad revenue
    ad_revenue = Column(
        Float,
        default=0.0
    )

    # Number of monetized views
    monetized_views = Column(
        Integer,
        default=0
    )

    # Currency
    currency = Column(
        String,
        default="USD"
    )