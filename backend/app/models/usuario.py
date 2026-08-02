import uuid

from sqlalchemy import Boolean, CheckConstraint, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuario"
    __table_args__ = (
        CheckConstraint("rol IN ('admin', 'cliente')", name="ck_usuario_rol"),
        CheckConstraint("char_length(contrasena) >= 6", name="ck_usuario_contrasena_len"),
    )

    id_usuario: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    contrasena: Mapped[str] = mapped_column(String(100), nullable=False)
    rol: Mapped[str] = mapped_column(String(100), nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    cliente: Mapped["Cliente"] = relationship(
    back_populates="usuario", uselist=False, passive_deletes=True
)
    def es_admin(self) -> bool:
        return self.rol == "admin"

    def esta_activo(self) -> bool:
        return self.estado is True