"""Router de `/proveedores` — CRUD, usado solo por el portal admin."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.compra import Proveedor
from app.schemas.compra import ProveedorActualizar, ProveedorCrear, ProveedorRespuesta

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])


@router.get("/", response_model=list[ProveedorRespuesta])
def listar_proveedores(db: Session = Depends(get_db)):
    return db.query(Proveedor).all()


@router.get("/{id_proveedor}", response_model=ProveedorRespuesta)
def obtener_proveedor(id_proveedor: uuid.UUID, db: Session = Depends(get_db)):
    proveedor = db.get(Proveedor, id_proveedor)
    if proveedor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    return proveedor


@router.post("/", response_model=ProveedorRespuesta, status_code=status.HTTP_201_CREATED)
def crear_proveedor(datos: ProveedorCrear, db: Session = Depends(get_db)):
    proveedor = Proveedor(**datos.model_dump())
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.put("/{id_proveedor}", response_model=ProveedorRespuesta)
def actualizar_proveedor(
    id_proveedor: uuid.UUID, datos: ProveedorActualizar, db: Session = Depends(get_db)
):
    proveedor = db.get(Proveedor, id_proveedor)
    if proveedor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(proveedor, campo, valor)

    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.delete("/{id_proveedor}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_proveedor(id_proveedor: uuid.UUID, db: Session = Depends(get_db)):
    proveedor = db.get(Proveedor, id_proveedor)
    if proveedor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    db.delete(proveedor)
    db.commit()
