import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class TarjetaCliente(Base):
    __tablename__ = "tarjeta_cliente"

    id_tarjeta = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_cliente = Column(UUID(as_uuid=True), ForeignKey("cliente.id_cliente"), nullable=False)
    titular = Column(String(200), nullable=False)
    ultimos_digitos = Column(String(4), nullable=False)
    marca = Column(String(20), nullable=False)
    fecha_expiracion = Column(String(7), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)