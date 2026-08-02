<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$servicio = new DescuentoService($api);
$error = null;
$exito = null;
$editando = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($_POST['accion'] ?? '', ['crear', 'actualizar'])) {
    $datos = [
        'nombre' => trim($_POST['nombre']),
        'valor' => (float) $_POST['valor'],
        'tipo' => $_POST['tipo'],
        'fecha_inicio' => $_POST['fecha_inicio'],
        'fecha_fin' => $_POST['fecha_fin'],
        'activo' => isset($_POST['activo']),
    ];

    if ($_POST['accion'] === 'crear') {
        $resp = $servicio->crear($datos);
        $mensajeOk = 'Descuento creado correctamente.';
    } else {
        $resp = $servicio->actualizar($_POST['id_descuento'], $datos);
        $mensajeOk = 'Descuento actualizado correctamente.';
    }

    if ($resp['ok']) { $exito = $mensajeOk; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo guardar el descuento.'; }
}

if (isset($_GET['eliminar'])) {
    $resp = $servicio->eliminar($_GET['eliminar']);
    if ($resp['ok']) { $exito = 'Descuento eliminado.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo eliminar el descuento.'; }
}

if (isset($_GET['editar'])) {
    $resp = $servicio->obtener($_GET['editar']);
    if ($resp['ok']) { $editando = $resp['data']; }
}

$descuentos = $servicio->listar();
$descuentos = $descuentos['ok'] ? $descuentos['data'] : [];

$tituloPagina = 'Descuentos';
$paginaActual = 'descuentos.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
require __DIR__ . '/../src/views/partials/alerta.php';
?>

<div class="topbar"><h1>Descuentos</h1></div>

<div class="panel">
    <h2><?= $editando ? 'Editar descuento' : 'Nuevo descuento' ?></h2>
    <form method="post" action="descuentos.php">
        <input type="hidden" name="accion" value="<?= $editando ? 'actualizar' : 'crear' ?>">
        <?php if ($editando): ?>
            <input type="hidden" name="id_descuento" value="<?= htmlspecialchars($editando['id_descuento']) ?>">
        <?php endif; ?>
        <div class="form-grid">
            <div>
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" name="nombre" required value="<?= htmlspecialchars($editando['nombre'] ?? '') ?>">
            </div>
            <div>
                <label for="tipo">Tipo</label>
                <select id="tipo" name="tipo" required>
                    <option value="porcentaje" <?= ($editando['tipo'] ?? '') === 'porcentaje' ? 'selected' : '' ?>>Porcentaje (%)</option>
                    <option value="monto_fijo" <?= ($editando['tipo'] ?? '') === 'monto_fijo' ? 'selected' : '' ?>>Monto fijo (L.)</option>
                </select>
            </div>
            <div>
                <label for="valor">Valor</label>
                <input type="number" step="0.01" min="0.01" id="valor" name="valor" required value="<?= htmlspecialchars($editando['valor'] ?? '') ?>">
                <small class="texto-apagado">Si el tipo es "Porcentaje", debe ser un valor entre 0 y 100.</small>
            </div>
            <div>
                <label for="fecha_inicio">Fecha inicio</label>
                <input type="date" id="fecha_inicio" name="fecha_inicio" required value="<?= htmlspecialchars($editando['fecha_inicio'] ?? '') ?>">
            </div>
            <div>
                <label for="fecha_fin">Fecha fin</label>
                <input type="date" id="fecha_fin" name="fecha_fin" required value="<?= htmlspecialchars($editando['fecha_fin'] ?? '') ?>">
            </div>
            <div style="display:flex; align-items:end; gap:.4rem; padding-bottom:.5rem;">
                <input type="checkbox" id="activo" name="activo" style="width:auto;" <?= ($editando['activo'] ?? true) ? 'checked' : '' ?>>
                <label for="activo" style="margin:0;">Descuento activo</label>
            </div>
        </div>
        <div style="margin-top:1rem;">
            <button type="submit" class="btn btn--primary"><?= $editando ? 'Guardar cambios' : 'Crear descuento' ?></button>
            <?php if ($editando): ?>
                <a href="descuentos.php" class="btn btn--secondary">Cancelar</a>
            <?php endif; ?>
        </div>
    </form>
</div>

<div class="panel">
    <h2>Listado (<?= count($descuentos) ?>)</h2>
    <table>
        <thead><tr><th>Nombre</th><th>Tipo</th><th>Valor</th><th>Vigencia</th><th>Estado</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($descuentos as $d): ?>
            <tr>
                <td><?= htmlspecialchars($d['nombre']) ?></td>
                <td><?= $d['tipo'] === 'porcentaje' ? 'Porcentaje' : 'Monto fijo' ?></td>
                <td><?= $d['tipo'] === 'porcentaje' ? htmlspecialchars($d['valor']) . '%' : formatear_moneda($d['valor']) ?></td>
                <td><?= htmlspecialchars($d['fecha_inicio']) ?> &rarr; <?= htmlspecialchars($d['fecha_fin']) ?></td>
                <td><span class="badge <?= $d['activo'] ? 'badge--ok' : 'badge--off' ?>"><?= $d['activo'] ? 'Activo' : 'Inactivo' ?></span></td>
                <td class="acciones">
                    <a class="btn btn--secondary btn--sm" href="descuentos.php?editar=<?= urlencode($d['id_descuento']) ?>">Editar</a>
                    <a class="btn btn--danger btn--sm" href="descuentos.php?eliminar=<?= urlencode($d['id_descuento']) ?>" onclick="return confirm('¿Eliminar este descuento?');">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($descuentos)): ?>
            <tr><td colspan="6" class="texto-apagado">No hay descuentos registrados.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>