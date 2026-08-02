import uuid
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from functools import reduce

from sqlalchemy.orm import Session

from app.models.compra import Compra, DetalleCompra
from app.models.producto import Producto

DOS_DECIMALES = Decimal("0.01")


def _redondear(monto: Decimal) -> Decimal:
    return monto.quantize(DOS_DECIMALES, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class LineaCompraCalculada:
    id_producto: uuid.UUID
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal


def calcular_linea_compra(
    id_producto: uuid.UUID, cantidad: int, precio_unitario: Decimal
) -> LineaCompraCalculada:
    return LineaCompraCalculada(
        id_producto=id_producto,
        cantidad=cantidad,
        precio_unitario=precio_unitario,
        subtotal=_redondear(precio_unitario * cantidad),
    )


def calcular_total_compra(lineas: list[LineaCompraCalculada]) -> Decimal:
    return _redondear(
        reduce(lambda acumulado, linea: acumulado + linea.subtotal, lineas, Decimal("0.00"))
    )


def calcular_lineas_compra(
    items: list[tuple[uuid.UUID, int, Decimal]]
) -> list[LineaCompraCalculada]:
    return list(map(lambda item: calcular_linea_compra(item[0], item[1], item[2]), items))


def registrar_compra(
    db: Session, id_proveedor: uuid.UUID, items: list[tuple[uuid.UUID, int, Decimal]]
) -> Compra:
    lineas = calcular_lineas_compra(items)
    total = calcular_total_compra(lineas)

    ids_productos = [linea.id_producto for linea in lineas]
    productos_por_id: dict[uuid.UUID, Producto] = {
        p.id_producto: p
        for p in db.query(Producto).filter(Producto.id_producto.in_(ids_productos)).all()
    }

    faltantes = set(ids_productos) - set(productos_por_id.keys())
    if faltantes:
        raise ValueError(f"Productos no encontrados: {faltantes}")

    for linea in lineas:
        productos_por_id[linea.id_producto].aumentar_stock(linea.cantidad)

    compra = Compra(id_proveedor=id_proveedor, total=total)
    compra.detalles = [
        DetalleCompra(
            id_producto=linea.id_producto,
            cantidad=linea.cantidad,
            precio_unitario=linea.precio_unitario,
            subtotal=linea.subtotal,
        )
        for linea in lineas
    ]

    db.add(compra)
    db.commit()
    db.refresh(compra)
    return compra