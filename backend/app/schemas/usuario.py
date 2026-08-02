import uuid

from pydantic import BaseModel, ConfigDict, Field


class UsuarioBase(BaseModel):
    nombre: str
    rol: str = Field(pattern="^(admin|cliente)$")
    estado: bool = True


class UsuarioCrear(UsuarioBase):
    contrasena: str = Field(min_length=6)


class UsuarioActualizar(BaseModel):
    nombre: str | None = None
    contrasena: str | None = Field(min_length=6, default=None)
    rol: str | None = Field(pattern="^(admin|cliente)$", default=None)
    estado: bool | None = None


class UsuarioRespuesta(UsuarioBase):

    id_usuario: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class LoginPeticion(BaseModel):
    nombre: str
    contrasena: str


class LoginRespuesta(BaseModel):

    id_usuario: uuid.UUID
    nombre: str
    rol: str

    model_config = ConfigDict(from_attributes=True)