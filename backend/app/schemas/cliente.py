import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ClienteBase(BaseModel):
    p_nombre: str
    s_nombre: str | None = None
    p_apellido: str
    s_apellido: str | None = None
    fecha_nacimiento: date | None = None
    correo: EmailStr
    telefono: str | None = None
    genero: str | None = Field(pattern="^(M|F|Otro)$", default=None)


class ClienteRegistro(ClienteBase):
    nombre_usuario: str
    contrasena: str = Field(min_length=6)


class ClienteActualizar(BaseModel):
    p_nombre: str | None = None
    s_nombre: str | None = None
    p_apellido: str | None = None
    s_apellido: str | None = None
    fecha_nacimiento: date | None = None
    correo: EmailStr | None = None
    telefono: str | None = None
    genero: str | None = Field(pattern="^(M|F|Otro)$", default=None)


class ClienteRespuesta(ClienteBase):
    id_cliente: uuid.UUID
    id_usuario: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
