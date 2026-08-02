<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$servicio = new ProductoService($api);
$categoriaService = new CategoriaService($api);
$descuentoService = new DescuentoService($api);
$error = null;
$exito = null;
$editando = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($_POST['accion'] ?? '', ['crear', 'actualizar'])) {
    $datos = [
        'id_categoria' => $_POST['id_categoria'],
        'id_descuento' => trim($_POST['id_descuento'] ?? '') ?: null,
        'nombre' => trim($_POST['nombre']),
        'descripcion' => trim($_POST['descripcion'] ?? ''),
        'stock' => (int) $_POST['stock'],
        'cantidad' => trim($_POST['cantidad'] ?? '') !== '' ? (float) $_POST['cantidad'] : null,
        'u_medida' => trim($_POST['u_medida'] ?? '') ?: null,
        'precio' => (float) $_POST['precio'],
        'estado' => isset($_POST['estado']),
    ];

    if ($_POST['accion'] === 'crear') {
        $resp = $servicio->crear($datos);
        $mensajeOk = 'Producto creado correctamente.';
    } else {
        $resp = $servicio->actualizar($_POST['id_producto'], $datos);
        $mensajeOk = 'Producto actualizado correctamente.';
    }

    if ($resp['ok']) { $exito = $mensajeOk; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo guardar el producto.'; }
}

if (isset($_GET['eliminar'])) {
    $resp = $servicio->eliminar($_GET['eliminar']);
    if ($resp['ok']) { $exito = 'Producto eliminado.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo eliminar el producto.'; }
}

if (isset($_GET['editar'])) {
    $resp = $servicio->obtener($_GET['editar']);
    if ($resp['ok']) { $editando = $resp['data']; }
}

$categorias = $categoriaService->listar();
$categorias = $categorias['ok'] ? $categorias['data'] : [];

$descuentos = $descuentoService->listar();
$descuentos = $descuentos['ok'] ? $descuentos['data'] : [];

$productos = $servicio->listar();
$productos = $productos['ok'] ? $productos['data'] : [];

$nombresCategoria = array_combine(
    extraer_campo($categorias, 'id_categoria'),
    extraer_campo($categorias, 'nombre')
);

$tituloPagina = 'Productos';
$paginaActual = 'productos.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
require __DIR__ . '/../src/views/partials/alerta.php';
?>

<div class="topbar"><h1>Productos</h1></div>

<div class="panel">
    <h2><?= $editando ? 'Editar producto' : 'Nuevo producto' ?></h2>
    <form method="post" action="productos.php">
        <input type="hidden" name="accion" value="<?= $editando ? 'actualizar' : 'crear' ?>">
        <?php if ($editando): ?>
            <input type="hidden" name="id_producto" value="<?= htmlspecialchars($editando['id_producto']) ?>">
        <?php endif; ?>
        <div class="form-grid">
            <div>
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" name="nombre" required value="<?= htmlspecialchars($editando['nombre'] ?? '') ?>">
            </div>
            <div>
                <label for="id_categoria">Categoría</label>
                <select id="id_categoria" name="id_categoria" required>
                    <option value="">Selecciona...</option>
                    <?php foreach ($categorias as $c): ?>
                        <option value="<?= htmlspecialchars($c['id_categoria']) ?>" <?= ($editando['id_categoria'] ?? '') === $c['id_categoria'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($c['nombre']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div>
                <label for="precio">Precio (L.)</label>
                <input type="number" step="0.01" min="0.01" id="precio" name="precio" required value="<?= htmlspecialchars($editando['precio'] ?? '') ?>">
            </div>
            <div>
                <label for="stock">Stock</label>
                <input type="number" min="0" id="stock" name="stock" required value="<?= htmlspecialchars($editando['stock'] ?? 0) ?>">
            </div>
            <div>
                <label for="u_medida">Unidad de medida</label>
                <input type="text" id="u_medida" name="u_medida" placeholder="ej. unidad, par, kg" value="<?= htmlspecialchars($editando['u_medida'] ?? '') ?>">
            </div>
            <div>
                <label for="cantidad">Cantidad (presentación)</label>
                <input type="number" step="0.01" min="0" id="cantidad" name="cantidad" placeholder="ej. 500" value="<?= htmlspecialchars($editando['cantidad'] ?? '') ?>">
            </div>
            <div>
                <label for="id_descuento">Descuento (opcional)</label>
                <select id="id_descuento" name="id_descuento">
                    <option value="">Sin descuento</option>
                    <?php foreach ($descuentos as $d): ?>
                        <option value="<?= htmlspecialchars($d['id_descuento']) ?>" <?= ($editando['id_descuento'] ?? '') === $d['id_descuento'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($d['nombre']) ?> (<?= $d['tipo'] === 'porcentaje' ? $d['valor'] . '%' : 'L.' . $d['valor'] ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div style="display:flex; align-items:end; gap:.4rem; padding-bottom:.5rem;">
                <input type="checkbox" id="estado" name="estado" style="width:auto;" <?= ($editando['estado'] ?? true) ? 'checked' : '' ?>>
                <label for="estado" style="margin:0;">Producto activo</label>
            </div>
        </div>
        <div style="margin-top:.8rem;">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" rows="2"><?= htmlspecialchars($editando['descripcion'] ?? '') ?></textarea>
        </div>
        <div style="margin-top:1rem;">
            <button type="submit" class="btn btn--primary"><?= $editando ? 'Guardar cambios' : 'Crear producto' ?></button>
            <?php if ($editando): ?>
                <a href="productos.php" class="btn btn--secondary">Cancelar</a>
            <?php endif; ?>
        </div>
    </form>
</div>

<div class="panel">
    <h2>Listado (<?= count($productos) ?>)</h2>
    <table>
        <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Descuento</th><th>Estado</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($productos as $p): ?>
            <tr>
                <td><?= htmlspecialchars($p['nombre']) ?></td>
                <td><?= htmlspecialchars($nombresCategoria[$p['id_categoria']] ?? '—') ?></td>
                <td><?= formatear_moneda($p['precio']) ?></td>
                <td><span class="badge <?= $p['stock'] <= 5 ? 'badge--alerta' : 'badge--ok' ?>"><?= $p['stock'] ?></span></td>
                <td><?= $p['descuento'] ? htmlspecialchars($p['descuento']['nombre']) : '—' ?></td>
                <td><span class="badge <?= $p['estado'] ? 'badge--ok' : 'badge--off' ?>"><?= $p['estado'] ? 'Activo' : 'Inactivo' ?></span></td>
                <td class="acciones">
                    <a class="btn btn--secondary btn--sm" href="productos.php?editar=<?= urlencode($p['id_producto']) ?>">Editar</a>
                    <a class="btn btn--danger btn--sm" href="productos.php?eliminar=<?= urlencode($p['id_producto']) ?>" onclick="return confirm('¿Eliminar este producto?');">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($productos)): ?>
            <tr><td colspan="7" class="texto-apagado">No hay productos registrados.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>