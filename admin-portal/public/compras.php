<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$compraService = new CompraService($api);
$proveedorService = new ProveedorService($api);
$productoService = new ProductoService($api);

$error = null;
$exito = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['accion'] ?? '') === 'registrar') {
    $idsProducto = $_POST['id_producto'] ?? [];
    $cantidades = $_POST['cantidad'] ?? [];
    $precios = $_POST['precio_unitario'] ?? [];

    $indicesValidos = array_filter(
        array_keys($idsProducto),
        fn($i) => !empty($idsProducto[$i]) && (int) $cantidades[$i] > 0
    );

    $items = array_map(fn($i) => [
        'id_producto' => $idsProducto[$i],
        'cantidad' => (int) $cantidades[$i],
        'precio_unitario' => (float) $precios[$i],
    ], $indicesValidos);

    if (empty($_POST['id_proveedor']) || empty($items)) {
        $error = 'Selecciona un proveedor y al menos un producto con cantidad.';
    } else {
        $resp = $compraService->crear([
            'id_proveedor' => $_POST['id_proveedor'],
            'items' => array_values($items),
        ]);
        if ($resp['ok']) {
            $exito = 'Compra registrada. El inventario se actualizó automáticamente.';
        } else {
            $error = $resp['data']['detail'] ?? 'No se pudo registrar la compra.';
        }
    }
}

$proveedores = $proveedorService->listar();
$proveedores = $proveedores['ok'] ? filtrar_activos($proveedores['data']) : [];

$productos = $productoService->listar();
$productos = $productos['ok'] ? filtrar_activos($productos['data']) : [];

$compras = $compraService->listar();
$compras = $compras['ok'] ? $compras['data'] : [];

$nombresProducto = array_combine(extraer_campo($productos, 'id_producto'), extraer_campo($productos, 'nombre'));

$tituloPagina = 'Compras';
$paginaActual = 'compras.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
require __DIR__ . '/../src/views/partials/alerta.php';
?>

<div class="topbar"><h1>Registrar compra a proveedor</h1></div>

<div class="panel">
    <form method="post" action="compras.php" id="form-compra">
        <input type="hidden" name="accion" value="registrar">
        <div class="form-grid" style="margin-bottom:1rem;">
            <div>
                <label for="id_proveedor">Proveedor</label>
                <select id="id_proveedor" name="id_proveedor" required>
                    <option value="">Selecciona...</option>
                    <?php foreach ($proveedores as $p): ?>
                        <option value="<?= htmlspecialchars($p['id_proveedor']) ?>"><?= htmlspecialchars($p['nombre']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <table id="tabla-items">
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario (L.)</th><th></th></tr></thead>
            <tbody>
                <tr class="fila-item">
                    <td>
                        <select name="id_producto[]">
                            <option value="">Selecciona...</option>
                            <?php foreach ($productos as $p): ?>
                                <option value="<?= htmlspecialchars($p['id_producto']) ?>"><?= htmlspecialchars($p['nombre']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                    <td><input type="number" name="cantidad[]" min="1" value="1"></td>
                    <td><input type="number" name="precio_unitario[]" min="0.01" step="0.01"></td>
                    <td></td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top:.8rem;">
            <button type="button" class="btn btn--secondary btn--sm" id="btn-agregar-fila">+ Agregar producto</button>
        </div>

        <div style="margin-top:1rem;">
            <button type="submit" class="btn btn--primary">Registrar compra</button>
        </div>
    </form>
</div>

<div class="panel">
    <h2>Historial de compras</h2>
    <table>
        <thead><tr><th>Fecha</th><th>Total</th><th>Detalle</th></tr></thead>
        <tbody>
        <?php foreach ($compras as $c): ?>
            <tr>
                <td><?= formatear_fecha($c['fecha']) ?></td>
                <td><?= formatear_moneda($c['total']) ?></td>
                <td class="texto-apagado">
                    <?php
                    $lineas = array_map(
                        fn($d) => ($nombresProducto[$d['id_producto']] ?? '?') . ' x' . $d['cantidad'],
                        $c['detalles'] ?? []
                    );
                    echo htmlspecialchars(implode(', ', $lineas));
                    ?>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($compras)): ?>
            <tr><td colspan="3" class="texto-apagado">No hay compras registradas.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<script>
document.getElementById('btn-agregar-fila').addEventListener('click', function () {
    const tbody = document.querySelector('#tabla-items tbody');
    const fila = tbody.querySelector('.fila-item').cloneNode(true);
    fila.querySelectorAll('input').forEach(i => i.value = i.name.includes('cantidad') ? 1 : '');
    fila.querySelectorAll('select').forEach(s => s.selectedIndex = 0);

    const tdBoton = document.createElement('td');
    tdBoton.innerHTML = '<button type="button" class="btn btn--danger btn--sm">Quitar</button>';
    tdBoton.querySelector('button').addEventListener('click', () => fila.remove());
    fila.lastElementChild.replaceWith(tdBoton);

    tbody.appendChild(fila);
});
</script>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
