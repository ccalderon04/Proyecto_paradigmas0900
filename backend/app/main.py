"""
Punto de entrada del backend REST.

Ejecutar en desarrollo con:
    uvicorn app.main:app --reload

La documentación interactiva queda disponible automáticamente en:
    http://localhost:8000/docs   (Swagger UI)
    http://localhost:8000/redoc  (Redoc)

Comparte esa URL con el equipo de PHP y JavaScript en cuanto tengas
los primeros endpoints funcionando (punto 6 de la guía del proyecto).
"""

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
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Se ejecuta una vez al arrancar la aplicación. Verifica que la conexión
    a Supabase funcione ANTES de aceptar peticiones — así un error de
    configuración (.env mal escrito, credenciales incorrectas) aparece
    de inmediato en la consola en vez de fallar silenciosamente en el
    primer endpoint que alguien pruebe.
    """
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

# --- CORS ---
# Sin esto, ni el portal PHP ni la tienda en Next.js podrán llamar a la API
# aunque los endpoints funcionen perfecto (punto 3 de la guía del proyecto).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def raiz():
    """Endpoint de salud simple para confirmar que el servidor está vivo."""
    return {"mensaje": "API de Tienda Deportiva activa", "docs": "/docs"}


# Registro de todos los grupos de endpoints.
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

from app.routers import departamentos, ciudades

app.include_router(departamentos.router, prefix="/departamentos", tags=["Departamentos"])
app.include_router(ciudades.router, prefix="/ciudades", tags=["Ciudades"])