import { apiFetch } from "./apiClient";
import { Tarjeta } from "@/types";

export interface TarjetaCreate {
    id_cliente: string;
    titular: string;
    ultimos_digitos: string;
    marca: string;
    fecha_expiracion: string;
}

export const obtenerTarjetasPorCliente = (idCliente: string) =>
    apiFetch<Tarjeta[]>(`/tarjetas/cliente/${idCliente}`);

export const crearTarjeta = (data: TarjetaCreate) =>
    apiFetch<Tarjeta>("/tarjetas/", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const eliminarTarjeta = (id: string) =>
    apiFetch<void>(`/tarjetas/${id}`, { method: "DELETE" });