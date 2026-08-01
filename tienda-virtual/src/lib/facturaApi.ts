// src/lib/facturaApi.ts
import { apiFetch } from "./apiClient";
import { Factura, FacturaCreate } from "@/types";

export const crearFactura = (data: FacturaCreate) =>
    apiFetch<Factura>("/facturas", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const obtenerFacturaPorId = (id: number) =>
    apiFetch<Factura>(`/facturas/${id}`);