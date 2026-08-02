<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

if (empty($_GET['id'])) {
    header('Location: facturas.php');
    exit;
}

$facturaService = new FacturaService($api);
$productoService = new ProductoService($api);

$resp = $facturaService->obtener($_GET['id']);
if (!$resp['ok']) {
    header('Location: facturas.php');
    exit;
}
$factura = $resp['data'];

$productos = $productoService->listar();
$productos = $productos['ok'] ? $productos['data'] : [];
$nombresProducto = array_combine(extraer_campo($productos, 'id_producto'), extraer_campo($productos, 'nombre'));

$tituloPagina = 'Detalle de factura';
$paginaActual = 'facturas.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
?>

<div class="topbar">
    <h1>Factura</h1>
    <a href="facturas.php" class="btn btn--secondary btn--sm">← Volver</a>
</div>

<div class="panel">
    <div class="form-grid">
        <div><span class="texto-apagado">Cliente</span><br><?= htmlspecialchars($factura['cliente']['p_nombre'] . ' ' . $factura['cliente']['p_apellido']) ?></div>
        <div><span class="texto-apagado">Fecha</span><br><?= formatear_fecha($factura['fecha']) ?></div>
        <div><span class="texto-apagado">Estado</span><br>
            <span class="badge <?= $factura['estado'] ? 'badge--ok' : 'badge--off' ?>"><?= $factura['estado'] ? 'Válida' : 'Anulada' ?></span>
        </div>
        <div><span class="texto-apagado">Subtotal</span><br><?= formatear_moneda($factura['subtotal']) ?></div>
        <div><span class="texto-apagado">Impuestos</span><br><?= formatear_moneda($factura['impuestos']) ?></div>
        <div><span class="texto-apagado">Total</span><br><strong style="font-size:1.2rem;"><?= formatear_moneda($factura['total']) ?></strong></div>
    </div>
</div>

<?php if ($factura['direccion']): ?>
<div class="panel">
    <h2>Dirección de envío</h2>
    <p>
        <?= htmlspecialchars($factura['direccion']['calle']) ?>, <?= htmlspecialchars($factura['direccion']['colonia']) ?><br>
        <?= htmlspecialchars($factura['direccion']['ciudad']['nombre']) ?>, <?= htmlspecialchars($factura['direccion']['departamento']['nombre']) ?>
    </p>
</div>
<?php endif; ?>

<div class="panel">
    <h2>Productos facturados</h2>
    <table>
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Total línea</th></tr></thead>
        <tbody>
        <?php foreach ($factura['detalles'] as $d): ?>
            <tr>
                <td><?= htmlspecialchars($nombresProducto[$d['id_producto']] ?? $d['id_producto']) ?></td>
                <td><?= $d['cantidad'] ?></td>
                <td><?= formatear_moneda($d['total']) ?></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
