import uuid
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from functools import reduce

from sqlalchemy.orm import Session

from app.models.carrito import Carrito
from app.models.catalogos import Descuento
from app.models.factura import DetalleFactura, Factura
from app.models.producto import Producto

DOS_DECIMALES = Decimal("0.01")
TASA_IMPUESTO = Decimal("0.15")

def _redondear(monto: Decimal) -> Decimal:
    return monto.quantize(DOS_DECIMALES, rounding=ROUND_HALF_UP)

@dataclass(frozen=True)
class LineaCalculada:
    id_producto: uuid.UUID
    cantidad: int
    precio_unitario: Decimal
    id_descuento: uuid.UUID | None
    monto_descuento: Decimal
    total_linea: Decimal

def calcular_descuento_linea(
    subtotal_linea: Decimal, descuento: Descuento | None
) -> Decimal:
    if descuento is None:
        return Decimal("0.00")
    return _redondear(descuento.aplicar_sobre(subtotal_linea))


def calcular_linea(
    id_producto: uuid.UUID,
    cantidad: int,
    precio_unitario: Decimal,
    descuento: Descuento | None,
) -> LineaCalculada:
    subtotal_linea = _redondear(precio_unitario * cantidad)
    monto_descuento = calcular_descuento_linea(subtotal_linea, descuento)
    total_linea = _redondear(subtotal_linea - monto_descuento)
    return LineaCalculada(
        id_producto=id_producto,
        cantidad=cantidad,
        precio_unitario=precio_unitario,
        id_descuento=descuento.id_descuento if descuento else None,
        monto_descuento=monto_descuento,
        total_linea=total_linea,
    )

def calcular_subtotal(lineas: list[LineaCalculada]) -> Decimal:
    return _redondear(
        reduce(lambda acumulado, linea: acumulado + linea.total_linea, lineas, Decimal("0.00"))
    )


def calcular_impuestos(subtotal: Decimal, tasa: Decimal = TASA_IMPUESTO) -> Decimal:
    return _redondear(subtotal * tasa)


def lineas_con_descuento(lineas: list[LineaCalculada]) -> list[LineaCalculada]:
    return list(filter(lambda linea: linea.monto_descuento > Decimal("0.00"), lineas))


def total_ahorrado(lineas: list[LineaCalculada]) -> Decimal:
    montos_descuento = map(lambda linea: linea.monto_descuento, lineas)
    return _redondear(reduce(lambda a, b: a + b, montos_descuento, Decimal("0.00")))


@dataclass(frozen=True)
class DesgloseFactura:
    lineas: list[LineaCalculada]
    subtotal: Decimal
    impuestos: Decimal
    total: Decimal


def calcular_desglose_factura(
    items: list[tuple[uuid.UUID, int, Decimal, Descuento | None]],
    tasa_impuesto: Decimal = TASA_IMPUESTO,
) -> DesgloseFactura:
    lineas = list(
        map(
            lambda item: calcular_linea(
                id_producto=item[0],
                cantidad=item[1],
                precio_unitario=item[2],
                descuento=item[3],
            ),
            items,
        )
    )

    subtotal = calcular_subtotal(lineas)
    impuestos = calcular_impuestos(subtotal, tasa_impuesto)
    total = _redondear(subtotal + impuestos)

    return DesgloseFactura(lineas=lineas, subtotal=subtotal, impuestos=impuestos, total=total)



class CarritoVacioError(Exception):
    pass


def generar_factura(
    db: Session,
    carrito: Carrito,
    id_metodo_pago: uuid.UUID,
    descuentos_por_producto: dict[uuid.UUID, uuid.UUID] | None = None,
) -> Factura:

    if not carrito.detalles:
        raise CarritoVacioError(f"El carrito {carrito.id_carrito} no tiene productos")

    descuentos_por_producto = descuentos_por_producto or {}

    ids_productos = [linea.id_producto for linea in carrito.detalles]
    productos_por_id: dict[uuid.UUID, Producto] = {
        p.id_producto: p
        for p in db.query(Producto).filter(Producto.id_producto.in_(ids_productos)).all()
    }

    ids_descuentos = list(descuentos_por_producto.values())
    descuentos_por_id: dict[uuid.UUID, Descuento] = {}
    if ids_descuentos:
        descuentos_por_id = {
            d.id_descuento: d
            for d in db.query(Descuento).filter(Descuento.id_descuento.in_(ids_descuentos)).all()
        }

    items = []
    for linea_carrito in carrito.detalles:
        producto = productos_por_id[linea_carrito.id_producto]
        id_descuento = descuentos_por_producto.get(linea_carrito.id_producto)
        descuento = descuentos_por_id.get(id_descuento) if id_descuento else None
        items.append((producto.id_producto, linea_carrito.cantidad, producto.precio, descuento))

    desglose = calcular_desglose_factura(items)

    for linea in desglose.lineas:
        productos_por_id[linea.id_producto].descontar_stock(linea.cantidad)

    factura = Factura(
        id_cliente=carrito.id_cliente,
        subtotal=desglose.subtotal,
        impuestos=desglose.impuestos,
        total=desglose.total,
        id_metodo_pago=id_metodo_pago,
    )
    factura.detalles = [
        DetalleFactura(
            id_producto=linea.id_producto,
            cantidad=linea.cantidad,
            id_descuento=linea.id_descuento,
            total=linea.total_linea,
        )
        for linea in desglose.lineas
    ]

    db.add(factura)
    carrito.estado = False
    db.commit()
    db.refresh(factura)
    return factura