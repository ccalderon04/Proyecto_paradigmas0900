import { apiFetch } from "./apiClient";
import { Direccion } from "@/types";

export interface DireccionCreate {
  id_cliente: string;
  id_departamento: string;
  id_ciudad: string;
  calle: string;
  colonia: string;
  lat?: string | null;
  long?: string | null;
}

export const obtenerDireccionesPorCliente = (idCliente: string) =>
  apiFetch<Direccion[]>(`/direcciones/cliente/${idCliente}`);

export const crearDireccion = (data: DireccionCreate) =>
  apiFetch<Direccion>("/direcciones/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const eliminarDireccion = (id: string) =>
  apiFetch<void>(`/direcciones/${id}`, { method: "DELETE" });