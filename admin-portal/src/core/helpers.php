<?php


function formatear_moneda(float $valor): string
{
    return 'L. ' . number_format($valor, 2);
}

function filtrar_activos(array $items): array
{
    return array_values(array_filter($items, fn(array $item) => ($item['estado'] ?? true) === true));
}

function filtrar_stock_bajo(array $productos, int $umbral = 5): array
{
    return array_values(array_filter($productos, fn(array $p) => ($p['stock'] ?? 0) <= $umbral));
}

function extraer_campo(array $items, string $campo): array
{
    return array_map(fn(array $item) => $item[$campo] ?? null, $items);
}

function calcular_valor_inventario(array $productos): float
{
    return array_reduce(
        $productos,
        fn(float $acumulado, array $p) => $acumulado + ((float) $p['precio'] * (int) $p['stock']),
        0.0
    );
}

function calcular_total_ventas(array $facturas): float
{
    return array_reduce($facturas, fn(float $acumulado, array $f) => $acumulado + (float) $f['total'], 0.0);
}
function formatear_fecha(?string $fechaIso): string
{
    if (!$fechaIso) {
        return '—';
    }
    $fecha = new DateTime($fechaIso);
    return $fecha->format('d/m/Y H:i');
}
