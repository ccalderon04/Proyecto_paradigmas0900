"""Schemas Pydantic de `carrito` y `detalle_carrito`."""

import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.producto import ProductoRespuesta


class ItemCarritoAgregar(BaseModel):
    id_producto: uuid.UUID
    cantidad: int = Field(gt=0)


class DetalleCarritoRespuesta(BaseModel):
    id_detalle: uuid.UUID
    id_producto: uuid.UUID
    cantidad: int
    producto: ProductoRespuesta

    model_config = ConfigDict(from_attributes=True)


class CarritoRespuesta(BaseModel):
    id_carrito: uuid.UUID
    id_cliente: uuid.UUID
    fecha_creacion: date
    estado: bool
    detalles: list[DetalleCarritoRespuesta] = []
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)