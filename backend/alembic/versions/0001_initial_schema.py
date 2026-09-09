"""Initial schema: users, roles, platform_accounts

Revision ID: 0001_initial_schema
Revises:
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table("organizations", sa.Column("id", sa.String(length=36), nullable=False), sa.Column("name", sa.String(length=120), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.PrimaryKeyConstraint("id"))
    op.create_table("roles", sa.Column("id", sa.String(length=36), nullable=False), sa.Column("code", sa.String(length=40), nullable=False), sa.Column("name", sa.String(length=80), nullable=False), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("code"))
    op.create_table("users", sa.Column("id", sa.String(length=36), nullable=False), sa.Column("organization_id", sa.String(length=36), nullable=False), sa.Column("email", sa.String(length=255), nullable=False), sa.Column("display_name", sa.String(length=120), nullable=False), sa.Column("password_hash", sa.String(length=256), nullable=False), sa.Column("role", sa.String(length=40), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("organization_id", "email"))
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_organization_id"), "users", ["organization_id"], unique=False)
    op.create_table("platform_accounts", sa.Column("id", sa.String(length=36), nullable=False), sa.Column("user_id", sa.String(length=36), nullable=False), sa.Column("platform_name", sa.String(length=40), nullable=False), sa.Column("platform_user_id", sa.String(length=255), nullable=False), sa.Column("access_token", sa.Text(), nullable=False), sa.Column("refresh_token", sa.Text(), nullable=True), sa.Column("token_expires_at", sa.DateTime(), nullable=True), sa.Column("scopes", sa.Text(), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.Column("updated_at", sa.DateTime(), nullable=False), sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("user_id", "platform_name", "platform_user_id"))
    op.create_index(op.f("ix_platform_accounts_platform_name"), "platform_accounts", ["platform_name"], unique=False)
    op.create_index(op.f("ix_platform_accounts_user_id"), "platform_accounts", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_platform_accounts_user_id"), table_name="platform_accounts")
    op.drop_index(op.f("ix_platform_accounts_platform_name"), table_name="platform_accounts")
    op.drop_table("platform_accounts")
    op.drop_index(op.f("ix_users_organization_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.drop_table("roles")
    op.drop_table("organizations")