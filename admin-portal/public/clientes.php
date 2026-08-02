<?php
require_once __DIR__ . '/../src/bootstrap.php';
Auth::requerirSesion();

$clienteService = new ClienteService($api);
$facturaService = new FacturaService($api);

$clientes = $clienteService->listar();
$clientes = $clientes['ok'] ? $clientes['data'] : [];

$viendoHistorial = null;
$facturasCliente = [];

if (isset($_GET['ver'])) {
    // Buscamos el cliente en la lista ya cargada,
    // otra vez al backend con obtener() — ya lo tenemos en memoria.
    foreach ($clientes as $c) {
        if ($c['id_cliente'] === $_GET['ver']) {
            $viendoHistorial = $c;
            break;
        }
    }

    if ($viendoHistorial) {
        $resp = $facturaService->porCliente($viendoHistorial['id_cliente']);
        $facturasCliente = $resp['ok'] ? $resp['data'] : [];
    }
}

$tituloPagina = 'Clientes';
$paginaActual = 'clientes.php';
require __DIR__ . '/../src/views/partials/head.php';
require __DIR__ . '/../src/views/partials/sidebar.php';
require __DIR__ . '/../src/views/partials/alerta.php';
?>

<div class="topbar"><h1>Clientes</h1></div>

<?php if ($viendoHistorial): ?>

    <div class="panel">
        <h2>
            Historial de <?= htmlspecialchars($viendoHistorial['p_nombre'] . ' ' . $viendoHistorial['p_apellido']) ?>
        </h2>
        <p class="texto-apagado">
            Correo: <?= htmlspecialchars($viendoHistorial['correo']) ?>
            <?php if (!empty($viendoHistorial['telefono'])): ?>
                &middot; Teléfono: <?= htmlspecialchars($viendoHistorial['telefono']) ?>
            <?php endif; ?>
        </p>
        <a href="clientes.php" class="btn btn--secondary btn--sm">&larr; Volver al listado</a>
    </div>

    <div class="panel">
        <h2>Facturas (<?= count($facturasCliente) ?>)</h2>
        <table>
            <thead><tr><th>Fecha</th><th>Subtotal</th><th>Impuestos</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($facturasCliente as $f): ?>
                <tr>
                    <td><?= htmlspecialchars($f['fecha']) ?></td>
                    <td><?= formatear_moneda($f['subtotal']) ?></td>
                    <td><?= formatear_moneda($f['impuestos']) ?></td>
                    <td><?= formatear_moneda($f['total']) ?></td>
                    <td><span class="badge <?= $f['estado'] ? 'badge--ok' : 'badge--off' ?>"><?= $f['estado'] ? 'Activa' : 'Anulada' ?></span></td>
                    <td class="acciones">
                        <a class="btn btn--secondary btn--sm" href="factura_detalle.php?id=<?= urlencode($f['id_factura']) ?>">Ver detalle</a>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (empty($facturasCliente)): ?>
                <tr><td colspan="6" class="texto-apagado">Este cliente todavía no tiene facturas.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
    </div>

<?php else: ?>

    <div class="panel">
        <h2>Listado (<?= count($clientes) ?>)</h2>
        <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($clientes as $c): ?>
                <tr>
                    <td><?= htmlspecialchars($c['p_nombre'] . ' ' . ($c['s_nombre'] ? $c['s_nombre'] . ' ' : '') . $c['p_apellido'] . ' ' . ($c['s_apellido'] ?? '')) ?></td>
                    <td><?= htmlspecialchars($c['correo']) ?></td>
                    <td><?= htmlspecialchars($c['telefono'] ?? '—') ?></td>
                    <td class="acciones">
                        <a class="btn btn--secondary btn--sm" href="clientes.php?ver=<?= urlencode($c['id_cliente']) ?>">Ver historial</a>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (empty($clientes)): ?>
                <tr><td colspan="4" class="texto-apagado">No hay clientes registrados.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
    </div>

<?php endif; ?>

<?php require __DIR__ . '/../src/views/partials/footer.php'; ?>