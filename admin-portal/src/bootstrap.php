<?php
/**
 * Se incluye al inicio de cada página en public/. Carga configuración,
 * las clases core y los servicios, e inicia la sesión.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/core/ApiClient.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/helpers.php';
require_once __DIR__ . '/services/BaseService.php';
require_once __DIR__ . '/services/AuthService.php';
require_once __DIR__ . '/services/UsuarioService.php';
require_once __DIR__ . '/services/CategoriaService.php';
require_once __DIR__ . '/services/ProductoService.php';
require_once __DIR__ . '/services/ProveedorService.php';
require_once __DIR__ . '/services/CompraService.php';
require_once __DIR__ . '/services/FacturaService.php';
require_once __DIR__ . '/services/MetodoPagoService.php';
require_once __DIR__ . '/services/DescuentoService.php';
require_once __DIR__ . '/services/ClienteService.php';

Auth::iniciar();

// Una sola instancia de ApiClient para todo el request (se la inyectamos a cada servicio)
$api = new ApiClient(API_BASE_URL);