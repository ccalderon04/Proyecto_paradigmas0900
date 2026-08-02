import uuid
from datetime import date, timedelta
from decimal import Decimal

from app.models.catalogos import Descuento
from app.services.facturacion_service import (
    calcular_desglose_factura,
    calcular_impuestos,
    calcular_linea,
    calcular_subtotal,
    lineas_con_descuento,
    total_ahorrado,
)


def _descuento_porcentaje(valor: str) -> Descuento:
    return Descuento(
        id_descuento=uuid.uuid4(),
        nombre="Descuento de prueba",
        valor=Decimal(valor),
        tipo="porcentaje",
        fecha_inicio=date.today() - timedelta(days=1),
        fecha_fin=date.today() + timedelta(days=1),
        activo=True,
    )


def test_calcular_linea_sin_descuento():
    id_producto = uuid.uuid4()
    linea = calcular_linea(
        id_producto=id_producto, cantidad=3, precio_unitario=Decimal("100.00"), descuento=None
    )
    assert linea.total_linea == Decimal("300.00")
    assert linea.monto_descuento == Decimal("0.00")


def test_calcular_linea_con_descuento_porcentaje():
    id_producto = uuid.uuid4()
    descuento = _descuento_porcentaje("10")  # 10%
    linea = calcular_linea(
        id_producto=id_producto,
        cantidad=2,
        precio_unitario=Decimal("50.00"),
        descuento=descuento,
    )
    assert linea.monto_descuento == Decimal("10.00")
    assert linea.total_linea == Decimal("90.00")


def test_desglose_completo_sin_descuentos():
    id_p1, id_p2 = uuid.uuid4(), uuid.uuid4()
    items = [
        (id_p1, 2, Decimal("250.00"), None),  # 500.00
        (id_p2, 1, Decimal("150.00"), None),  # 150.00
    ]
    desglose = calcular_desglose_factura(items, tasa_impuesto=Decimal("0.15"))

    assert desglose.subtotal == Decimal("650.00")
    assert desglose.impuestos == Decimal("97.50")  # 650 * 0.15
    assert desglose.total == Decimal("747.50")

    assert desglose.total == desglose.subtotal + desglose.impuestos


def test_desglose_con_descuento_mixto():
    id_p1, id_p2 = uuid.uuid4(), uuid.uuid4()
    descuento = _descuento_porcentaje("20")
    items = [
        (id_p1, 1, Decimal("100.00"), descuento),
        (id_p2, 2, Decimal("50.00"), None),
    ]
    desglose = calcular_desglose_factura(items, tasa_impuesto=Decimal("0.15"))

    assert desglose.subtotal == Decimal("180.00")
    assert desglose.total == desglose.subtotal + desglose.impuestos


def test_lineas_con_descuento_filtra_correctamente():
    id_p1, id_p2 = uuid.uuid4(), uuid.uuid4()
    descuento = _descuento_porcentaje("15")
    items = [
        (id_p1, 1, Decimal("100.00"), descuento),
        (id_p2, 1, Decimal("100.00"), None),
    ]
    desglose = calcular_desglose_factura(items)
    con_descuento = lineas_con_descuento(desglose.lineas)

    assert len(con_descuento) == 1
    assert con_descuento[0].id_producto == id_p1


def test_total_ahorrado_suma_todos_los_descuentos():
    id_p1, id_p2 = uuid.uuid4(), uuid.uuid4()
    desc_10 = _descuento_porcentaje("10")
    desc_20 = _descuento_porcentaje("20")
    items = [
        (id_p1, 1, Decimal("100.00"), desc_10),  # ahorra 10.00
        (id_p2, 1, Decimal("100.00"), desc_20),  # ahorra 20.00
    ]
    desglose = calcular_desglose_factura(items)
    assert total_ahorrado(desglose.lineas) == Decimal("30.00")


def test_carrito_grande_no_pierde_precision_en_check_de_factura():
    items = []
    for i in range(7):
        descuento = _descuento_porcentaje(str(5 + i)) if i % 2 == 0 else None
        items.append((uuid.uuid4(), i + 1, Decimal(f"{19.99 + i}"), descuento))

    desglose = calcular_desglose_factura(items)
    assert desglose.total == desglose.subtotal + desglose.impuestos