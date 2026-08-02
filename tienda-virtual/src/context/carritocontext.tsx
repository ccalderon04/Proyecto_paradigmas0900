"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DetalleCarrito } from "@/types";
import { precioConDescuento } from "@/lib/pricing";
import {
    crearOCargarCarrito,
    agregarProductoCarrito,
    quitarProductoCarrito,
} from "@/lib/carritoApi";

interface CarritoContextType {
    idCarrito: string | null;
    items: DetalleCarrito[];
    cargarCarritoCliente: (idCliente: string) => Promise<void>;
    limpiarCarritoLocal: () => void;
    agregarProducto: (idProducto: string, cantidad?: number) => Promise<void>;
    quitarProducto: (idProducto: string) => Promise<void>;
    actualizarCantidad: (idProducto: string, cantidadNueva: number) => Promise<void>;
    total: number;
    cantidadTotal: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
    const [idCarrito, setIdCarrito] = useState<string | null>(null);
    const [items, setItems] = useState<DetalleCarrito[]>([]);

    const cargarCarritoCliente = async (idCliente: string) => {
        try {
            const carrito = await crearOCargarCarrito(idCliente);
            setIdCarrito(carrito.id_carrito);
            setItems(carrito.detalles);
        } catch (err) {
            console.error("Error cargando carrito:", err);
        }
    };

    const limpiarCarritoLocal = () => {
        setIdCarrito(null);
        setItems([]);
    };

    const agregarProducto = async (idProducto: string, cantidad: number = 1) => {
        if (!idCarrito) return;
        const carrito = await agregarProductoCarrito(idCarrito, idProducto, cantidad);
        console.log("idCarrito al agregar:", idCarrito);
        setItems(carrito.detalles);
    };

    const quitarProducto = async (idProducto: string) => {
        if (!idCarrito) return;
        const carrito = await quitarProductoCarrito(idCarrito, idProducto);
        setItems(carrito.detalles);
    };

    const actualizarCantidad = async (idProducto: string, cantidadNueva: number) => {
        if (!idCarrito) return;
        if (cantidadNueva <= 0) {
            await quitarProducto(idProducto);
            return;
        }
        await quitarProductoCarrito(idCarrito, idProducto);
        const carrito = await agregarProductoCarrito(idCarrito, idProducto, cantidadNueva);
        setItems(carrito.detalles);
    };

    const total = items.reduce(
        (acc, item) => acc + precioConDescuento(item.producto) * item.cantidad,
        0
    );
    const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <CarritoContext.Provider
            value={{
                idCarrito,
                items,
                cargarCarritoCliente,
                limpiarCarritoLocal,
                agregarProducto,
                quitarProducto,
                actualizarCantidad,
                total,
                cantidadTotal,
            }}
        >
            {children}
        </CarritoContext.Provider>
    );
}

export function useCarrito() {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error("useCarrito debe usarse dentro de un CarritoProvider");
    }
    return context;
}