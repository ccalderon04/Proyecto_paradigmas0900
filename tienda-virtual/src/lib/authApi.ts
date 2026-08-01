// src/lib/authApi.ts
import { apiFetch } from "./apiClient";
import { Cliente } from "@/types";

export interface RegistroData {
    nombre: string;
    correo: string;
    contrasena: string;
    p_apellido: string;
}

export interface LoginData {
    correo: string;
    contrasena: string;
}

export const registrarCliente = (data: RegistroData) =>
    apiFetch<Cliente>("/clientes/registro", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const loginCliente = (data: LoginData) =>
    apiFetch<Cliente>("/login", {
        method: "POST",
        body: JSON.stringify(data),
    });