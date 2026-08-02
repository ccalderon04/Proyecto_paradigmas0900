import { apiFetch } from "./apiClient";
import { Producto } from "@/types";

export const obtenerProductos = () => apiFetch<Producto[]>("/productos/");

export const obtenerProductosPorCategoria = (idCategoria: string) =>
    apiFetch<Producto[]>(`/productos/categoria/${idCategoria}`);

export const obtenerProductoPorId = (id: string) =>
    apiFetch<Producto>(`/productos/${id}`);