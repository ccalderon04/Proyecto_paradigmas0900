"""Modelo de `direccion` — direcciones de entrega asociadas a un cliente."""

import uuid

from sqlalchemy import ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Direccion(Base):
    __tablename__ = "direccion"

    id_direccion: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_cliente: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cliente.id_cliente", ondelete="CASCADE"), nullable=False
    )
    id_departamento: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departamento.id_departamento"), nullable=False
    )
    id_ciudad: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ciudad.id_ciudad"), nullable=False
    )
    calle: Mapped[str] = mapped_column(String(100), nullable=False)
    colonia: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[str | None] = mapped_column(String(100), nullable=True)
    long: Mapped[str | None] = mapped_column(String(100), nullable=True)

    cliente: Mapped["Cliente"] = relationship(back_populates="direcciones")
    departamento: Mapped["Departamento"] = relationship()
    ciudad: Mapped["Ciudad"] = relationship()