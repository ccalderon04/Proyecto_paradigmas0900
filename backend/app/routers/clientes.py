"""
Router de `/clientes`.

El registro público (POST /clientes/registro) lo dispara la tienda
virtual y crea Usuario + Cliente en una sola transacción — si algo
falla a mitad de camino (ej. correo duplicado), no debe quedar un
Usuario huérfano sin su Cliente asociado.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hashear_contrasena
from app.models.cliente import Cliente
from app.models.usuario import Usuario
from app.schemas.cliente import ClienteActualizar, ClienteRegistro, ClienteRespuesta

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.post("/registro", response_model=ClienteRespuesta, status_code=status.HTTP_201_CREATED)
def registrar_cliente(datos: ClienteRegistro, db: Session = Depends(get_db)):
    """Registro público de un cliente nuevo — usado por la tienda virtual."""
    usuario = Usuario(
        nombre=datos.nombre_usuario,
        contrasena=hashear_contrasena(datos.contrasena),
        rol="cliente",
    )
    db.add(usuario)
    db.flush()  # asigna id_usuario sin cerrar la transacción todavía

    cliente = Cliente(
        id_usuario=usuario.id_usuario,
        p_nombre=datos.p_nombre,
        s_nombre=datos.s_nombre,
        p_apellido=datos.p_apellido,
        s_apellido=datos.s_apellido,
        fecha_nacimiento=datos.fecha_nacimiento,
        correo=datos.correo,
        telefono=datos.telefono,
        genero=datos.genero,
    )
    db.add(cliente)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario o correo ya están registrados",
        )

    db.refresh(cliente)
    return cliente


@router.get("/", response_model=list[ClienteRespuesta])
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(Cliente).all()


@router.get("/{id_cliente}", response_model=ClienteRespuesta)
def obtener_cliente(id_cliente: uuid.UUID, db: Session = Depends(get_db)):
    cliente = db.get(Cliente, id_cliente)
    if cliente is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
    return cliente


@router.put("/{id_cliente}", response_model=ClienteRespuesta)
def actualizar_cliente(id_cliente: uuid.UUID, datos: ClienteActualizar, db: Session = Depends(get_db)):
    cliente = db.get(Cliente, id_cliente)
    if cliente is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(cliente, campo, valor)

    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{id_cliente}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cliente(id_cliente: uuid.UUID, db: Session = Depends(get_db)):
    cliente = db.get(Cliente, id_cliente)
    if cliente is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
    db.delete(cliente)
    db.commit()