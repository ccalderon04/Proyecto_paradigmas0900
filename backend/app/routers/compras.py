"""Router de `/compras` — registro de compras a proveedor, aumenta inventario."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.compra import Compra
from app.schemas.compra import CompraCrear, CompraRespuesta
from app.services.compra_service import registrar_compra

router = APIRouter(prefix="/compras", tags=["Compras"])


@router.post("/", response_model=CompraRespuesta, status_code=status.HTTP_201_CREATED)
def crear_compra(datos: CompraCrear, db: Session = Depends(get_db)):
    """Registra una compra a proveedor y aumenta automáticamente el stock de cada producto."""
    items = [(item.id_producto, item.cantidad, item.precio_unitario) for item in datos.items]

    try:
        compra = registrar_compra(db, id_proveedor=datos.id_proveedor, items=items)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return compra


@router.get("/", response_model=list[CompraRespuesta])
def listar_compras(db: Session = Depends(get_db)):
    """Historial de compras — usado por compras.php para mostrar el listado."""
    return db.query(Compra).all()