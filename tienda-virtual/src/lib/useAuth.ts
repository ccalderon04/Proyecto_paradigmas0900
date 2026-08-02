"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Cliente } from "@/types";
import { Sesion } from "@/models/Sesion";

let snapshotCache: Cliente | null = null;
let isCached = false;

function subscribe(callback: () => void) {
    const handleCambio = () => {
        snapshotCache = Sesion.obtenerCliente();
        isCached = true;
        callback(); 
    };

    window.addEventListener("sesion-cambio", handleCambio);
    return () => window.removeEventListener("sesion-cambio", handleCambio);
}

function getSnapshot(): Cliente | null {
    if (!isCached) {
        snapshotCache = Sesion.obtenerCliente();
        isCached = true;
    }
    return snapshotCache;
}

function getServerSnapshot(): Cliente | null {
    return null;
}

export function useAuth() {
    const cliente = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const cargando = false;
    
    const logout = useCallback(() => {
        Sesion.cerrar();
    }, []);

    return { cliente, cargando, logout };
}