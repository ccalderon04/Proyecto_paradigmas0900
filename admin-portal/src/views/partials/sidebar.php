<?php
/** Recibe $paginaActual (string) para resaltar el link activo en el menú. */
$paginaActual = $paginaActual ?? '';
$usuario = Auth::usuarioActual();

$menu = [
    'index.php' => 'Dashboard',
    'productos.php' => 'Productos',
    'categorias.php' => 'Categorías',
    'descuentos.php' => 'Descuentos',
    'proveedores.php' => 'Proveedores',
    'compras.php' => 'Compras',
    'inventario.php' => 'Inventario',
    'facturas.php' => 'Ventas / Facturas',
    'clientes.php' => 'Clientes',
    'usuarios.php' => 'Usuarios',
];
?>
<div class="layout">
<aside class="sidebar">
    <div class="sidebar__logo">Tienda<span>Deportiva</span></div>
    <nav class="sidebar__nav">
        <?php foreach ($menu as $archivo => $etiqueta): ?>
            <a href="<?= $archivo ?>" class="<?= $paginaActual === $archivo ? 'activo' : '' ?>"><?= $etiqueta ?></a>
        <?php endforeach; ?>
    </nav>
    <div class="sidebar__user">
        Sesión: <strong><?= htmlspecialchars($usuario['nombre'] ?? '') ?></strong>
        <form method="post" action="logout.php">
            <button type="submit" class="btn btn--secondary btn--sm" style="width:100%;">Cerrar sesión</button>
        </form>
    </div>
</aside>
<main class="contenido">