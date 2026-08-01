"""Schemas Pydantic de `categoria` — qué entra y sale de los endpoints de /categorias."""

import uuid

from pydantic import BaseModel, ConfigDict


class CategoriaBase(BaseModel):
    nombre: str


class CategoriaCrear(CategoriaBase):
    """Lo que el cliente envía al crear una categoría (POST)."""

    pass


class CategoriaActualizar(BaseModel):
    """Lo que el cliente envía al actualizar (PUT/PATCH) — todo opcional."""

    nombre: str | None = None


class CategoriaRespuesta(CategoriaBase):
    """Lo que la API devuelve al cliente."""

    id_categoria: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
