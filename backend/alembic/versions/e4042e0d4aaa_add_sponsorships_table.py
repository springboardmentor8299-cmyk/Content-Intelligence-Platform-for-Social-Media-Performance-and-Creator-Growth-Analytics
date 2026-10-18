
"""add sponsorships table

Revision ID: e4042e0d4aaa
Revises: 100373f76d6e
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e4042e0d4aaa"
down_revision: Union[str, Sequence[str], None] = "100373f76d6e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sponsorships",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "creator_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("brand_name", sa.String(), nullable=False),
        sa.Column("campaign_name", sa.String(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("currency", sa.String(), nullable=False, server_default="INR"),
        sa.Column(
            "payment_status",
            sa.String(),
            nullable=False,
            server_default="Pending",
        ),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("paid_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("sponsorships")
