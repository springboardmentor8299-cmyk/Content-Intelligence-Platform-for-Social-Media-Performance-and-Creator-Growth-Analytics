"""add audience analytics

Revision ID: 110a56a5ac11
Revises: 778be997854d
Create Date: 2026-09-09 19:45:10.965198

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "110a56a5ac11"
down_revision: Union[str, Sequence[str], None] = "778be997854d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "audience_analytics",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            index=True
        ),

        sa.Column(
            "creator_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False
        ),

        sa.Column(
            "age_group",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "gender",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "location",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "device",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "active_hour",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "audience_count",
            sa.Integer(),
            default=0
        ),

        sa.Column(
            "engagement_rate",
            sa.Float(),
            default=0.0
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_table("audience_analytics")

    