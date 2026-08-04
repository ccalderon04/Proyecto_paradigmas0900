# Terminal 1 — Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
# → http://localhost:8000/docs

# Terminal 2 — Portal Admin
cd admin-portal/public
php -S localhost:8080
# → http://localhost:8080/login.php

# Terminal 3 — Tienda Virtual
cd tienda-virtual
npm run dev
# → http://localhost:3000