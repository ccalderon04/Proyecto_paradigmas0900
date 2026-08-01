# Portal Administrativo (PHP)

Consume exclusivamente la API REST del backend (FastAPI). Nunca toca la
base de datos directamente, como pide la guía del proyecto.

## Requisitos

- PHP 8.0+ con la extensión `curl` habilitada (viene activada por defecto
  en XAMPP/WAMP/Laragon; si usas PHP "a pelo", instala `php-curl`).
- El backend (FastAPI) debe estar corriendo.

## 1. Configura la URL del backend

Copia `.env.example` como `.env` y ajusta si es necesario:
```
API_BASE_URL=http://localhost:8000
```

## 2. Levanta el servidor

Con el servidor embebido de PHP (rápido, para desarrollo):
```
cd admin-portal/public
php -S localhost:8080
```

Abre **http://localhost:8080/login.php**

(Si usas XAMPP/WAMP en vez del servidor embebido, apunta el vhost/carpeta
`htdocs` a `admin-portal/public/`.)

## 3. Primer usuario administrador

El portal solo deja entrar a usuarios con `rol = "admin"`. Crea uno directo
en la API antes de tu primer login — desde Swagger (`/docs` del backend) o
con curl:
```
POST /usuarios/
{
  "nombre": "admin1",
  "contrasena": "123456",
  "rol": "admin",
  "estado": true
}
```
Luego entra al portal con usuario `admin1` y esa contraseña.

## Estructura

```
public/                    → punto de entrada (todo lo que ve el navegador)
├── login.php / logout.php
├── index.php                (dashboard con KPIs)
├── usuarios.php / categorias.php / productos.php / proveedores.php  (CRUD)
├── compras.php               (registrar compra → aumenta inventario)
├── inventario.php             (solo lectura)
├── facturas.php / factura_detalle.php  (consulta de ventas)
└── assets/css/styles.css

src/
├── config.php               → carga .env y define API_BASE_URL
├── core/
│   ├── ApiClient.php          → POO: cliente HTTP centralizado (cURL)
│   ├── Auth.php                 → POO: encapsula la sesión del admin
│   └── helpers.php               → Funcional: funciones puras (array_map/filter/reduce)
├── services/
│   ├── BaseService.php         → POO: clase abstracta con CRUD genérico (herencia)
│   └── *Service.php              → un servicio por recurso, hereda de BaseService
└── views/partials/              → header, sidebar y footer reutilizables
```

## Paradigmas aplicados

- **POO:**
  - `ApiClient`: encapsulamiento (`$baseUrl` privado, todo pasa por métodos públicos).
  - `BaseService` (abstracta) → `CategoriaService`, `ProductoService`, etc.
    heredan el CRUD común y cada una agrega solo lo que le hace falta
    (`ProductoService::porCategoria()`, `FacturaService::porCliente()`).
  - `Auth`: encapsula toda la lógica de sesión detrás de métodos estáticos,
    nada fuera de la clase toca `$_SESSION` directamente.
- **Funcional:** `src/core/helpers.php` tiene funciones puras con
  `array_map`, `array_filter`, `array_reduce` y funciones flecha (`fn`):
  cálculo del valor total del inventario, total de ventas, filtro de
  productos con stock bajo, etc. Se usan en el dashboard (`index.php`) y
  en `inventario.php`.

## Notas importantes

- El login es simple (sin JWT): el portal solo guarda en `$_SESSION` que
  el admin ya inició sesión; la validación real de usuario/contraseña la
  hace el backend en `POST /auth/login`.
- Solo entran al portal usuarios con `rol = "admin"` — si un cliente
  intenta entrar aquí, se le rechaza (ese tipo de usuario usa la tienda
  virtual en JavaScript, no este portal).
