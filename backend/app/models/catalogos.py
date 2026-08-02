import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Date, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MetodoPago(Base):
    __tablename__ = "metodo_pago"

    id_metodo_pago: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Descuento(Base):
    __tablename__ = "descuento"
    __table_args__ = (
        CheckConstraint("valor > 0", name="ck_descuento_valor"),
        CheckConstraint("tipo IN ('porcentaje', 'monto_fijo')", name="ck_descuento_tipo"),
        CheckConstraint(
            "tipo <> 'porcentaje' OR (valor > 0 AND valor <= 100)",
            name="ck_descuento_porcentaje",
        ),
        CheckConstraint("fecha_fin >= fecha_inicio", name="ck_descuento_fechas"),
    )

    id_descuento: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    tipo: Mapped[str] = mapped_column(String(200), nullable=False)
    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    productos: Mapped[list["Producto"]] = relationship(back_populates="descuento")
    
    def esta_vigente(self, hoy: date | None = None) -> bool:
        """Regla de negocio encapsulada: ¿este descuento aplica hoy?"""
        hoy = hoy or date.today()
        return self.activo and self.fecha_inicio <= hoy <= self.fecha_fin

    def aplicar_sobre(self, monto: Decimal) -> Decimal:
        if self.tipo == "porcentaje":
            return (monto * self.valor / Decimal("100")).quantize(Decimal("0.01"))
        return min(self.valor, monto)  # monto_fijo no puede descontar más que el monto mismo