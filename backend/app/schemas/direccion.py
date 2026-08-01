"""Schemas Pydantic de `direccion`."""

import uuid

from pydantic import BaseModel, ConfigDict


class DireccionBase(BaseModel):
    id_departamento: uuid.UUID
    id_ciudad: uuid.UUID
    calle: str
    colonia: str
    lat: str | None = None
    long: str | None = None


class DireccionCrear(DireccionBase):
    id_cliente: uuid.UUID


class DireccionActualizar(BaseModel):
    id_departamento: uuid.UUID | None = None
    id_ciudad: uuid.UUID | None = None
    calle: str | None = None
    colonia: str | None = None
    lat: str | None = None
    long: str | None = None


class DireccionRespuesta(DireccionBase):
    id_direccion: uuid.UUID
    id_cliente: uuid.UUID

    model_config = ConfigDict(from_attributes=True)