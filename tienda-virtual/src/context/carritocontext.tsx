"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Producto } from "@/types";

export interface ItemCarrito {
    producto: Producto;
    cantidad: number;
}

interface CarritoContextType {
    items: ItemCarrito[];
    agregarProducto: (producto: Producto, cantidad?: number) => void;
    quitarProducto: (idProducto: number) => void;
    actualizarCantidad: (idProducto: number, cantidad: number) => void;
    vaciarCarrito: () => void;
    total: number;
    cantidadTotal: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ItemCarrito[]>([]);

    useEffect(() => {
        const guardado = sessionStorage.getItem("carrito");
        if (guardado) {
            try {
            setItems(JSON.parse(guardado));
            } catch {
            }
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("carrito", JSON.stringify(items));
    }, [items]);

    const agregarProducto = (producto: Producto, cantidad: number = 1) => {
        setItems((prev) => {
            const existente = prev.find((item) => item.producto.id_producto === producto.id_producto);
            if (existente) {
            return prev.map((item) =>
                item.producto.id_producto === producto.id_producto
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item
            );
            }
            return [...prev, { producto, cantidad }];
        });
    };

    const quitarProducto = (idProducto: number) => {
        setItems((prev) => prev.filter((item) => item.producto.id_producto !== idProducto));
    };

    const actualizarCantidad = (idProducto: number, cantidad: number) => {
        if (cantidad <= 0) {
            quitarProducto(idProducto);
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
            item.producto.id_producto === idProducto ? { ...item, cantidad } : item
            )
        );
    };

    const vaciarCarrito = () => setItems([]);

    // Funciones puras para los cálculos (programación funcional)
    const total = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <CarritoContext.Provider
            value={{ items, agregarProducto, quitarProducto, actualizarCantidad, vaciarCarrito, total, cantidadTotal }}
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