import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.producto import Producto
from app.schemas.producto import (
    ProductoActualizar,
    ProductoConCategoria,
    ProductoCrear,
    ProductoRespuesta,
)

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=list[ProductoRespuesta])
def listar_productos(solo_activos: bool = True, db: Session = Depends(get_db)):
    query = db.query(Producto)
    if solo_activos:
        query = query.filter(Producto.estado == True)
    return query.all()


@router.get("/categoria/{id_categoria}", response_model=list[ProductoRespuesta])
def filtrar_por_categoria(
    id_categoria: uuid.UUID, solo_activos: bool = True, db: Session = Depends(get_db)
):
    query = db.query(Producto).filter(Producto.id_categoria == id_categoria)
    if solo_activos:
        query = query.filter(Producto.estado == True)
    return query.all()


@router.get("/{id_producto}", response_model=ProductoConCategoria)
def obtener_producto(id_producto: uuid.UUID, db: Session = Depends(get_db)):
    producto = (
        db.query(Producto)
        .options(joinedload(Producto.categoria))
        .filter(Producto.id_producto == id_producto)
        .first()
    )
    if producto is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoRespuesta, status_code=status.HTTP_201_CREATED)
def crear_producto(datos: ProductoCrear, db: Session = Depends(get_db)):
    producto = Producto(**datos.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


@router.put("/{id_producto}", response_model=ProductoRespuesta)
def actualizar_producto(
    id_producto: uuid.UUID, datos: ProductoActualizar, db: Session = Depends(get_db)
):
    producto = db.get(Producto, id_producto)
    if producto is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{id_producto}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(id_producto: uuid.UUID, db: Session = Depends(get_db)):
    producto = db.get(Producto, id_producto)
    if producto is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()