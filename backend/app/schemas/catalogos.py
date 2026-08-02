import uuid
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class MetodoPagoRespuesta(BaseModel):
    id_metodo_pago: uuid.UUID
    nombre: str
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class DescuentoBase(BaseModel):
    nombre: str
    valor: Decimal = Field(gt=0)
    tipo: Literal["porcentaje", "monto_fijo"]
    fecha_inicio: date
    fecha_fin: date
    activo: bool = True

    @model_validator(mode="after")
    def validar_reglas_de_negocio(self) -> "DescuentoBase":

        if self.tipo == "porcentaje" and not (Decimal("0") < self.valor <= Decimal("100")):
            raise ValueError("Para tipo 'porcentaje', el valor debe estar entre 0 y 100")
        if self.fecha_fin < self.fecha_inicio:
            raise ValueError("fecha_fin no puede ser anterior a fecha_inicio")
        return self


class DescuentoCrear(DescuentoBase):
    pass


class DescuentoActualizar(BaseModel):

    nombre: str | None = None
    valor: Decimal | None = Field(gt=0, default=None)
    tipo: Literal["porcentaje", "monto_fijo"] | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    activo: bool | None = None


class DescuentoRespuesta(DescuentoBase):
    id_descuento: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

