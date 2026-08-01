// src/lib/metodoPagoApi.ts
import { apiFetch } from "./apiClient";
import { MetodoPago } from "@/types";

export const obtenerMetodosPago = () => apiFetch<MetodoPago[]>("/metodos-pago");