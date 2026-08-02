<?php

function cargar_env(string $rutaEnv): void
{
    if (!file_exists($rutaEnv)) {
        return;
    }
    foreach (file($rutaEnv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linea) {
        $linea = trim($linea);
        if ($linea === '' || str_starts_with($linea, '#')) {
            continue;
        }
        [$clave, $valor] = array_map('trim', explode('=', $linea, 2));
        if (!array_key_exists($clave, $_ENV)) {
            $_ENV[$clave] = $valor;
            putenv("$clave=$valor");
        }
    }
}

cargar_env(__DIR__ . '/../.env');

define('API_BASE_URL', $_ENV['API_BASE_URL'] ?? 'http://localhost:8000');
define('TASA_IMPUESTO', (float) ($_ENV['TASA_IMPUESTO'] ?? 0.15));
