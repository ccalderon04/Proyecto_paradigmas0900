import uuid

from pydantic import BaseModel, ConfigDict


class CategoriaBase(BaseModel):
    nombre: str


class CategoriaCrear(CategoriaBase):

    pass


class CategoriaActualizar(BaseModel):

    nombre: str | None = None


class CategoriaRespuesta(CategoriaBase):

    id_categoria: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
