// src/lib/productosApi.ts
import { apiFetch } from "./apiClient";
import { Producto } from "@/types";

export const obtenerProductos = () => apiFetch<Producto[]>("/productos");

export const obtenerProductosPorCategoria = (idCategoria: number) =>
    apiFetch<Producto[]>(`/productos/categoria/${idCategoria}`);

export const obtenerProductoPorId = (id: number) =>
    apiFetch<Producto>(`/productos/${id}`);