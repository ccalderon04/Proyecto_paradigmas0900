"""
Importa todos los modelos en un solo lugar.

SQLAlchemy necesita que todas las clases mapeadas estén registradas
antes de resolver relaciones declaradas como strings (ej. Mapped["Cliente"]
dentro de usuario.py). Importarlas aquí garantiza que eso pase sin
importar en qué orden se usen los módulos en el resto de la app.
"""

from app.models.usuario import Usuario
from app.models.ubicacion import Departamento, Ciudad
from app.models.categoria import Categoria
from app.models.catalogos import MetodoPago, Descuento
from app.models.cliente import Cliente
from app.models.direccion import Direccion
from app.models.producto import Producto, StockInsuficienteError
from app.models.carrito import Carrito, DetalleCarrito
from app.models.factura import Factura, DetalleFactura
from app.models.compra import Proveedor, Compra, DetalleCompra

__all__ = [
    "Usuario",
    "Departamento",
    "Ciudad",
    "Categoria",
    "MetodoPago",
    "Descuento",
    "Cliente",
    "Direccion",
    "Producto",
    "StockInsuficienteError",
    "Carrito",
    "DetalleCarrito",
    "Factura",
    "DetalleFactura",
    "Proveedor",
    "Compra",
    "DetalleCompra",
]
