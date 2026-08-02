import { Producto } from "@/types";
import { parseMoney } from "./format";

export function tieneOfertaActiva(producto: Producto): boolean {
    if (!producto.descuento || !producto.descuento.activo) return false;
    const hoy = new Date();
    const inicio = new Date(producto.descuento.fecha_inicio);
    const fin = new Date(producto.descuento.fecha_fin);
    return hoy >= inicio && hoy <= fin;
}

export function precioConDescuento(producto: Producto): number {
    const precioBase = parseMoney(producto.precio);
    if (!tieneOfertaActiva(producto)) return precioBase;

    const d = producto.descuento!;
    const valor = parseMoney(d.valor);

    if (d.tipo === "porcentaje") {
        return precioBase - (precioBase * valor) / 100;
    }
    return Math.max(0, precioBase - valor);
}

export function porcentajeDescuento(producto: Producto): number {
    if (!tieneOfertaActiva(producto)) return 0;
    const precioBase = parseMoney(producto.precio);
    const final = precioConDescuento(producto);
    return Math.round(((precioBase - final) / precioBase) * 100);
}