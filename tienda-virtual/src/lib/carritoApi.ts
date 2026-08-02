import { apiFetch } from "./apiClient";
import { Carrito } from "@/types";

export const crearOCargarCarrito = (idCliente: string) =>
    apiFetch<Carrito>(`/carrito/cliente/${idCliente}`, { method: "POST" });

export const agregarProductoCarrito = (
    idCarrito: string,
    idProducto: string,
    cantidad: number
) =>
    apiFetch<Carrito>(`/carrito/${idCarrito}/productos`, {
        method: "POST",
        body: JSON.stringify({ id_producto: idProducto, cantidad }),
    });

export const quitarProductoCarrito = (idCarrito: string, idProducto: string) =>
    apiFetch<Carrito>(`/carrito/${idCarrito}/productos/${idProducto}`, {
        method: "DELETE",
    });