from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.ubicacion import Ciudad
from app.schemas.ubicacion import CiudadRespuesta, CiudadCrear

router = APIRouter()

@router.get("/", response_model=list[CiudadRespuesta])
def listar_ciudades(db: Session = Depends(get_db)):
    return db.query(Ciudad).all()

@router.post("/", response_model=CiudadRespuesta, status_code=201)
def crear_ciudad(data: CiudadCrear, db: Session = Depends(get_db)):
    nueva = Ciudad(nombre=data.nombre)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva