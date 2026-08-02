"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { useCarrito } from "@/context/carritocontext";
import { formatMoney } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CarritoPage() {
    const { items, actualizarCantidad, quitarProducto, total } = useCarrito();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <>
            <Navbar />
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-neutral-light">Tu carrito está vacío.</p>
                <Link href="/productos">
                <Button variant="primary">Ver Productos</Button>
                </Link>
            </div>
            <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-10 min-h-screen">
            <h1 className="font-headline text-3xl font-bold text-secondary mb-8">Tu Carrito</h1>

            <div className="grid grid-cols-3 gap-10">
                <div className="col-span-2 flex flex-col gap-4">
                {items.map((item) => (
                    <div
                        key={item.producto.id_producto}
                        className="flex items-center gap-4 bg-secondary rounded-xl p-4 text-white"
                    >
                        <div className="w-20 h-20 bg-neutral rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-headline font-bold">{item.producto.nombre}</h3>
                            <p className="text-primary font-bold">${formatMoney(item.producto.precio)}</p>
                        </div>
                        <div className="flex items-center bg-neutral rounded-lg">
                            <button
                                onClick={() => actualizarCantidad(item.producto.id_producto, item.cantidad - 1)}
                                className="p-2"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="px-3 font-label text-sm">{item.cantidad}</span>
                            <button
                                onClick={() => actualizarCantidad(item.producto.id_producto, item.cantidad + 1)}
                                className="p-2"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <button
                            onClick={() => quitarProducto(item.producto.id_producto)}
                            className="text-primary p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                </div>

                <div className="bg-secondary rounded-xl p-6 text-white h-fit">
                <h2 className="font-headline text-xl font-bold mb-4">Resumen</h2>
                <div className="flex justify-between text-sm text-neutral-light mb-2">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-light mb-4">
                    <span>Impuestos (15%)</span>
                    <span>${(total * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-4 mb-6">
                    <span>Total</span>
                    <span className="text-primary">L. {(total * 1.15).toFixed(2)}</span>
                </div>
                <Button variant="primary" className="w-full" onClick={() => router.push("/checkout")}>
                    Proceder al Pago
                </Button>
                </div>
            </div>
            </section>
            <Footer />
        </>
    );
}