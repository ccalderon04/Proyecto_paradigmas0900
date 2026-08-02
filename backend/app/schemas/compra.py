import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProveedorBase(BaseModel):
    nombre: str
    contacto: str | None = None
    telefono: str | None = None
    correo: str | None = None
    estado: bool = True


class ProveedorCrear(ProveedorBase):
    pass


class ProveedorActualizar(BaseModel):
    nombre: str | None = None
    contacto: str | None = None
    telefono: str | None = None
    correo: str | None = None
    estado: bool | None = None


class ProveedorRespuesta(ProveedorBase):
    id_proveedor: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class ItemCompra(BaseModel):
    id_producto: uuid.UUID
    cantidad: int = Field(gt=0)
    precio_unitario: Decimal = Field(gt=0)


class CompraCrear(BaseModel):
    id_proveedor: uuid.UUID
    items: list[ItemCompra] = Field(min_length=1)


class DetalleCompraRespuesta(BaseModel):
    id_detalle: uuid.UUID
    id_producto: uuid.UUID
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)


class CompraRespuesta(BaseModel):
    id_compra: uuid.UUID
    id_proveedor: uuid.UUID
    fecha: datetime
    total: Decimal
    detalles: list[DetalleCompraRespuesta] = []

    model_config = ConfigDict(from_attributes=True)