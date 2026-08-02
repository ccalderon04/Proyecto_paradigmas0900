"""Schemas Pydantic de `producto`."""

from typing import Optional
import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.categoria import CategoriaRespuesta


class ProductoBase(BaseModel):
    id_categoria: uuid.UUID
    nombre: str
    descripcion: str | None = None
    stock: int = Field(ge=0, default=0)
    cantidad: Optional[Decimal] = None
    u_medida: str | None = None
    precio: Decimal = Field(gt=0)
    estado: bool = True


class ProductoCrear(ProductoBase):
    pass


class ProductoActualizar(BaseModel):
    id_categoria: uuid.UUID | None = None
    nombre: str | None = None
    descripcion: str | None = None
    stock: int | None = Field(ge=0, default=None)
    cantidad: Optional[Decimal] | None = None
    u_medida: str | None = None
    precio: Decimal | None = Field(gt=0, default=None)
    estado: bool | None = None


class ProductoRespuesta(ProductoBase):
    id_producto: uuid.UUID
    fecha_registro: date

    model_config = ConfigDict(from_attributes=True)


class ProductoConCategoria(ProductoRespuesta):
    """
    Versión extendida usada en el endpoint de detalle de producto —
    la tienda virtual necesita el nombre de la categoría, no solo su ID,
    para mostrar la página de producto individual.
    """

    categoria: CategoriaRespuesta

    model_config = ConfigDict(from_attributes=True)
