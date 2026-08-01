// src/app/productos/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { obtenerProductoPorId } from "@/lib/productosApi";
import { useCarrito } from "@/context/carritocontext";
import { Producto } from "@/types";
import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function DetalleProductoPage() {
    const params = useParams();
    const id = Number(params.id);

    const [producto, setProducto] = useState<Producto | null>(null);
    const [cargando, setCargando] = useState(true);
    const [cantidad, setCantidad] = useState(1);
    const [agregado, setAgregado] = useState(false);

    const { agregarProducto } = useCarrito();

    useEffect(() => {
        if (!id) return;
        obtenerProductoPorId(id)
            .then(setProducto)
            .catch((err) => console.error("Error cargando producto:", err))
            .finally(() => setCargando(false));
    }, [id]);

    const handleAgregar = () => {
        if (!producto) return;
        agregarProducto(producto, cantidad);
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

                <p className="font-headline text-3xl font-bold text-primary mb-6">
                    ${producto.precio.toFixed(2)}
                </p>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center bg-secondary rounded-lg text-white">
                        <button
                            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                            className="p-3"
                        >
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
                    <span className="text-sm text-neutral-light">
                        {producto.stock} disponibles
                    </span>
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
                <p className="text-sm text-neutral-light">
                    Recibe tu pedido en la puerta de tu casa.
                </p>
                </div>
                <div className="bg-secondary rounded-xl p-6 text-white">
                <h3 className="font-headline font-bold mb-2">Calidad Verificada</h3>
                <p className="text-sm text-neutral-light">
                    Producto testeado y de alta pureza.
                </p>
                </div>
                <div className="bg-secondary rounded-xl p-6 text-white">
                <h3 className="font-headline font-bold mb-2">Unidad de medida</h3>
                <p className="text-sm text-neutral-light">{producto.u_medida}</p>
                </div>
            </div>
            </section>
            <Footer />
        </>
    );
}