"""
Router de `/usuarios` — CRUD completo + login simple.

Login: recibe nombre/contraseña, valida contra la tabla `usuario`,
devuelve los datos básicos del usuario — sin JWT ni sesiones complejas,
tal como pide el proyecto.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hashear_contrasena, verificar_contrasena
from app.models.usuario import Usuario
from app.schemas.usuario import (
    LoginPeticion,
    LoginRespuesta,
    UsuarioActualizar,
    UsuarioCrear,
    UsuarioRespuesta,
)

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("/login", response_model=LoginRespuesta)
def login(datos: LoginPeticion, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.nombre == datos.nombre).first()

    # Mismo mensaje de error tanto si el usuario no existe como si la
    # contraseña es incorrecta — evita que alguien pueda usar el
    # mensaje de error para descubrir qué usuarios existen.
    credenciales_invalidas = HTTPException(
        status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos"
    )

    if usuario is None:
        raise credenciales_invalidas
    if not verificar_contrasena(datos.contrasena, usuario.contrasena):
        raise credenciales_invalidas
    if not usuario.esta_activo():
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")

    return usuario


@router.get("/", response_model=list[UsuarioRespuesta])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()


@router.get("/{id_usuario}", response_model=UsuarioRespuesta)
def obtener_usuario(id_usuario: uuid.UUID, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, id_usuario)
    if usuario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return usuario


@router.post("/", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def crear_usuario(datos: UsuarioCrear, db: Session = Depends(get_db)):
    ya_existe = db.query(Usuario).filter(Usuario.nombre == datos.nombre).first()
    if ya_existe:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Ese nombre de usuario ya existe")

    usuario = Usuario(
        nombre=datos.nombre,
        contrasena=hashear_contrasena(datos.contrasena),
        rol=datos.rol,
        estado=datos.estado,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/{id_usuario}", response_model=UsuarioRespuesta)
def actualizar_usuario(id_usuario: uuid.UUID, datos: UsuarioActualizar, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, id_usuario)
    if usuario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    cambios = datos.model_dump(exclude_unset=True)
    if "contrasena" in cambios:
        cambios["contrasena"] = hashear_contrasena(cambios["contrasena"])

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{id_usuario}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(id_usuario: uuid.UUID, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, id_usuario)
    if usuario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()