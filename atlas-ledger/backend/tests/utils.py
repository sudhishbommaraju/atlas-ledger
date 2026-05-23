import uuid
from decimal import Decimal
from datetime import datetime, timezone
from app.models import LedgerEntry


def make_entry(**kwargs) -> LedgerEntry:
    defaults = {
        "id": str(uuid.uuid4()),
        "source": "stripe",
        "transaction_type": "charge",
        "amount": Decimal("1000.00"),
        "currency": "USD",
        "status": "settled",
        "event_timestamp": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    defaults.update(kwargs)
    return LedgerEntry(**defaults)
