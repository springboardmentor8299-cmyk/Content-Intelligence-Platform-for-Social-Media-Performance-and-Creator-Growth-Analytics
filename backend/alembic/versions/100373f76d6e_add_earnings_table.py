"""add earnings table

Revision ID: 100373f76d6e
Revises: 110a56a5ac11
Create Date: 2026-09-14 11:41:45.546542

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# =====================================================
# REVISION IDENTIFIERS
# =====================================================

revision: str = "100373f76d6e"

down_revision: Union[
    str,
    Sequence[str],
    None
] = "110a56a5ac11"

branch_labels: Union[
    str,
    Sequence[str],
    None
] = None

depends_on: Union[
    str,
    Sequence[str],
    None
] = None


# =====================================================
# UPGRADE
# =====================================================

def upgrade() -> None:

    op.create_table(
        "earnings",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "creator_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "date",
            sa.Date(),
            nullable=False
        ),

        sa.Column(
            "estimated_revenue",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "ad_revenue",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "monetized_views",
            sa.Integer(),
            nullable=True
        ),

        sa.Column(
            "currency",
            sa.String(),
            nullable=True
        ),

        sa.ForeignKeyConstraint(
            ["creator_id"],
            ["users.id"]
        ),

        sa.PrimaryKeyConstraint(
            "id"
        )
    )

    op.create_index(
        op.f("ix_earnings_id"),
        "earnings",
        ["id"],
        unique=False
    )


# =====================================================
# DOWNGRADE
# =====================================================

def downgrade() -> None:

    op.drop_index(
        op.f("ix_earnings_id"),
        table_name="earnings"
    )

    op.drop_table(
        "earnings"
    )