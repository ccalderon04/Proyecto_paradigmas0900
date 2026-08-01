"""
Servicio de facturación.

Este módulo separa deliberadamente dos cosas:

1. FUNCIONES PURAS (sin efectos secundarios, mismo input -> mismo output,
   no tocan la base de datos ni el ORM): calculan montos, aplican
   descuentos, arman el desglose. Aquí es donde se demuestra el
   paradigma funcional que pide el proyecto — map/filter/reduce,
   funciones de orden superior, lambdas.

2. LA FUNCIÓN DE ORQUESTACIÓN (`generar_factura`): sí tiene efectos
   secundarios (lee/escribe en la base de datos), pero delega TODO el
   cálculo a las funciones puras de arriba. No mezcla aritmética de
   negocio con persistencia.

Esta separación es intencional: permite probar la lógica de cálculo
sin necesitar una base de datos real (ver tests/test_facturacion_service.py).

NOTA IMPORTANTE sobre precisión decimal: `factura.total` tiene el
constraint de base de datos `CHECK (total = subtotal + impuestos)`.
Todo el cálculo aquí usa Decimal con quantize a 2 decimales en cada
paso para garantizar que esa igualdad se cumpla exactamente al
insertar — sumar floats o redondear solo al final podría violar el
constraint por errores de punto flotante.
"""

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
TASA_IMPUESTO = Decimal("0.15")  # 15% ISV (ajustar según lo que decida el equipo)


def _redondear(monto: Decimal) -> Decimal:
    """Redondeo consistente a 2 decimales (evita discrepancias de precisión)."""
    return monto.quantize(DOS_DECIMALES, rounding=ROUND_HALF_UP)


# ---------------------------------------------------------------------------
# TIPOS DE DATOS INMUTABLES PARA EL CÁLCULO
# ---------------------------------------------------------------------------
# Se usa un dataclass "congelado" (frozen=True) en vez de manipular
# directamente objetos del ORM: así las funciones de cálculo trabajan
# sobre datos inmutables y no pueden tener efectos secundarios por
# accidente (una función pura no puede mutar su propio input).


@dataclass(frozen=True)
class LineaCalculada:
    id_producto: uuid.UUID
    cantidad: int
    precio_unitario: Decimal
    id_descuento: uuid.UUID | None
    monto_descuento: Decimal
    total_linea: Decimal


# ---------------------------------------------------------------------------
# FUNCIONES PURAS — cálculo de una sola línea
# ---------------------------------------------------------------------------


def calcular_descuento_linea(
    subtotal_linea: Decimal, descuento: Descuento | None
) -> Decimal:
    """
    Función pura: dado un subtotal de línea y un descuento (o None),
    retorna el monto a descontar. No muta `descuento` ni nada externo.
    """
    if descuento is None:
        return Decimal("0.00")
    return _redondear(descuento.aplicar_sobre(subtotal_linea))


def calcular_linea(
    id_producto: uuid.UUID,
    cantidad: int,
    precio_unitario: Decimal,
    descuento: Descuento | None,
) -> LineaCalculada:
    """
    Función pura que calcula el total de una línea de factura:
    (precio * cantidad) - descuento_de_esa_línea.
    """
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


# ---------------------------------------------------------------------------
# FUNCIONES PURAS — cálculo del desglose completo (map / filter / reduce)
# ---------------------------------------------------------------------------


def calcular_subtotal(lineas: list[LineaCalculada]) -> Decimal:
    """
    Suma el total de todas las líneas usando `reduce` (función de orden
    superior): reduce recorre la lista aplicando una función binaria
    acumulativa, exactamente el patrón que pide la rúbrica.
    """
    return _redondear(
        reduce(lambda acumulado, linea: acumulado + linea.total_linea, lineas, Decimal("0.00"))
    )


def calcular_impuestos(subtotal: Decimal, tasa: Decimal = TASA_IMPUESTO) -> Decimal:
    """Función pura: calcula el impuesto sobre el subtotal ya con descuentos aplicados."""
    return _redondear(subtotal * tasa)


def lineas_con_descuento(lineas: list[LineaCalculada]) -> list[LineaCalculada]:
    """
    Ejemplo de uso de `filter` (orden superior): útil para reportes o
    para mostrarle al cliente qué productos de su compra llevaron
    descuento aplicado.
    """
    return list(filter(lambda linea: linea.monto_descuento > Decimal("0.00"), lineas))


def total_ahorrado(lineas: list[LineaCalculada]) -> Decimal:
    """
    Ejemplo de `map` + `reduce` combinados: extrae los montos de
    descuento de cada línea (map) y los suma (reduce), para mostrarle
    al cliente cuánto se ahorró en total en su compra.
    """
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
    """
    Función pura principal: dado un listado de
    (id_producto, cantidad, precio_unitario, descuento_opcional),
    calcula el desglose completo de la factura.

    Esta función NO toca la base de datos ni el ORM — recibe datos
    simples y devuelve datos simples. Es la pieza más fácil de probar
    de forma aislada (ver tests).
    """
    # `map` sobre los items del carrito para calcular cada línea
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
    # total = subtotal + impuestos, calculado con el mismo redondeo que
    # usa cada paso anterior, para satisfacer exactamente el CHECK de
    # la base de datos (ck_factura_total_coherente).
    total = _redondear(subtotal + impuestos)

    return DesgloseFactura(lineas=lineas, subtotal=subtotal, impuestos=impuestos, total=total)


# ---------------------------------------------------------------------------
# ORQUESTACIÓN — esta función SÍ tiene efectos secundarios (DB)
# ---------------------------------------------------------------------------


class CarritoVacioError(Exception):
    """Se lanza si se intenta facturar un carrito sin líneas."""


def generar_factura(
    db: Session,
    carrito: Carrito,
    id_metodo_pago: uuid.UUID,
    descuentos_por_producto: dict[uuid.UUID, uuid.UUID] | None = None,
) -> Factura:
    """
    Orquesta la generación de una factura a partir de un carrito:
    1. Lee los productos y descuentos necesarios de la base de datos.
    2. Delega TODO el cálculo a `calcular_desglose_factura` (función pura).
    3. Descuenta el stock de cada producto vendido.
    4. Persiste la factura y sus detalles.

    Esta función mezcla efectos secundarios (leer/escribir DB) por
    necesidad — pero nótese que no hace ninguna aritmética de negocio
    directamente; todo el cálculo ya viene resuelto del desglose puro.
    """
    if not carrito.detalles:
        raise CarritoVacioError(f"El carrito {carrito.id_carrito} no tiene productos")

    descuentos_por_producto = descuentos_por_producto or {}

    # Cargar productos y descuentos de una vez (evita N+1 queries)
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

    # Armar los items para la función pura de cálculo
    items = []
    for linea_carrito in carrito.detalles:
        producto = productos_por_id[linea_carrito.id_producto]
        id_descuento = descuentos_por_producto.get(linea_carrito.id_producto)
        descuento = descuentos_por_id.get(id_descuento) if id_descuento else None
        items.append((producto.id_producto, linea_carrito.cantidad, producto.precio, descuento))

    desglose = calcular_desglose_factura(items)

    # Descontar stock (efecto secundario, delegado al método del propio modelo)
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
    carrito.estado = False  # el carrito facturado se marca inactivo
    db.commit()
    db.refresh(factura)
    return factura