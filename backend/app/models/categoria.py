import uuid

from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)

    productos: Mapped[list["Producto"]] = relationship(
    back_populates="categoria", passive_deletes=True
)