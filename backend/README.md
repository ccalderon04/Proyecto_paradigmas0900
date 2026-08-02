# ARRANCAR SERVIDOR BACKEND PYTHON
# Version Pytrhon 3.13.14
## INSTRUCCIONES:
**ve a la carperta del backend**
>cd backend

**Crea el entorno virtual**
>python -m venv venv

**activa el entorno**
>venv\Scripts\activate

**Instala las dependencias**
>pip install -r requirements.txt

**Crear el .env con el link a la base de datos**
>-Se crea en la raiz del backend (backend/)
DATABASE_URL=postgresql+psycopg2://postgres:[TU-PASSWORD]@[HOST-DE-SUPABASE]:5432/postgres
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080","http://127.0.0.1:3000","http://127.0.0.1:8080"]

**Arranca el servidor**
>uvicorn app.main:app --reload
