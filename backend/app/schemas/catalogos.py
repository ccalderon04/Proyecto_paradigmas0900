"""Schemas Pydantic de `metodo_pago` y `descuento` — solo lectura (listados)."""

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
        """
        Replica en Pydantic los mismos CHECK que ya existen en la tabla
        `descuento` de la base de datos:
        - ck_descuento_porcentaje: si tipo='porcentaje', valor debe estar en (0, 100]
        - ck_descuento_fechas: fecha_fin >= fecha_inicio

        Validarlo aquí también (y no solo confiar en el CHECK de Postgres)
        permite devolver un error 422 claro desde la API en vez de que el
        cliente reciba un error crudo de base de datos.
        """
        if self.tipo == "porcentaje" and not (Decimal("0") < self.valor <= Decimal("100")):
            raise ValueError("Para tipo 'porcentaje', el valor debe estar entre 0 y 100")
        if self.fecha_fin < self.fecha_inicio:
            raise ValueError("fecha_fin no puede ser anterior a fecha_inicio")
        return self


class DescuentoCrear(DescuentoBase):
    pass


class DescuentoActualizar(BaseModel):
    """
    Todos los campos opcionales para permitir actualización parcial
    (PUT con solo los campos que cambian). La validación cruzada
    tipo/valor y fechas se hace en el router, ya que aquí no siempre
    se tienen ambos valores disponibles a la vez (ej. si solo se
    actualiza `valor` sin reenviar `tipo`).
    """

    nombre: str | None = None
    valor: Decimal | None = Field(gt=0, default=None)
    tipo: Literal["porcentaje", "monto_fijo"] | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    activo: bool | None = None


class DescuentoRespuesta(DescuentoBase):
    id_descuento: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

