"""
Modelo de `cliente`.

Composición con Usuario: cada Cliente "tiene un" Usuario asociado
(relación 1:1 vía id_usuario UNIQUE). Los datos de autenticación viven
en Usuario; los datos personales del cliente viven aquí.
"""

import uuid
from datetime import date

from sqlalchemy import CheckConstraint, Date, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Cliente(Base):
    __tablename__ = "cliente"
    __table_args__ = (
        CheckConstraint(
            r"correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'",
            name="ck_cliente_correo",
        ),
        CheckConstraint("genero IN ('M', 'F', 'Otro') OR genero IS NULL", name="ck_cliente_genero"),
        CheckConstraint("fecha_nacimiento <= CURRENT_DATE", name="ck_cliente_fecha_nacimiento"),
        CheckConstraint(
            r"telefono ~ '^[0-9+ -]{7,30}$' OR telefono IS NULL", name="ck_cliente_telefono"
        ),
    )

    id_cliente: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_usuario: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    p_nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    s_nombre: Mapped[str | None] = mapped_column(String(100), nullable=True)
    p_apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    s_apellido: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fecha_nacimiento: Mapped[date | None] = mapped_column(Date, nullable=True)
    correo: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    telefono: Mapped[str | None] = mapped_column(String(30), nullable=True)
    genero: Mapped[str | None] = mapped_column(String(20), nullable=True)

    usuario: Mapped["Usuario"] = relationship(back_populates="cliente") # type: ignore
    direcciones: Mapped[list["Direccion"]] = relationship(
    back_populates="cliente", passive_deletes=True
)
    def nombre_completo(self) -> str:
        """Compone el nombre completo a partir de las partes almacenadas."""
        partes = [self.p_nombre, self.s_nombre, self.p_apellido, self.s_apellido]
        return " ".join(p for p in partes if p)