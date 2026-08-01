import { apiFetch } from "./apiClient";
import { Producto, Categoria } from "@/types";

export const obtenerProductos = () => apiFetch<Producto[]>("/productos");

export const obtenerProductosPorCategoria = (idCategoria: number) =>
    apiFetch<Producto[]>(`/productos/categoria/${idCategoria}`);

export const obtenerCategorias = () => apiFetch<Categoria[]>("/categorias");

export const obtenerProductoPorId = (id: number) =>
    apiFetch<Producto>(`/productos/${id}`);