<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$productoService = new ProductoService($api);
$categoriaService = new CategoriaService($api);
$proveedorService = new ProveedorService($api);
$facturaService = new FacturaService($api);

$respProductos = $productoService->listar();
$respCategorias = $categoriaService->listar();
$respProveedores = $proveedorService->listar();
$respFacturas = $facturaService->listar();

$productos = $respProductos['ok'] ? $respProductos['data'] : [];
$categorias = $respCategorias['ok'] ? $respCategorias['data'] : [];
$proveedores = $respProveedores['ok'] ? $respProveedores['data'] : [];
$facturas = $respFacturas['ok'] ? $respFacturas['data'] : [];

// --- KPIs calculados con funciones puras (helpers.php: array_map/filter/reduce) ---
$valorInventario = calcular_valor_inventario($productos);
$productosStockBajo = filtrar_stock_bajo($productos, 5);
$totalVentas = calcular_total_ventas($facturas);

$tituloPagina = 'Panel de Control';
$paginaActual = 'index.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
?>

<div class="topbar">
    <h1>Dashboard</h1>
</div>

<?php if (!$respProductos['ok']): ?>
    <div class="alerta alerta--error">No se pudo conectar con el backend. Verifica que esté corriendo en <?= htmlspecialchars(API_BASE_URL) ?>.</div>
<?php endif; ?>

<div class="grid-kpi">
    <div class="card">
        <div class="card__label">Productos activos</div>
        <div class="card__valor"><?= count($productos) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Valor total de inventario</div>
        <div class="card__valor tertiary"><?= formatear_moneda($valorInventario) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Productos con stock bajo (≤5)</div>
        <div class="card__valor primary"><?= count($productosStockBajo) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Total facturado</div>
        <div class="card__valor tertiary"><?= formatear_moneda($totalVentas) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Categorías</div>
        <div class="card__valor"><?= count($categorias) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Proveedores</div>
        <div class="card__valor"><?= count($proveedores) ?></div>
    </div>
</div>

<div class="panel">
    <h2>Alertas de inventario</h2>
    <?php if (empty($productosStockBajo)): ?>
        <p class="texto-apagado">No hay productos con stock bajo.</p>
    <?php else: ?>
        <table>
            <thead><tr><th>Producto</th><th>Stock</th><th>Precio</th></tr></thead>
            <tbody>
            <?php foreach ($productosStockBajo as $p): ?>
                <tr>
                    <td><?= htmlspecialchars($p['nombre']) ?></td>
                    <td><span class="badge badge--alerta"><?= $p['stock'] ?></span></td>
                    <td><?= formatear_moneda($p['precio']) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
