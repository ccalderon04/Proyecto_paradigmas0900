"""Schemas Pydantic de `factura` y `detalle_factura`."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class FacturaGenerar(BaseModel):
    """
    Lo que el cliente envía para generar una factura a partir de su
    carrito (compra simulada). El carrito ya tiene sus líneas — aquí
    solo se indica cómo pagar y, opcionalmente, qué descuentos aplicar
    por producto.
    """

    id_carrito: uuid.UUID
    id_metodo_pago: uuid.UUID
    # Mapa opcional: id_producto -> id_descuento a aplicar en esa línea.
    # Si un producto del carrito no aparece aquí, esa línea no lleva descuento.
    descuentos_por_producto: dict[uuid.UUID, uuid.UUID] = {}


class DetalleFacturaRespuesta(BaseModel):
    id_detalle: uuid.UUID
    id_producto: uuid.UUID
    cantidad: int
    id_descuento: uuid.UUID | None
    total: Decimal
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class FacturaRespuesta(BaseModel):
    id_factura: uuid.UUID
    id_cliente: uuid.UUID
    fecha: datetime
    subtotal: Decimal
    impuestos: Decimal
    total: Decimal
    id_metodo_pago: uuid.UUID
    estado: bool
    detalles: list[DetalleFacturaRespuesta] = []

    model_config = ConfigDict(from_attributes=True)