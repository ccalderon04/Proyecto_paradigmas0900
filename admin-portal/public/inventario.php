<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$productoService = new ProductoService($api);
$categoriaService = new CategoriaService($api);

$productos = $productoService->listar();
$productos = $productos['ok'] ? $productos['data'] : [];

$categorias = $categoriaService->listar();
$categorias = $categorias['ok'] ? $categorias['data'] : [];
$nombresCategoria = array_combine(extraer_campo($categorias, 'id_categoria'), extraer_campo($categorias, 'nombre'));

// Filtro simple por categoría desde la URL (?categoria=...)
$filtroCategoria = $_GET['categoria'] ?? '';
if ($filtroCategoria !== '') {
    $productos = array_values(array_filter($productos, fn($p) => $p['id_categoria'] === $filtroCategoria));
}

$valorInventario = calcular_valor_inventario($productos);
$stockBajo = filtrar_stock_bajo($productos, 5);

$tituloPagina = 'Inventario';
$paginaActual = 'inventario.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
?>

<div class="topbar"><h1>Inventario (solo lectura)</h1></div>

<div class="grid-kpi">
    <div class="card">
        <div class="card__label">Productos listados</div>
        <div class="card__valor"><?= count($productos) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Valor total en inventario</div>
        <div class="card__valor tertiary"><?= formatear_moneda($valorInventario) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Con stock bajo (≤5)</div>
        <div class="card__valor primary"><?= count($stockBajo) ?></div>
    </div>
</div>

<div class="panel">
    <form method="get" action="inventario.php" class="filtros">
        <div>
            <label for="categoria">Filtrar por categoría</label>
            <select id="categoria" name="categoria" onchange="this.form.submit()">
                <option value="">Todas</option>
                <?php foreach ($categorias as $c): ?>
                    <option value="<?= htmlspecialchars($c['id_categoria']) ?>" <?= $filtroCategoria === $c['id_categoria'] ? 'selected' : '' ?>>
                        <?= htmlspecialchars($c['nombre']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
    </form>

    <table>
        <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Valor en inventario</th></tr></thead>
        <tbody>
        <?php foreach ($productos as $p): ?>
            <tr>
                <td><?= htmlspecialchars($p['nombre']) ?></td>
                <td><?= htmlspecialchars($nombresCategoria[$p['id_categoria']] ?? '—') ?></td>
                <td><span class="badge <?= $p['stock'] <= 5 ? 'badge--alerta' : 'badge--ok' ?>"><?= $p['stock'] ?></span></td>
                <td><?= formatear_moneda($p['precio']) ?></td>
                <td><?= formatear_moneda($p['precio'] * $p['stock']) ?></td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($productos)): ?>
            <tr><td colspan="5" class="texto-apagado">No hay productos que mostrar.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
