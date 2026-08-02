import uuid
from pydantic import BaseModel, ConfigDict, Field

class TarjetaCrear(BaseModel):
    id_cliente: uuid.UUID
    titular: str
    ultimos_digitos: str = Field(min_length=4, max_length=4)
    marca: str
    fecha_expiracion: str

class TarjetaRespuesta(TarjetaCrear):
    id_tarjeta: uuid.UUID
    estado: bool
    model_config = ConfigDict(from_attributes=True)