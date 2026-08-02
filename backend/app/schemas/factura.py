import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.cliente import ClienteRespuesta


class FacturaGenerar(BaseModel):
    id_carrito: uuid.UUID
    id_metodo_pago: uuid.UUID
    id_direccion: uuid.UUID | None
    descuentos_por_producto: dict[uuid.UUID, uuid.UUID] = {}


class ProductoResumenFactura(BaseModel):
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


class DepartamentoResumenFactura(BaseModel):
    id_departamento: uuid.UUID
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class CiudadResumenFactura(BaseModel):
    id_ciudad: uuid.UUID
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class DireccionResumenFactura(BaseModel):
    id_direccion: uuid.UUID
    calle: str
    colonia: str
    departamento: DepartamentoResumenFactura
    ciudad: CiudadResumenFactura

    model_config = ConfigDict(from_attributes=True)


class FacturaRespuesta(BaseModel):
    id_factura: uuid.UUID
    id_cliente: uuid.UUID
    id_direccion: uuid.UUID | None
    cliente: ClienteRespuesta
    direccion: DireccionResumenFactura | None
    fecha: datetime
    subtotal: Decimal
    impuestos: Decimal
    total: Decimal
    id_metodo_pago: uuid.UUID
    estado: bool
    detalles: list[DetalleFacturaRespuesta] = []

    model_config = ConfigDict(from_attributes=True)