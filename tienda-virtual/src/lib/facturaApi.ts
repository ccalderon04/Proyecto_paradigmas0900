import { apiFetch } from "./apiClient";
import { Factura } from "@/types";

export interface FacturaCreate {
    id_carrito: string;
    id_metodo_pago: string;
    descuentos_por_producto?: Record<string, string>;
}

export const crearFactura = (data: FacturaCreate) =>
    apiFetch<Factura>("/facturas/", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const obtenerFacturaPorId = (id: string) =>
    apiFetch<Factura>(`/facturas/${id}`);

export const obtenerFacturasPorCliente = (idCliente: string) =>
    apiFetch<Factura[]>(`/facturas/cliente/${idCliente}`);