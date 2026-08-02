import uuid
from pydantic import BaseModel, ConfigDict

class DepartamentoRespuesta(BaseModel):
    id_departamento: uuid.UUID
    nombre: str
    model_config = ConfigDict(from_attributes=True)

class CiudadRespuesta(BaseModel):
    id_ciudad: uuid.UUID
    nombre: str
    model_config = ConfigDict(from_attributes=True)

class CiudadCrear(BaseModel):
    nombre: str