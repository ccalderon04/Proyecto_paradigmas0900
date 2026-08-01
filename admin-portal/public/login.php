<?php
require_once __DIR__ . '/../src/bootstrap.php';

if (Auth::estaAutenticado()) {
    header('Location: index.php');
    exit;
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identificador = trim($_POST['identificador'] ?? '');
    $contrasena = $_POST['contrasena'] ?? '';

    if ($identificador === '' || $contrasena === '') {
        $error = 'Completa usuario y contraseña.';
    } else {
        $authService = new AuthService($api);
        $respuesta = $authService->login($identificador, $contrasena);

        if (!$respuesta['ok']) {
            $error = $respuesta['data']['detail'] ?? 'Usuario o contraseña incorrectos.';
        } elseif (($respuesta['data']['rol'] ?? '') !== 'admin') {
            $error = 'Esta cuenta no tiene permisos de administrador.';
        } else {
            Auth::iniciarSesion($respuesta['data']);
            header('Location: index.php');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión · Portal Admin</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
<div class="login-wrap">
    <div class="login-card">
        <h1>Portal Administrativo</h1>
        <p>Tienda de Artículos Deportivos — inicia sesión para continuar.</p>

        <?php if ($error): ?>
            <div class="alerta alerta--error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <form method="post" action="login.php">
            <label for="identificador">Usuario</label>
            <input type="text" id="identificador" name="identificador" required autofocus>

            <label for="contrasena" style="margin-top:.8rem;">Contraseña</label>
            <input type="password" id="contrasena" name="contrasena" required>

            <button type="submit" class="btn btn--primary">Ingresar</button>
        </form>
    </div>
</div>
</body>
</html>
