from decimal import Decimal, ROUND_HALF_UP

ZERO = Decimal("0.00")
_TWO_PLACES = Decimal("0.01")


def to_decimal(value: object) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(_TWO_PLACES, rounding=ROUND_HALF_UP)


def format_money(value: Decimal) -> str:
    return str(quantize_money(value))
