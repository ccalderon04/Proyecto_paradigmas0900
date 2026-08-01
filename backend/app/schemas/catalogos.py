"""Schemas Pydantic de `metodo_pago` y `descuento` — solo lectura (listados)."""

import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class MetodoPagoRespuesta(BaseModel):
    id_metodo_pago: uuid.UUID
    nombre: str
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class DescuentoRespuesta(BaseModel):
    id_descuento: uuid.UUID
    nombre: str
    valor: Decimal
    tipo: str
    fecha_inicio: date
    fecha_fin: date
    activo: bool

    model_config = ConfigDict(from_attributes=True)