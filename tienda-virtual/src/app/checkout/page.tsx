"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { useCarrito } from "@/context/carritocontext";
import { useAuth } from "@/lib/useAuth";
import { obtenerMetodosPago } from "@/lib/metodoPagoApi";
import { crearOCargarCarrito, agregarProductoCarrito } from "@/lib/carritoApi";
import { crearFactura } from "@/lib/facturaApi";
import { MetodoPago } from "@/types";
import { Truck, Store } from "lucide-react";
import { tieneOfertaActiva, precioConDescuento } from "@/lib/pricing";
import { obtenerDireccionesPorCliente } from "@/lib/direccionApi";
import { Direccion } from "@/types";
import { MapPin, Plus } from "lucide-react";


export default function CheckoutPage() {
    const { items, total, vaciarCarrito } = useCarrito();
    const { cliente, cargando: cargandoAuth } = useAuth();
    const router = useRouter();

    const [direcciones, setDirecciones] = useState<Direccion[]>([]);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState<string | null>(null);


    const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
    const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
    const [entregaDomicilio, setEntregaDomicilio] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!cliente || !entregaDomicilio) return;
        obtenerDireccionesPorCliente(cliente.id_cliente)
        .then((data) => {
        setDirecciones(data);
        if (data.length > 0) setDireccionSeleccionada(data[0].id_direccion);
    })
    .catch((err) => console.error("Error cargando direcciones:", err));
}, [cliente, entregaDomicilio]);

    useEffect(() => {
        obtenerMetodosPago()
            .then((data) => {
            setMetodosPago(data);
            if (data.length > 0) setMetodoSeleccionado(data[0].id_metodo_pago);
            })
            .catch((err) => console.error("Error cargando métodos de pago:", err));
    }, []);

    useEffect(() => {
        if (!cargandoAuth && !cliente) {
            router.push("/login");
        }
    }, [cargandoAuth, cliente, router]);

    const handleConfirmarCompra = async () => {
    if (!cliente || !metodoSeleccionado) return;
    setProcesando(true);
    setError("");

    try {
        const carrito = await crearOCargarCarrito(cliente.id_cliente);

    for (const item of items) {
        await agregarProductoCarrito(carrito.id_carrito, item.producto.id_producto, item.cantidad);
    }
    
    const descuentosPorProducto: Record<string, string> = {};
    items.forEach((item) => {
        if (tieneOfertaActiva(item.producto) && item.producto.descuento) {
        descuentosPorProducto[item.producto.id_producto] = item.producto.descuento.id_descuento;
        }
    });

    const factura = await crearFactura({
        id_carrito: carrito.id_carrito,
        id_metodo_pago: metodoSeleccionado,
        descuentos_por_producto: descuentosPorProducto,
    });

    vaciarCarrito();
    router.push(`/factura/${factura.id_factura}`);
    } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido";
    setError(`No se pudo procesar la compra: ${mensaje}`);
    } finally {
    setProcesando(false);
    }
};

    if (cargandoAuth) return null;

    if (items.length === 0) {
        return (
            <>
            <Navbar />
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-neutral-light">No tienes productos en el carrito.</p>
                <Link href="/productos">
                    <Button variant="primary">Ver Productos</Button>
                </Link>
            </div>
            <Footer />
            </>
        );
    }

    const impuestos = total * 0.15;
    const totalFinal = total + impuestos;

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-10 min-h-screen">
            <h1 className="font-headline text-3xl font-bold text-secondary mb-8">Finalizar Compra</h1>

            <div className="grid grid-cols-3 gap-10">
                <div className="col-span-2 flex flex-col gap-6">
                    <div className="bg-secondary rounded-xl p-6 text-white">
                        <h2 className="font-headline text-lg font-bold mb-4">Tipo de Entrega</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setEntregaDomicilio(true)}
                                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border ${
                                    entregaDomicilio ? "border-primary bg-primary/10" : "border-white/10"
                                }`}
                            >
                                <Truck size={20} />
                                <span className="text-sm font-label">Entrega a domicilio</span>
                            </button>
                            <button
                                onClick={() => setEntregaDomicilio(false)}
                                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border ${
                                    !entregaDomicilio ? "border-primary bg-primary/10" : "border-white/10"
                                }`}
                            >
                                <Store size={20} />
                                <span className="text-sm font-label">Recoger en tienda</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-secondary rounded-xl p-6 text-white">
                        <h2 className="font-headline text-lg font-bold mb-4">Método de Pago</h2>
                        <div className="flex flex-col gap-2">
                            {metodosPago.map((metodo) => (
                                <button
                                    key={metodo.id_metodo_pago}
                                    onClick={() => setMetodoSeleccionado(metodo.id_metodo_pago)}
                                    className={`text-left p-4 rounded-lg border font-label text-sm ${
                                        metodoSeleccionado === metodo.id_metodo_pago
                                        ? "border-primary bg-primary/10"
                                        : "border-white/10"
                                    }`}
                                >
                                    {metodo.nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-secondary rounded-xl p-6 text-white h-fit">
                    <h2 className="font-headline text-xl font-bold mb-4">Resumen del pedido</h2>
                    <div className="flex flex-col gap-2 mb-4 text-sm text-neutral-light">
                        {items.map((item) => (
                            <div key={item.producto.id_producto} className="flex justify-between">
                                <span>{item.producto.nombre} x{item.cantidad}</span>
                                <span>L {(precioConDescuento(item.producto) * item.cantidad).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm text-neutral-light mb-2 border-t border-white/10 pt-4">
                        <span>Subtotal</span>
                        <span>L.{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-light mb-4">
                        <span>Impuestos</span>
                        <span>L.{impuestos.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mb-6">
                        <span>Total</span>
                        <span className="text-primary">L. {totalFinal.toFixed(2)}</span>
                    </div>

                    {error && <p className="text-primary text-sm mb-4">{error}</p>}

                    <Button variant="primary" className="w-full" onClick={handleConfirmarCompra}>
                        {procesando ? "Procesando..." : "Confirmar Compra"}
                    </Button>
                </div>
            </div>
            </section>
            <Footer />
        </>
    );
}