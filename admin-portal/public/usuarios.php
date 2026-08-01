<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$servicio = new UsuarioService($api);
$error = null;
$exito = null;
$editando = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'crear') {
    $resp = $servicio->crear([
        'nombre' => trim($_POST['nombre']),
        'contrasena' => $_POST['contrasena'],
        'rol' => $_POST['rol'],
        'estado' => isset($_POST['estado']),
    ]);
    if ($resp['ok']) { $exito = 'Usuario creado correctamente.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo crear el usuario.'; }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'actualizar') {
    $datos = [
        'nombre' => trim($_POST['nombre']),
        'rol' => $_POST['rol'],
        'estado' => isset($_POST['estado']),
    ];
    // Solo se envía la contraseña si se escribió algo (para no borrarla con un campo vacío)
    if (!empty($_POST['contrasena'])) {
        $datos['contrasena'] = $_POST['contrasena'];
    }
    $resp = $servicio->actualizar($_POST['id_usuario'], $datos);
    if ($resp['ok']) { $exito = 'Usuario actualizado correctamente.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo actualizar el usuario.'; }
}

if (isset($_GET['eliminar'])) {
    $resp = $servicio->eliminar($_GET['eliminar']);
    if ($resp['ok']) { $exito = 'Usuario eliminado.'; }
    else { $error = $resp['data']['detail'] ?? 'No se pudo eliminar el usuario.'; }
}

if (isset($_GET['editar'])) {
    $resp = $servicio->obtener($_GET['editar']);
    if ($resp['ok']) { $editando = $resp['data']; }
}

$usuarios = $servicio->listar();
$usuarios = $usuarios['ok'] ? $usuarios['data'] : [];

$tituloPagina = 'Usuarios';
$paginaActual = 'usuarios.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
require __DIR__ . '/../src/views/partials/alerta.php';
?>

<div class="topbar"><h1>Usuarios</h1></div>

<div class="panel">
    <h2><?= $editando ? 'Editar usuario' : 'Nuevo usuario' ?></h2>
    <form method="post" action="usuarios.php">
        <input type="hidden" name="accion" value="<?= $editando ? 'actualizar' : 'crear' ?>">
        <?php if ($editando): ?>
            <input type="hidden" name="id_usuario" value="<?= htmlspecialchars($editando['id_usuario']) ?>">
        <?php endif; ?>
        <div class="form-grid">
            <div>
                <label for="nombre">Nombre de usuario</label>
                <input type="text" id="nombre" name="nombre" required value="<?= htmlspecialchars($editando['nombre'] ?? '') ?>">
            </div>
            <div>
                <label for="contrasena">Contraseña <?= $editando ? '(dejar vacío para no cambiarla)' : '' ?></label>
                <input type="password" id="contrasena" name="contrasena" minlength="6" <?= $editando ? '' : 'required' ?>>
            </div>
            <div>
                <label for="rol">Rol</label>
                <select id="rol" name="rol" required>
                    <option value="admin" <?= ($editando['rol'] ?? '') === 'admin' ? 'selected' : '' ?>>Administrador</option>
                    <option value="cliente" <?= ($editando['rol'] ?? '') === 'cliente' ? 'selected' : '' ?>>Cliente</option>
                </select>
            </div>
            <div style="display:flex; align-items:end; gap:.4rem; padding-bottom:.5rem;">
                <input type="checkbox" id="estado" name="estado" style="width:auto;" <?= ($editando['estado'] ?? true) ? 'checked' : '' ?>>
                <label for="estado" style="margin:0;">Usuario activo</label>
            </div>
        </div>
        <div style="margin-top:1rem;">
            <button type="submit" class="btn btn--primary"><?= $editando ? 'Guardar cambios' : 'Crear usuario' ?></button>
            <?php if ($editando): ?>
                <a href="usuarios.php" class="btn btn--secondary">Cancelar</a>
            <?php endif; ?>
        </div>
    </form>
</div>

<div class="panel">
    <h2>Listado</h2>
    <table>
        <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($usuarios as $u): ?>
            <tr>
                <td><?= htmlspecialchars($u['nombre']) ?></td>
                <td><?= $u['rol'] === 'admin' ? 'Administrador' : 'Cliente' ?></td>
                <td><span class="badge <?= $u['estado'] ? 'badge--ok' : 'badge--off' ?>"><?= $u['estado'] ? 'Activo' : 'Inactivo' ?></span></td>
                <td class="acciones">
                    <a class="btn btn--secondary btn--sm" href="usuarios.php?editar=<?= urlencode($u['id_usuario']) ?>">Editar</a>
                    <a class="btn btn--danger btn--sm" href="usuarios.php?eliminar=<?= urlencode($u['id_usuario']) ?>" onclick="return confirm('¿Eliminar este usuario?');">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($usuarios)): ?>
            <tr><td colspan="4" class="texto-apagado">No hay usuarios registrados.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
