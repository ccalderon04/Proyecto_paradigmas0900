"""
Modelo de `producto`.

Encapsula las operaciones de stock (descontar/aumentar) como métodos
propios en vez de dejar que otras capas manipulen `self.stock`
directamente sin validar — así la regla "el stock nunca puede quedar
negativo" vive en un solo lugar, aunque la base de datos también la
protege con el CHECK `ck_producto_stock`.
"""

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Date, ForeignKey, Integer, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class StockInsuficienteError(Exception):
    """Se lanza cuando se intenta descontar más stock del disponible."""

    def __init__(self, id_producto: uuid.UUID, disponible: int, solicitado: int):
        self.id_producto = id_producto
        self.disponible = disponible
        self.solicitado = solicitado
        super().__init__(
            f"Stock insuficiente para producto {id_producto}: "
            f"disponible={disponible}, solicitado={solicitado}"
        )


class Producto(Base):
    __tablename__ = "producto"
    __table_args__ = (
        CheckConstraint("precio > 0", name="ck_producto_precio"),
        CheckConstraint("stock >= 0", name="ck_producto_stock"),
    )

    id_producto: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    id_categoria: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categoria.id_categoria"), nullable=False
    )
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    u_medida: Mapped[str | None] = mapped_column(String(100), nullable=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=True)
    estado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_registro: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)

    categoria: Mapped["Categoria"] = relationship(back_populates="productos")

    def descontar_stock(self, cantidad: int) -> None:
        """
        Descuenta stock al vender (factura). Lanza StockInsuficienteError
        si no hay suficiente, en vez de dejar que el stock quede negativo
        y que sea el CHECK de la base de datos el único que lo detenga.
        """
        if cantidad <= 0:
            raise ValueError("La cantidad a descontar debe ser positiva")
        if self.stock < cantidad:
            raise StockInsuficienteError(self.id_producto, self.stock, cantidad)
        self.stock -= cantidad

    def aumentar_stock(self, cantidad: int) -> None:
        """Aumenta stock al registrar una compra a proveedor."""
        if cantidad <= 0:
            raise ValueError("La cantidad a aumentar debe ser positiva")
        self.stock += cantidad
