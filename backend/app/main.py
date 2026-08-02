from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.routers import (
    carrito,
    catalogos,
    categorias,
    clientes,
    compras,
    direcciones,
    facturas,
    productos,
    proveedores,
    usuarios,
    departamentos,
    ciudades,
    tarjetas
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(" Conexión a Supabase verificada correctamente.")
    except Exception as exc:
        print(f" No se pudo conectar a la base de datos: {exc}")
        print("   Revisa DATABASE_URL en tu archivo .env")
    yield


app = FastAPI(
    title="Tienda Deportiva API",
    description="Backend REST del proyecto final de Paradigmas de Programación",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def raiz():
    return {"mensaje": "API de Tienda Deportiva activa", "docs": "/docs"}


app.include_router(usuarios.router)
app.include_router(clientes.router)
app.include_router(direcciones.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(carrito.router)
app.include_router(facturas.router)
app.include_router(proveedores.router)
app.include_router(compras.router)
app.include_router(catalogos.router)
app.include_router(departamentos.router, prefix="/departamentos", tags=["Departamentos"])
app.include_router(ciudades.router, prefix="/ciudades", tags=["Ciudades"])
app.include_router(tarjetas.router, prefix="/tarjetas", tags=["Tarjetas"])