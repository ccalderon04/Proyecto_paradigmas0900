"""
Router de `/categorias` — CRUD completo.

La tienda virtual necesita GET /categorias para el filtro "Explora
Categorías" (según la guía del proyecto); el admin necesita el resto
del CRUD para gestionarlas.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaActualizar, CategoriaCrear, CategoriaRespuesta

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("/", response_model=list[CategoriaRespuesta])
def listar_categorias(db: Session = Depends(get_db)):
    """Lista todas las categorías — usado por el filtro de la tienda virtual."""
    return db.query(Categoria).all()


@router.get("/{id_categoria}", response_model=CategoriaRespuesta)
def obtener_categoria(id_categoria: uuid.UUID, db: Session = Depends(get_db)):
    categoria = db.get(Categoria, id_categoria)
    if categoria is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return categoria


@router.post("/", response_model=CategoriaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_categoria(datos: CategoriaCrear, db: Session = Depends(get_db)):
    categoria = Categoria(**datos.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put("/{id_categoria}", response_model=CategoriaRespuesta)
def actualizar_categoria(
    id_categoria: uuid.UUID, datos: CategoriaActualizar, db: Session = Depends(get_db)
):
    categoria = db.get(Categoria, id_categoria)
    if categoria is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(categoria, campo, valor)

    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{id_categoria}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(id_categoria: uuid.UUID, db: Session = Depends(get_db)):
    categoria = db.get(Categoria, id_categoria)
    if categoria is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    db.delete(categoria)
    db.commit()
