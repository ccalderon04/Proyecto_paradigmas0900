"use client";

import { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";
import { DetalleCarrito } from "@/types";
import { Carrito } from "@/models/Carrito";

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

interface CarritoSnapshot {
    idCarrito: string | null;
    items: DetalleCarrito[];
    total: number;
    cantidadTotal: number;
}

function tomarSnapshot(carrito: Carrito): CarritoSnapshot {
    return {
        idCarrito: carrito.getIdCarrito(),
        items: carrito.getItems(),
        total: carrito.total(),
        cantidadTotal: carrito.cantidadTotal(),
    };
}

export function CarritoProvider({ children }: { children: ReactNode }) {
    const [carrito] = useState(() => new Carrito());
    
    const carritoRef = useRef(carrito);

    const [snapshot, setSnapshot] = useState<CarritoSnapshot>(() => tomarSnapshot(carrito));

    const sincronizar = useCallback(() => {
        setSnapshot(tomarSnapshot(carritoRef.current));
    }, []);

    const cargarCarritoCliente = async (idCliente: string) => {
        try {
            await carritoRef.current.cargar(idCliente);
        } catch (err) {
            console.error("Error cargando carrito:", err);
        } finally {
            sincronizar();
        }
    };

    const limpiarCarritoLocal = () => {
        carritoRef.current.limpiar();
        sincronizar();
    };

    const agregarProducto = async (idProducto: string, cantidad: number = 1) => {
        await carritoRef.current.agregarProducto(idProducto, cantidad);
        sincronizar();
    };

    const quitarProducto = async (idProducto: string) => {
        await carritoRef.current.quitarProducto(idProducto);
        sincronizar();
    };

    const actualizarCantidad = async (idProducto: string, cantidadNueva: number) => {
        await carritoRef.current.actualizarCantidad(idProducto, cantidadNueva);
        sincronizar();
    };

    return (
        <CarritoContext.Provider
            value={{
                idCarrito: snapshot.idCarrito,
                items: snapshot.items,
                cargarCarritoCliente,
                limpiarCarritoLocal,
                agregarProducto,
                quitarProducto,
                actualizarCantidad,
                total: snapshot.total,
                cantidadTotal: snapshot.cantidadTotal,
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
