"""
Modelos de `departamento` y `ciudad`.

Son catálogos simples usados por `direccion` para ubicar al cliente.
No tienen relación jerárquica explícita entre sí en el schema (una
dirección referencia a ambos por separado).
"""

import uuid

from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Departamento(Base):
    __tablename__ = "departamento"

    id_departamento: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[str | None] = mapped_column(String(100), nullable=True)
    long: Mapped[str | None] = mapped_column(String(100), nullable=True)


class Ciudad(Base):
    __tablename__ = "ciudad"

    id_ciudad: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[str | None] = mapped_column(String(100), nullable=True)
    long: Mapped[str | None] = mapped_column(String(100), nullable=True)