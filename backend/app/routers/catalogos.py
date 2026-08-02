import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.catalogos import Descuento, MetodoPago
from app.schemas.catalogos import (
    DescuentoActualizar,
    DescuentoCrear,
    DescuentoRespuesta,
    MetodoPagoRespuesta,
)

router = APIRouter(tags=["Métodos de pago y descuentos"])


@router.get("/metodos-pago/", response_model=list[MetodoPagoRespuesta])
def listar_metodos_pago(db: Session = Depends(get_db)):
    return db.query(MetodoPago).filter(MetodoPago.activo == True).all()  # noqa: E712


@router.get("/descuentos/", response_model=list[DescuentoRespuesta])
def listar_descuentos(db: Session = Depends(get_db)):
    return db.query(Descuento).filter(Descuento.activo == True).all()  # noqa: E712


@router.get("/descuentos/{id_descuento}", response_model=DescuentoRespuesta)
def obtener_descuento(id_descuento: uuid.UUID, db: Session = Depends(get_db)):
    descuento = db.get(Descuento, id_descuento)
    if descuento is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Descuento no encontrado")
    return descuento


@router.post("/descuentos/", response_model=DescuentoRespuesta, status_code=status.HTTP_201_CREATED)
def crear_descuento(datos: DescuentoCrear, db: Session = Depends(get_db)):
    descuento = Descuento(**datos.model_dump())
    db.add(descuento)
    db.commit()
    db.refresh(descuento)
    return descuento


@router.put("/descuentos/{id_descuento}", response_model=DescuentoRespuesta)
def actualizar_descuento(
    id_descuento: uuid.UUID, datos: DescuentoActualizar, db: Session = Depends(get_db)
):
    descuento = db.get(Descuento, id_descuento)
    if descuento is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Descuento no encontrado")

    cambios = datos.model_dump(exclude_unset=True)
    for campo, valor in cambios.items():
        setattr(descuento, campo, valor)

    tipo_final = descuento.tipo
    valor_final = descuento.valor
    if tipo_final == "porcentaje" and not (Decimal("0") < valor_final <= Decimal("100")):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Para tipo 'porcentaje', el valor debe estar entre 0 y 100",
        )
    if descuento.fecha_fin < descuento.fecha_inicio:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="fecha_fin no puede ser anterior a fecha_inicio",
        )

    db.commit()
    db.refresh(descuento)
    return descuento


@router.delete("/descuentos/{id_descuento}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_descuento(id_descuento: uuid.UUID, db: Session = Depends(get_db)):
    descuento = db.get(Descuento, id_descuento)
    if descuento is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Descuento no encontrado")
    db.delete(descuento)
    db.commit()

