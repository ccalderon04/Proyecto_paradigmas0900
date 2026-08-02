from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tarjeta import TarjetaCliente
from app.schemas.tarjeta import TarjetaCrear, TarjetaRespuesta

router = APIRouter()

@router.get("/cliente/{id_cliente}", response_model=list[TarjetaRespuesta])
def listar_tarjetas(id_cliente: str, db: Session = Depends(get_db)):
    return db.query(TarjetaCliente).filter(
        TarjetaCliente.id_cliente == id_cliente,
        TarjetaCliente.estado == True
    ).all()

@router.post("/", response_model=TarjetaRespuesta, status_code=201)
def crear_tarjeta(data: TarjetaCrear, db: Session = Depends(get_db)):
    nueva = TarjetaCliente(**data.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.delete("/{id_tarjeta}")
def eliminar_tarjeta(id_tarjeta: str, db: Session = Depends(get_db)):
    tarjeta = db.query(TarjetaCliente).filter(TarjetaCliente.id_tarjeta == id_tarjeta).first()
    tarjeta.estado = False
    db.commit()
    return {"detail": "Tarjeta eliminada"}