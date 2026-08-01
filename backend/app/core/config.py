"""
Configuración central del backend.

Usa pydantic-settings para leer variables de entorno desde el archivo .env
de forma tipada y validada. Esto evita errores comunes como usar una URL
de base de datos mal escrita o un puerto CORS incorrecto sin que nadie
se de cuenta hasta que algo falla en producción.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Cadena de conexión a Supabase (Postgres). La comparte quien administra
    # el proyecto de Supabase. Formato típico:
    # postgresql://usuario:password@host:5432/postgres
    database_url: str

    # Orígenes permitidos para CORS. Next.js corre en :3000, el portal PHP
    # probablemente en :8080 (ajusta según lo que confirme tu compañero).
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Instancia única reutilizada en toda la app (patrón singleton simple).
settings = Settings()