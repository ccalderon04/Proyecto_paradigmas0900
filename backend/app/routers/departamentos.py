from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.ubicacion import Departamento
from app.schemas.ubicacion import DepartamentoRespuesta

router = APIRouter()

@router.get("/", response_model=list[DepartamentoRespuesta])
def listar_departamentos(db: Session = Depends(get_db)):
    return db.query(Departamento).all()