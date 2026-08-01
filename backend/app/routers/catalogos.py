"""
Router de `/metodos-pago` y `/descuentos` — listado simple.

La tienda y el admin los necesitan para mostrarlos como opciones
(ej. selector de método de pago al facturar, o para saber qué
descuentos están vigentes).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.catalogos import Descuento, MetodoPago
from app.schemas.catalogos import DescuentoRespuesta, MetodoPagoRespuesta

router = APIRouter(tags=["Métodos de pago y descuentos"])


@router.get("/metodos-pago", response_model=list[MetodoPagoRespuesta])
def listar_metodos_pago(db: Session = Depends(get_db)):
    return db.query(MetodoPago).filter(MetodoPago.activo == True).all()  # noqa: E712


@router.get("/descuentos", response_model=list[DescuentoRespuesta])
def listar_descuentos(db: Session = Depends(get_db)):
    """Lista los descuentos activos (la vigencia por fecha se valida al aplicar, no aquí)."""
    return db.query(Descuento).filter(Descuento.activo == True).all()  # noqa: E712