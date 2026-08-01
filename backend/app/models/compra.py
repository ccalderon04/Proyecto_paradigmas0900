"""Modelos de `proveedor`, `compra` y `detalle_compra` (módulo de inventario)."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Proveedor(Base):
    __tablename__ = "proveedor"

    id_proveedor: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    contacto: Mapped[str | None] = mapped_column(String(200), nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(30), nullable=True)
    correo: Mapped[str | None] = mapped_column(String(200), nullable=True)
    estado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Compra(Base):
    __tablename__ = "compra"
    __table_args__ = (CheckConstraint("total >= 0", name="ck_compra_total"),)

    id_compra: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_proveedor: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("proveedor.id_proveedor"), nullable=False
    )
    fecha: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))

    proveedor: Mapped["Proveedor"] = relationship()
    detalles: Mapped[list["DetalleCompra"]] = relationship(
        back_populates="compra", cascade="all, delete-orphan"
    )


class DetalleCompra(Base):
    __tablename__ = "detalle_compra"
    __table_args__ = (
        CheckConstraint("cantidad > 0", name="ck_detalle_compra_cantidad"),
        CheckConstraint("precio_unitario > 0", name="ck_detalle_compra_precio"),
        CheckConstraint("subtotal >= 0", name="ck_detalle_compra_subtotal"),
    )

    id_detalle: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_compra: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("compra.id_compra", ondelete="CASCADE"), nullable=False
    )
    id_producto: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("producto.id_producto"), nullable=False
    )
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    compra: Mapped["Compra"] = relationship(back_populates="detalles")
    producto: Mapped["Producto"] = relationship()