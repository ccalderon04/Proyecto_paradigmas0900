import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Factura(Base):
    __tablename__ = "factura"
    __table_args__ = (
        CheckConstraint("subtotal >= 0", name="ck_factura_subtotal"),
        CheckConstraint("impuestos >= 0", name="ck_factura_impuestos"),
        CheckConstraint("total >= 0", name="ck_factura_total"),
        CheckConstraint("total = subtotal + impuestos", name="ck_factura_total_coherente"),
    )

    id_factura: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_cliente: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cliente.id_cliente"), nullable=False
    )
    fecha: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    impuestos: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    id_metodo_pago: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("metodo_pago.id_metodo_pago"), nullable=False
    )
    estado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    cliente: Mapped["Cliente"] = relationship()
    metodo_pago: Mapped["MetodoPago"] = relationship()
    detalles: Mapped[list["DetalleFactura"]] = relationship(
        back_populates="factura", cascade="all, delete-orphan"
    )


class DetalleFactura(Base):
    __tablename__ = "detalle_factura"
    __table_args__ = (
        CheckConstraint("cantidad > 0", name="ck_detalle_factura_cantidad"),
        CheckConstraint("total >= 0", name="ck_detalle_factura_total"),
    )

    id_detalle: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_factura: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("factura.id_factura", ondelete="CASCADE"), nullable=False
    )
    id_producto: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("producto.id_producto"), nullable=False
    )
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    id_descuento: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("descuento.id_descuento"), nullable=True
    )
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    factura: Mapped["Factura"] = relationship(back_populates="detalles")
    producto: Mapped["Producto"] = relationship()
    descuento: Mapped["Descuento | None"] = relationship()