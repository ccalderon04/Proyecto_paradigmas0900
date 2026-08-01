"""
Utilidades de seguridad: hasheo y verificación de contraseñas.

Se usa bcrypt directamente (sin passlib) para evitar un problema de
compatibilidad conocido entre passlib 1.7.4 y versiones recientes de
la librería bcrypt (passlib intenta leer un atributo que ya no existe).

El proyecto pide "login simple, sin JWT ni sesiones complejas" — eso
se respeta aquí: no hay tokens ni sesiones. Pero "simple" no debería
significar contraseñas en texto plano en la base de datos, así que
igual se hashea.
"""

import bcrypt


def hashear_contrasena(contrasena_plana: str) -> str:
    """Genera un hash bcrypt de la contraseña, listo para guardar en la DB."""
    hash_bytes = bcrypt.hashpw(contrasena_plana.encode("utf-8"), bcrypt.gensalt())
    return hash_bytes.decode("utf-8")


def verificar_contrasena(contrasena_plana: str, hash_guardado: str) -> bool:
    """Verifica una contraseña en texto plano contra su hash guardado."""
    return bcrypt.checkpw(contrasena_plana.encode("utf-8"), hash_guardado.encode("utf-8"))