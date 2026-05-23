from decimal import Decimal, ROUND_HALF_UP

ZERO = Decimal("0.00")


def to_money_str(value: Decimal | None) -> str:
    if value is None:
        return "0.00"
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def coerce_decimal(value) -> Decimal:
    if value is None:
        return ZERO
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
