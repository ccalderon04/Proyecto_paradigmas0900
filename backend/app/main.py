from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Crear la aplicación
app = FastAPI()

# 2. Agregar el middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Ruta básica de prueba
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend listo"}