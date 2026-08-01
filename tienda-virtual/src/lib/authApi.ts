// src/lib/authApi.ts
import { apiFetch } from "./apiClient";
import { Cliente, Usuario } from "@/types";

export interface RegistroData {
    p_nombre: string;
    s_nombre?: string | null;
    p_apellido: string;
    s_apellido?: string | null;
    fecha_nacimiento?: string | null;
    correo: string;
    telefono?: string | null;
    genero?: "M" | "F" | "Otro" | null;
    nombre_usuario: string;
    contrasena: string;
}

export interface LoginData {
    nombre: string; // nombre de usuario (no es el correo)
    contrasena: string;
}

export const registrarCliente = (data: RegistroData) =>
    apiFetch<Cliente>("/clientes/registro", {
    method: "POST",
    body: JSON.stringify(data),
    });

export const loginUsuario = (data: LoginData) =>
    apiFetch<Usuario>("/usuarios/login", {
    method: "POST",
    body: JSON.stringify(data),
    });

// TEMPORAL: el login solo devuelve datos del usuario, no del cliente.
// Buscamos el cliente asociado filtrando la lista completa.
// Pedir al backend un endpoint /clientes/usuario/{id_usuario} para evitar esto.
export const obtenerClientePorUsuario = async (idUsuario: string): Promise<Cliente | null> => {
    const clientes = await apiFetch<Cliente[]>("/clientes/");
    return clientes.find((c) => c.id_usuario === idUsuario) ?? null;
};