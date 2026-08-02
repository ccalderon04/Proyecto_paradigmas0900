import bcrypt


def hashear_contrasena(contrasena_plana: str) -> str:
    hash_bytes = bcrypt.hashpw(contrasena_plana.encode("utf-8"), bcrypt.gensalt())
    return hash_bytes.decode("utf-8")


def verificar_contrasena(contrasena_plana: str, hash_guardado: str) -> bool:
    return bcrypt.checkpw(contrasena_plana.encode("utf-8"), hash_guardado.encode("utf-8"))