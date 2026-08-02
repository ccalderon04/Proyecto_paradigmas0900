import { DetalleCarrito } from "@/types";
import { precioConDescuento } from "@/lib/pricing";
import {
    crearOCargarCarrito,
    agregarProductoCarrito,
    quitarProductoCarrito,
} from "@/lib/carritoApi";

export class Carrito {
    private idCarrito: string | null = null;
    private items: DetalleCarrito[] = [];

    getIdCarrito(): string | null {
        return this.idCarrito;
    }

    getItems(): DetalleCarrito[] {
        return this.items;
    }

    estaVacio(): boolean {
        return this.items.length === 0;
    }

    async cargar(idCliente: string): Promise<void> {
        const carrito = await crearOCargarCarrito(idCliente);
        this.idCarrito = carrito.id_carrito;
        this.items = carrito.detalles;
    }

    limpiar(): void {
        this.idCarrito = null;
        this.items = [];
    }

    async agregarProducto(idProducto: string, cantidad: number = 1): Promise<void> {
        if (!this.idCarrito) return;
        const carrito = await agregarProductoCarrito(this.idCarrito, idProducto, cantidad);
        this.items = carrito.detalles;
    }

    async quitarProducto(idProducto: string): Promise<void> {
        if (!this.idCarrito) return;
        const carrito = await quitarProductoCarrito(this.idCarrito, idProducto);
        this.items = carrito.detalles;
    }

    async actualizarCantidad(idProducto: string, cantidadNueva: number): Promise<void> {
        if (!this.idCarrito) return;
        if (cantidadNueva <= 0) {
            await this.quitarProducto(idProducto);
            return;
        }
        await quitarProductoCarrito(this.idCarrito, idProducto);
        const carrito = await agregarProductoCarrito(this.idCarrito, idProducto, cantidadNueva);
        this.items = carrito.detalles;
    }

    total(): number {
        return this.items.reduce(
            (acc, item) => acc + precioConDescuento(item.producto) * item.cantidad,
            0
        );
    }

    cantidadTotal(): number {
        return this.items.reduce((acc, item) => acc + item.cantidad, 0);
    }
}
