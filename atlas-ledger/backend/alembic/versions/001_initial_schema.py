"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-18

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ledger_entries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("external_id", sa.String(255), nullable=True),
        sa.Column("transaction_type", sa.String(50), nullable=False),
        sa.Column("amount", sa.Numeric(18, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("event_timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("settlement_id", sa.String(255), nullable=True),
        sa.Column("payout_id", sa.String(255), nullable=True),
        sa.Column("counterparty_id", sa.String(255), nullable=True),
        sa.Column("account_id", sa.String(255), nullable=True),
        sa.Column("exception_type", sa.String(50), nullable=True),
        sa.Column("severity", sa.String(20), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("raw_payload", sa.JSON(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ledger_entries_source", "ledger_entries", ["source"])
    op.create_index("ix_ledger_entries_status", "ledger_entries", ["status"])
    op.create_index("ix_ledger_entries_transaction_type", "ledger_entries", ["transaction_type"])
    op.create_index("ix_ledger_entries_event_timestamp", "ledger_entries", ["event_timestamp"])


def downgrade() -> None:
    op.drop_table("ledger_entries")
