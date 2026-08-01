"""
Conexión a la base de datos (Supabase / Postgres) vía SQLAlchemy.

Este módulo expone:
- `engine`: el motor de conexión a la base de datos.
- `SessionLocal`: fábrica de sesiones para hablar con la DB.
- `Base`: clase base de la que heredan todos los modelos.
- `get_db`: dependencia de FastAPI que entrega una sesión por petición
  y la cierra automáticamente al terminar (evita conexiones colgadas).
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Clase base declarativa: todos los modelos (app/models/*.py) heredan de aquí."""

    pass


def get_db() -> Generator[Session, None, None]:
    """
    Dependencia de FastAPI: entrega una sesión de base de datos por
    petición y garantiza que se cierre al final, incluso si hay un error.

    Uso en un router:
        @router.get("/productos")
        def listar(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()