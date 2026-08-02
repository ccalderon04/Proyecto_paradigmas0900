import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.direccion import Direccion
from app.schemas.direccion import DireccionActualizar, DireccionCrear, DireccionRespuesta

router = APIRouter(prefix="/direcciones", tags=["Direcciones"])


@router.get("/cliente/{id_cliente}", response_model=list[DireccionRespuesta])
def listar_direcciones_de_cliente(id_cliente: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Direccion).filter(Direccion.id_cliente == id_cliente).all()


@router.post("/", response_model=DireccionRespuesta, status_code=status.HTTP_201_CREATED)
def crear_direccion(datos: DireccionCrear, db: Session = Depends(get_db)):
    direccion = Direccion(**datos.model_dump())
    db.add(direccion)
    db.commit()
    db.refresh(direccion)
    return direccion


@router.put("/{id_direccion}", response_model=DireccionRespuesta)
def actualizar_direccion(
    id_direccion: uuid.UUID, datos: DireccionActualizar, db: Session = Depends(get_db)
):
    direccion = db.get(Direccion, id_direccion)
    if direccion is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(direccion, campo, valor)

    db.commit()
    db.refresh(direccion)
    return direccion


@router.delete("/{id_direccion}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_direccion(id_direccion: uuid.UUID, db: Session = Depends(get_db)):
    direccion = db.get(Direccion, id_direccion)
    if direccion is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
    db.delete(direccion)
    db.commit()