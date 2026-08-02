<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$servicio = new CategoriaService($api);
$error = null;
$exito = null;
$editando = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'crear') {
    $resp = $servicio->crear(['nombre' => trim($_POST['nombre'])]);
    if ($resp['ok']) { $exito = 'Categoría creada correctamente.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo crear la categoría.'; }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'actualizar') {
    $resp = $servicio->actualizar($_POST['id_categoria'], ['nombre' => trim($_POST['nombre'])]);
    if ($resp['ok']) { $exito = 'Categoría actualizada correctamente.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo actualizar la categoría.'; }
}

if (isset($_GET['eliminar'])) {
    $resp = $servicio->eliminar($_GET['eliminar']);
    if ($resp['ok']) { $exito = 'Categoría eliminada.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo eliminar (puede tener productos asociados).'; }
}

if (isset($_GET['editar'])) {
    $resp = $servicio->obtener($_GET['editar']);
    if ($resp['ok']) { $editando = $resp['data']; }
}

$categorias = $servicio->listar();
$categorias = $categorias['ok'] ? $categorias['data'] : [];

$tituloPagina = 'Categorías';
$paginaActual = 'categorias.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
require __DIR__ . '/../src/views/partials/alerta.php';
?>

<div class="topbar"><h1>Categorías</h1></div>

<div class="panel">
    <h2><?= $editando ? 'Editar categoría' : 'Nueva categoría' ?></h2>
    <form method="post" action="categorias.php">
        <input type="hidden" name="accion" value="<?= $editando ? 'actualizar' : 'crear' ?>">
        <?php if ($editando): ?>
            <input type="hidden" name="id_categoria" value="<?= htmlspecialchars($editando['id_categoria']) ?>">
        <?php endif; ?>
        <div class="form-grid">
            <div>
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" name="nombre" required value="<?= htmlspecialchars($editando['nombre'] ?? '') ?>">
            </div>
        </div>
        <div style="margin-top:1rem;">
            <button type="submit" class="btn btn--primary"><?= $editando ? 'Guardar cambios' : 'Crear categoría' ?></button>
            <?php if ($editando): ?>
                <a href="categorias.php" class="btn btn--secondary">Cancelar</a>
            <?php endif; ?>
        </div>
    </form>
</div>

<div class="panel">
    <h2>Listado</h2>
    <table>
        <thead><tr><th>Nombre</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($categorias as $c): ?>
            <tr>
                <td><?= htmlspecialchars($c['nombre']) ?></td>
                <td class="acciones">
                    <a class="btn btn--secondary btn--sm" href="categorias.php?editar=<?= urlencode($c['id_categoria']) ?>">Editar</a>
                    <a class="btn btn--danger btn--sm" href="categorias.php?eliminar=<?= urlencode($c['id_categoria']) ?>" onclick="return confirm('¿Eliminar esta categoría?');">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($categorias)): ?>
            <tr><td colspan="2" class="texto-apagado">No hay categorías registradas.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
