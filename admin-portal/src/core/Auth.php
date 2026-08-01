<?php
/**
 * Encapsula el manejo de sesión del administrador.
 *
 * La validación REAL de usuario/contraseña la hace el backend
 * (POST /auth/login); esta clase solo recuerda localmente, con
 * sesiones nativas de PHP, que ya inició sesión — tal como pide
 * el proyecto: "login simple sin tokens ni sesiones complejas".
 */
class Auth
{
    private const CLAVE_SESION = 'admin_autenticado';

    public static function iniciar(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function iniciarSesion(array $usuario): void
    {
        self::iniciar();
        $_SESSION[self::CLAVE_SESION] = [
            'id_usuario' => $usuario['id_usuario'],
            'nombre' => $usuario['nombre'],
            'rol' => $usuario['rol'],
        ];
    }

    public static function estaAutenticado(): bool
    {
        self::iniciar();
        return isset($_SESSION[self::CLAVE_SESION]) && $_SESSION[self::CLAVE_SESION]['rol'] === 'admin';
    }

    public static function usuarioActual(): ?array
    {
        self::iniciar();
        return $_SESSION[self::CLAVE_SESION] ?? null;
    }

    public static function cerrarSesion(): void
    {
        self::iniciar();
        unset($_SESSION[self::CLAVE_SESION]);
        session_destroy();
    }

    /** Llamar al inicio de cada página protegida del portal. */
    public static function requerirSesion(): void
    {
        if (!self::estaAutenticado()) {
            header('Location: login.php');
            exit;
        }
    }
}
