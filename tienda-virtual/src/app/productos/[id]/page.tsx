"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { obtenerProductoPorId } from "@/lib/productosApi";
import { useCarrito } from "@/context/carritocontext";
import { useAuth } from "@/lib/useAuth";
import { formatMoney, formatPresentacion } from "@/lib/format";
import { Producto } from "@/types";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { tieneOfertaActiva, precioConDescuento, porcentajeDescuento } from "@/lib/pricing";


export default function DetalleProductoPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [producto, setProducto] = useState<Producto | null>(null);
    const [cargando, setCargando] = useState(true);
    const [cantidad, setCantidad] = useState(1);
    const [agregado, setAgregado] = useState(false);

    const { agregarProducto } = useCarrito();
    const { cliente } = useAuth();

    useEffect(() => {
        if (!id) return;
        obtenerProductoPorId(id)
            .then(setProducto)
            .catch((err) => console.error("Error cargando producto:", err))
            .finally(() => setCargando(false));
    }, [id]);

    const handleAgregar = () => {
        if (!producto) return;
        if (!cliente) {
            router.push("/login");
            return;
        }
        agregarProducto(producto.id_producto, cantidad);
        setAgregado(true);
        setTimeout(() => setAgregado(false), 2000);
    };

    if (cargando) {
        return (
            <>
            <Navbar />
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-neutral-light">Cargando producto...</p>
            </div>
            <Footer />
            </>
        );
    }

    if (!producto) {
        return (
            <>
            <Navbar />
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-neutral-light">Producto no encontrado.</p>
            </div>
            <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-10">
            <div className="grid grid-cols-2 gap-10">
                <div className="bg-secondary rounded-2xl h-[420px]" />

                <div>
                    <span className="inline-block bg-tertiary/20 text-tertiary text-xs font-label px-3 py-1 rounded-full mb-3">
                        {producto.estado ? "DISPONIBLE" : "AGOTADO"}
                    </span>
                    <h1 className="font-headline text-3xl font-bold text-secondary mb-2">
                        {producto.nombre}
                    </h1>
                    <p className="text-neutral-light mb-6">{producto.descripcion}</p>

                    <div className="mb-6">
                        {tieneOfertaActiva(producto) && (
                        <div className="flex items-center gap-3 mb-2">
                            <span className="inline-block bg-tertiary/20 text-tertiary text-xs font-label px-3 py-1 rounded-full">
                                {porcentajeDescuento(producto)}% de descuento
                            </span>
                        </div>
                        )}

                        <div className="flex items-baseline gap-3">
                            {tieneOfertaActiva(producto) && (
                            <span className="text-neutral-light line-through text-lg">
                                {formatMoney(producto.precio)}
                            </span>
                            )}
                            <p className="font-headline text-3xl font-bold text-primary">
                                {formatMoney(precioConDescuento(producto))}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center bg-secondary rounded-lg text-white">
                            <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="p-3">
                                <Minus size={16} />
                            </button>
                            <span className="px-3 font-label">{cantidad}</span>
                            <button
                                onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                                className="p-3"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <span className="text-sm text-neutral-light">{producto.stock} disponibles</span>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleAgregar}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={18} />
                        {agregado ? "¡Agregado!" : "Agregar al Carrito"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="bg-secondary rounded-xl p-6 text-white">
                    <h3 className="font-headline font-bold mb-2">Envío Rápido</h3>
                    <p className="text-sm text-neutral-light">Recibe tu pedido en la puerta de tu casa.</p>
                </div>
                <div className="bg-secondary rounded-xl p-6 text-white">
                    <h3 className="font-headline font-bold mb-2">Calidad Verificada</h3>
                    <p className="text-sm text-neutral-light">Producto testeado y de alta pureza.</p>
                </div>
                <div className="bg-secondary rounded-xl p-6 text-white">
                    <h3 className="font-headline font-bold mb-2">Tamaño</h3>
                    <p className="text-sm text-neutral-light">{formatPresentacion(producto.cantidad, producto.u_medida)}</p>
                </div>
            </div>
            </section>
            <Footer />
        </>
    );
}