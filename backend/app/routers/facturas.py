"""
Router de `/facturas`.

Genera factura a partir de un carrito (compra simulada), consulta
facturas de un cliente, y consulta el detalle de una factura específica
(la tienda virtual lo necesita para mostrar la factura tras la compra).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.carrito import Carrito
from app.models.factura import Factura
from app.models.producto import StockInsuficienteError
from app.schemas.factura import FacturaGenerar, FacturaRespuesta
from app.services.facturacion_service import CarritoVacioError, generar_factura

router = APIRouter(prefix="/facturas", tags=["Facturas"])


@router.post("/", response_model=FacturaRespuesta, status_code=status.HTTP_201_CREATED)
def generar_factura_desde_carrito(datos: FacturaGenerar, db: Session = Depends(get_db)):
    """
    Genera una factura a partir de un carrito activo (compra simulada):
    calcula subtotal, impuestos, aplica descuentos por línea, calcula
    total, y descuenta el stock de cada producto vendido.
    """
    carrito = (
        db.query(Carrito)
        .options(joinedload(Carrito.detalles))
        .filter(Carrito.id_carrito == datos.id_carrito)
        .first()
    )
    if carrito is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")
    if not carrito.estado:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Este carrito ya fue facturado o está inactivo"
        )

    try:
        factura = generar_factura(
            db=db,
            carrito=carrito,
            id_metodo_pago=datos.id_metodo_pago,
            descuentos_por_producto=datos.descuentos_por_producto,
        )
    except CarritoVacioError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="El carrito no tiene productos")
    except StockInsuficienteError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Stock insuficiente para el producto {exc.id_producto}: "
                f"disponible={exc.disponible}, solicitado={exc.solicitado}"
            ),
        )

    return factura

@router.get("/", response_model=list[FacturaRespuesta])
def listar_facturas(db: Session = Depends(get_db)):
    """Lista todas las facturas — usado por facturas.php para el panel de ventas."""
    return db.query(Factura).all()

@router.get("/cliente/{id_cliente}", response_model=list[FacturaRespuesta])
def listar_facturas_de_cliente(id_cliente: uuid.UUID, db: Session = Depends(get_db)):
    """Lista todas las facturas de un cliente."""
    return db.query(Factura).filter(Factura.id_cliente == id_cliente).all()


@router.get("/{id_factura}", response_model=FacturaRespuesta)
def obtener_detalle_factura(id_factura: uuid.UUID, db: Session = Depends(get_db)):
    """
    Detalle de una factura específica — la tienda virtual lo necesita
    para mostrar la factura generada al cliente después de comprar.
    """
    factura = (
        db.query(Factura)
        .options(joinedload(Factura.detalles))
        .filter(Factura.id_factura == id_factura)
        .first()
    )
    if factura is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Factura no encontrada")
    return factura