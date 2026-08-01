"""
Modelos de `carrito` y `detalle_carrito`.

Composición: un Carrito "tiene muchos" DetalleCarrito. El carrito expone
métodos para calcular su propio subtotal recorriendo sus líneas, en vez
de que esa lógica viva dispersa en los routers.
"""

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Integer, UniqueConstraint, text
from sqlalchemy import Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Carrito(Base):
    __tablename__ = "carrito"

    id_carrito: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_cliente: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cliente.id_cliente", ondelete="CASCADE"), nullable=False
    )
    fecha_creacion: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    estado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    detalles: Mapped[list["DetalleCarrito"]] = relationship(
        back_populates="carrito", cascade="all, delete-orphan"
    )

    def calcular_subtotal(self) -> Decimal:
        """
        Suma (precio * cantidad) de cada línea del carrito.

        Nota de diseño: usamos un bucle explícito en vez de
        `sum(map(...))` aquí porque este método vive en el modelo del
        ORM y necesita acceso a `linea.producto.precio` (relación
        cargada). La versión con map/filter/reduce sobre datos ya
        desacoplados del ORM vive en app/services/facturacion_service.py,
        que es donde se demuestra el paradigma funcional pedido por
        el proyecto sin mezclarlo con detalles de persistencia.
        """
        total = Decimal("0")
        for linea in self.detalles:
            total += linea.producto.precio * linea.cantidad
        return total


class DetalleCarrito(Base):
    __tablename__ = "detalle_carrito"
    __table_args__ = (
        CheckConstraint("cantidad > 0", name="ck_detalle_carrito_cantidad"),
        UniqueConstraint("id_carrito", "id_producto", name="uq_carrito_producto"),
    )

    id_detalle: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_carrito: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("carrito.id_carrito", ondelete="CASCADE"), nullable=False
    )
    id_producto: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("producto.id_producto"), nullable=False
    )
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)

    carrito: Mapped["Carrito"] = relationship(back_populates="detalles")
    producto: Mapped["Producto"] = relationship()