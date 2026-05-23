"""Initial schema: ledger_entries

Revision ID: 0001
Revises:
Create Date: 2026-05-17
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ledger_entries",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("external_id", sa.String(), nullable=True),
        sa.Column("transaction_type", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(18, 2), nullable=False),
        sa.Column("currency", sa.String(), nullable=False, server_default="USD"),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("event_timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("settlement_id", sa.String(), nullable=True),
        sa.Column("payout_id", sa.String(), nullable=True),
        sa.Column("exception_type", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("raw_payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index("ix_ledger_source",            "ledger_entries", ["source"])
    op.create_index("ix_ledger_transaction_type",  "ledger_entries", ["transaction_type"])
    op.create_index("ix_ledger_status",            "ledger_entries", ["status"])
    op.create_index("ix_ledger_event_timestamp",   "ledger_entries", ["event_timestamp"])
    op.create_index("ix_ledger_payout_id",         "ledger_entries", ["payout_id"])
    op.create_index("ix_ledger_settlement_id",     "ledger_entries", ["settlement_id"])


def downgrade() -> None:
    op.drop_index("ix_ledger_settlement_id",    table_name="ledger_entries")
    op.drop_index("ix_ledger_payout_id",        table_name="ledger_entries")
    op.drop_index("ix_ledger_event_timestamp",  table_name="ledger_entries")
    op.drop_index("ix_ledger_status",           table_name="ledger_entries")
    op.drop_index("ix_ledger_transaction_type", table_name="ledger_entries")
    op.drop_index("ix_ledger_source",           table_name="ledger_entries")
    op.drop_table("ledger_entries")
