<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$facturaService = new FacturaService($api);
$metodoPagoService = new MetodoPagoService($api);

$facturas = $facturaService->listar();
$facturas = $facturas['ok'] ? $facturas['data'] : [];

$metodos = $metodoPagoService->listar();
$metodos = $metodos['ok'] ? $metodos['data'] : [];
$nombresMetodo = array_combine(extraer_campo($metodos, 'id_metodo_pago'), extraer_campo($metodos, 'nombre'));

$totalVentas = calcular_total_ventas($facturas);

$tituloPagina = 'Ventas / Facturas';
$paginaActual = 'facturas.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
?>

<div class="topbar"><h1>Ventas / Facturas</h1></div>

<div class="grid-kpi">
    <div class="card">
        <div class="card__label">Facturas emitidas</div>
        <div class="card__valor"><?= count($facturas) ?></div>
    </div>
    <div class="card">
        <div class="card__label">Total facturado</div>
        <div class="card__valor tertiary"><?= formatear_moneda($totalVentas) ?></div>
    </div>
</div>

<div class="panel">
    <table>
        <thead><tr><th>Fecha</th><th>Subtotal</th><th>Impuestos</th><th>Total</th><th>Método de pago</th><th>Estado</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($facturas as $f): ?>
            <tr>
                <td><?= formatear_fecha($f['fecha']) ?></td>
                <td><?= formatear_moneda($f['subtotal']) ?></td>
                <td><?= formatear_moneda($f['impuestos']) ?></td>
                <td><strong><?= formatear_moneda($f['total']) ?></strong></td>
                <td><?= htmlspecialchars($nombresMetodo[$f['id_metodo_pago']] ?? '—') ?></td>
                <td><span class="badge <?= $f['estado'] ? 'badge--ok' : 'badge--off' ?>"><?= $f['estado'] ? 'Válida' : 'Anulada' ?></span></td>
                <td><a class="btn btn--secondary btn--sm" href="factura_detalle.php?id=<?= urlencode($f['id_factura']) ?>">Ver detalle</a></td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($facturas)): ?>
            <tr><td colspan="7" class="texto-apagado">No hay facturas generadas todavía.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>
