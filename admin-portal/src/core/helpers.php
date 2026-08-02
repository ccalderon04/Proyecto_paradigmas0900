<?php


function formatear_moneda(float $valor): string
{
    return 'L. ' . number_format($valor, 2);
}

/** Usa array_filter() + fn(): deja solo los elementos con estado=true. */
function filtrar_activos(array $items): array
{
    return array_values(array_filter($items, fn(array $item) => ($item['estado'] ?? true) === true));
}

/** Usa array_filter() + fn(): productos con stock bajo (posible alerta de inventario). */
function filtrar_stock_bajo(array $productos, int $umbral = 5): array
{
    return array_values(array_filter($productos, fn(array $p) => ($p['stock'] ?? 0) <= $umbral));
}

/** Usa array_map() + fn(): extrae solo un campo de una lista de arreglos. */
function extraer_campo(array $items, string $campo): array
{
    return array_map(fn(array $item) => $item[$campo] ?? null, $items);
}

/** Usa array_reduce() + fn(): suma el valor de inventario (precio * stock) de todos los productos. */
function calcular_valor_inventario(array $productos): float
{
    return array_reduce(
        $productos,
        fn(float $acumulado, array $p) => $acumulado + ((float) $p['precio'] * (int) $p['stock']),
        0.0
    );
}

/** Usa array_reduce() + fn(): suma el total de una lista de facturas. */
function calcular_total_ventas(array $facturas): float
{
    return array_reduce($facturas, fn(float $acumulado, array $f) => $acumulado + (float) $f['total'], 0.0);
}

/** Función pura de formato de fecha, reutilizable en toda la UI. */
function formatear_fecha(?string $fechaIso): string
{
    if (!$fechaIso) {
        return '—';
    }
    $fecha = new DateTime($fechaIso);
    return $fecha->format('d/m/Y H:i');
}
