import { Cliente } from "@/types";

export class Sesion {
    private static readonly CLAVE = "cliente";

    static obtenerCliente(): Cliente | null {
        const guardado = localStorage.getItem(Sesion.CLAVE);
        if (!guardado) return null;
        try {
            return JSON.parse(guardado) as Cliente;
        } catch {
            localStorage.removeItem(Sesion.CLAVE);
            return null;
        }
    }

    static iniciar(cliente: Cliente): void {
        localStorage.setItem(Sesion.CLAVE, JSON.stringify(cliente));
        window.dispatchEvent(new Event("sesion-cambio"));
    }

    static cerrar(): void {
        localStorage.removeItem(Sesion.CLAVE);
        window.dispatchEvent(new Event("sesion-cambio"));
    }

    static hayClienteActivo(): boolean {
        return Sesion.obtenerCliente() !== null;
    }
}
