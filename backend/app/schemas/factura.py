"""Schemas Pydantic de `factura` y `detalle_factura`."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class FacturaGenerar(BaseModel):
    id_carrito: uuid.UUID
    id_metodo_pago: uuid.UUID
    descuentos_por_producto: dict[uuid.UUID, uuid.UUID] = {}


class ProductoResumenFactura(BaseModel):
    """Versión mínima del producto, solo para mostrar en el detalle de una factura."""

    id_producto: uuid.UUID
    nombre: str
    precio: Decimal

    model_config = ConfigDict(from_attributes=True)


class DetalleFacturaRespuesta(BaseModel):
    id_detalle: uuid.UUID
    id_producto: uuid.UUID
    producto: ProductoResumenFactura
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