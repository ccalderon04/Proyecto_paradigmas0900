"""
Router de `/carrito`.

Nota de diseño: `CarritoRespuesta.subtotal` no es una columna de la
tabla `carrito` — es calculado por `Carrito.calcular_subtotal()` (ver
app/models/carrito.py). Pydantic con from_attributes=True no puede
mapear un método automáticamente como si fuera una columna, así que
`_a_respuesta()` arma la respuesta explícitamente en vez de dejar que
FastAPI lo intente resolver solo.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.carrito import Carrito, DetalleCarrito
from app.models.producto import Producto
from app.schemas.carrito import CarritoRespuesta, ItemCarritoAgregar

router = APIRouter(prefix="/carrito", tags=["Carrito"])


def _a_respuesta(carrito: Carrito) -> CarritoRespuesta:
    """Arma CarritoRespuesta incluyendo el subtotal calculado."""
    return CarritoRespuesta(
        id_carrito=carrito.id_carrito,
        id_cliente=carrito.id_cliente,
        fecha_creacion=carrito.fecha_creacion,
        estado=carrito.estado,
        detalles=carrito.detalles,
        subtotal=carrito.calcular_subtotal(),
    )


def _obtener_carrito_activo(id_cliente: uuid.UUID, db: Session) -> Carrito | None:
    return (
        db.query(Carrito)
        .options(joinedload(Carrito.detalles).joinedload(DetalleCarrito.producto))
        .filter(Carrito.id_cliente == id_cliente, Carrito.estado == True)  # noqa: E712
        .first()
    )


@router.post("/cliente/{id_cliente}", response_model=CarritoRespuesta, status_code=status.HTTP_201_CREATED)
def crear_carrito(id_cliente: uuid.UUID, db: Session = Depends(get_db)):
    """
    Crea un carrito nuevo para un cliente. Si ya tiene uno activo, lo
    devuelve en vez de crear un duplicado (evita que un cliente termine
    con varios carritos activos por accidente).
    """
    existente = _obtener_carrito_activo(id_cliente, db)
    if existente:
        return _a_respuesta(existente)

    carrito = Carrito(id_cliente=id_cliente)
    db.add(carrito)
    db.commit()
    db.refresh(carrito)
    return _a_respuesta(carrito)


@router.get("/cliente/{id_cliente}", response_model=CarritoRespuesta)
def consultar_carrito(id_cliente: uuid.UUID, db: Session = Depends(get_db)):
    """Consulta el contenido del carrito activo actual de un cliente."""
    carrito = _obtener_carrito_activo(id_cliente, db)
    if carrito is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Este cliente no tiene un carrito activo")
    return _a_respuesta(carrito)


@router.post("/{id_carrito}/productos", response_model=CarritoRespuesta)
def agregar_producto(id_carrito: uuid.UUID, item: ItemCarritoAgregar, db: Session = Depends(get_db)):
    """
    Agrega un producto al carrito. Si el producto ya está en el
    carrito, suma la cantidad en vez de crear una segunda línea —
    respeta el UNIQUE (id_carrito, id_producto) del schema.
    """
    carrito = (
        db.query(Carrito)
        .options(joinedload(Carrito.detalles).joinedload(DetalleCarrito.producto))
        .filter(Carrito.id_carrito == id_carrito)
        .first()
    )
    if carrito is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")

    producto = db.get(Producto, item.id_producto)
    if producto is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    linea_existente = next(
        (d for d in carrito.detalles if d.id_producto == item.id_producto), None
    )
    if linea_existente:
        linea_existente.cantidad += item.cantidad
    else:
        db.add(DetalleCarrito(id_carrito=id_carrito, id_producto=item.id_producto, cantidad=item.cantidad))

    db.commit()
    db.refresh(carrito)
    return _a_respuesta(carrito)


@router.delete("/{id_carrito}/productos/{id_producto}", response_model=CarritoRespuesta)
def quitar_producto(id_carrito: uuid.UUID, id_producto: uuid.UUID, db: Session = Depends(get_db)):
    """Quita un producto del carrito por completo (toda la línea, no solo una unidad)."""
    carrito = (
        db.query(Carrito)
        .options(joinedload(Carrito.detalles).joinedload(DetalleCarrito.producto))
        .filter(Carrito.id_carrito == id_carrito)
        .first()
    )
    if carrito is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Carrito no encontrado")

    linea = next((d for d in carrito.detalles if d.id_producto == id_producto), None)
    if linea is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Ese producto no está en el carrito")

    db.delete(linea)
    db.commit()
    db.refresh(carrito)
    return _a_respuesta(carrito)