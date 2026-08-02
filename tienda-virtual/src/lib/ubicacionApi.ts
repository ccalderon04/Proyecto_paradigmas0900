import { apiFetch } from "./apiClient";
import { Departamento, Ciudad } from "@/types";

export const obtenerDepartamentos = () => apiFetch<Departamento[]>("/departamentos/");
export const obtenerCiudades = () => apiFetch<Ciudad[]>("/ciudades/");

export const crearCiudad = (nombre: string) =>
  apiFetch<Ciudad>("/ciudades/", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });

export async function obtenerOCrearCiudad(nombreEscrito: string): Promise<string> {
  const nombreLimpio = nombreEscrito.trim();
  const ciudades = await obtenerCiudades();
  const existente = ciudades.find(
    (c) => c.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
  );
  if (existente) return existente.id_ciudad;
  const nueva = await crearCiudad(nombreLimpio);
  return nueva.id_ciudad;
}