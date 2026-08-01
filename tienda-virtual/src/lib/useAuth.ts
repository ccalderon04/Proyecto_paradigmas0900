// src/lib/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { Cliente } from "@/types";

export function useAuth() {
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
    const guardado = localStorage.getItem("cliente");
    if (guardado) {
        try {
        setCliente(JSON.parse(guardado));
        } catch {
        localStorage.removeItem("cliente");
        }
    }
    setCargando(false);
    }, []);

    return { cliente, cargando };
}