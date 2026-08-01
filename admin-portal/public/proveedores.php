<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$servicio = new ProveedorService($api);
$error = null;
$exito = null;
$editando = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($_POST['accion'] ?? '', ['crear', 'actualizar'])) {
    $datos = [
        'nombre' => trim($_POST['nombre']),
        'contacto' => trim($_POST['contacto'] ?? '') ?: null,
        'telefono' => trim($_POST['telefono'] ?? '') ?: null,
        'correo' => trim($_POST['correo'] ?? '') ?: null,
        'estado' => isset($_POST['estado']),
    ];

    if ($_POST['accion'] === 'crear') {
        $resp = $servicio->crear($datos);
        $mensajeOk = 'Proveedor creado correctamente.';
    } else {
        $resp = $servicio->actualizar($_POST['id_proveedor'], $datos);
        $mensajeOk = 'Proveedor actualizado correctamente.';
    }

    if ($resp['ok']) { $exito = $mensajeOk; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo guardar el proveedor.'; }
}

if (isset($_GET['eliminar'])) {
    $resp = $servicio->eliminar($_GET['eliminar']);
    if ($resp['ok']) { $exito = 'Proveedor eliminado.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo eliminar el proveedor.'; }
}

if (isset($_GET['editar'])) {
    $resp = $servicio->obtener($_GET['editar']);
    if ($resp['ok']) { $editando = $resp['data']; }
}

$proveedores = $servicio->listar();
$proveedores = $proveedores['ok'] ? $proveedores['data'] : [];

$tituloPagina = 'Proveedores';
$paginaActual = 'proveedores.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
require __DIR__ . '/../src/views/partials/alerta.php';
?>

<div class="topbar"><h1>Proveedores</h1></div>

<div class="panel">
    <h2><?= $editando ? 'Editar proveedor' : 'Nuevo proveedor' ?></h2>
    <form method="post" action="proveedores.php">
        <input type="hidden" name="accion" value="<?= $editando ? 'actualizar' : 'crear' ?>">
        <?php if ($editando): ?>
            <input type="hidden" name="id_proveedor" value="<?= htmlspecialchars($editando['id_proveedor']) ?>">
        <?php endif; ?>
        <div class="form-grid">
            <div>
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" name="nombre" required value="<?= htmlspecialchars($editando['nombre'] ?? '') ?>">
            </div>
            <div>
                <label for="contacto">Persona de contacto</label>
                <input type="text" id="contacto" name="contacto" value="<?= htmlspecialchars($editando['contacto'] ?? '') ?>">
            </div>
            <div>
                <label for="telefono">Teléfono</label>
                <input type="text" id="telefono" name="telefono" value="<?= htmlspecialchars($editando['telefono'] ?? '') ?>">
            </div>
            <div>
                <label for="correo">Correo</label>
                <input type="email" id="correo" name="correo" value="<?= htmlspecialchars($editando['correo'] ?? '') ?>">
            </div>
            <div style="display:flex; align-items:end; gap:.4rem; padding-bottom:.5rem;">
                <input type="checkbox" id="estado" name="estado" style="width:auto;" <?= ($editando['estado'] ?? true) ? 'checked' : '' ?>>
                <label for="estado" style="margin:0;">Proveedor activo</label>
            </div>
        </div>
        <div style="margin-top:1rem;">
            <button type="submit" class="btn btn--primary"><?= $editando ? 'Guardar cambios' : 'Crear proveedor' ?></button>
            <?php if ($editando): ?>
                <a href="proveedores.php" class="btn btn--secondary">Cancelar</a>
            <?php endif; ?>
        </div>
    </form>
</div>

<div class="panel">
    <h2>Listado</h2>
    <table>
        <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Correo</th><th>Estado</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($proveedores as $p): ?>
            <tr>
                <td><?= htmlspecialchars($p['nombre']) ?></td>
                <td><?= htmlspecialchars($p['contacto'] ?? '—') ?></td>
                <td><?= htmlspecialchars($p['telefono'] ?? '—') ?></td>
                <td><?= htmlspecialchars($p['correo'] ?? '—') ?></td>
                <td><span class="badge <?= $p['estado'] ? 'badge--ok' : 'badge--off' ?>"><?= $p['estado'] ? 'Activo' : 'Inactivo' ?></span></td>
                <td class="acciones">
                    <a class="btn btn--secondary btn--sm" href="proveedores.php?editar=<?= urlencode($p['id_proveedor']) ?>">Editar</a>
                    <a class="btn btn--danger btn--sm" href="proveedores.php?eliminar=<?= urlencode($p['id_proveedor']) ?>" onclick="return confirm('¿Eliminar este proveedor?');">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($proveedores)): ?>
            <tr><td colspan="6" class="texto-apagado">No hay proveedores registrados.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
