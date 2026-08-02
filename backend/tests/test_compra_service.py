import uuid
from decimal import Decimal

from app.services.compra_service import calcular_lineas_compra, calcular_total_compra


def test_calcular_lineas_compra_con_map():
    id_p1, id_p2 = uuid.uuid4(), uuid.uuid4()
    items = [
        (id_p1, 10, Decimal("5.50")),
        (id_p2, 3, Decimal("20.00")),
    ]
    lineas = calcular_lineas_compra(items)

    assert lineas[0].subtotal == Decimal("55.00")
    assert lineas[1].subtotal == Decimal("60.00")


def test_calcular_total_compra_con_reduce():
    id_p1, id_p2, id_p3 = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
    items = [
        (id_p1, 10, Decimal("5.50")),  # 55.00
        (id_p2, 3, Decimal("20.00")),  # 60.00
        (id_p3, 1, Decimal("99.99")),  # 99.99
    ]
    lineas = calcular_lineas_compra(items)
    total = calcular_total_compra(lineas)

    assert total == Decimal("214.99")