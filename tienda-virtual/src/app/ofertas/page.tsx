"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { obtenerProductos } from "@/lib/productosApi";
import { useCarrito } from "@/context/carritocontext";
import { useAuth } from "@/lib/useAuth";
import { formatMoney } from "@/lib/format";
import { tieneOfertaActiva, precioConDescuento, porcentajeDescuento } from "@/lib/pricing";
import { Producto } from "@/types";
import { ShoppingCart } from "lucide-react";

export default function OfertasPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);
    const { agregarProducto } = useCarrito();
    const { cliente } = useAuth();
    const router = useRouter();

    useEffect(() => {
        obtenerProductos()
            .then((data) => setProductos(data.filter(tieneOfertaActiva)))
            .catch((err) => console.error("Error cargando ofertas:", err))
            .finally(() => setCargando(false));
    }, []);

    const handleAgregar = (producto: Producto) => {
        if (!cliente) {
            router.push("/login");
            return;
        }
        agregarProducto(producto.id_producto);
    };

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-12 min-h-screen">
            <h1 className="font-headline text-3xl font-bold text-secondary mb-1">Ofertas</h1>
            <p className="text-neutral-light mb-8">
                Aprovecha nuestros mejores precios en productos seleccionados.
            </p>

            {cargando && <p className="text-neutral-light">Cargando ofertas...</p>}
            {!cargando && productos.length === 0 && (
                <p className="text-neutral-light">No hay ofertas disponibles en este momento.</p>
            )}

            <div className="grid grid-cols-4 gap-6">
                {productos.map((producto) => (
                    <div key={producto.id_producto} className="bg-secondary rounded-xl overflow-hidden text-white relative">
                        <Link href={`/productos/${producto.id_producto}`}>
                            <div className="h-40 bg-neutral relative">
                                <span className="absolute top-2 left-2 bg-tertiary text-white text-xs font-label px-2 py-1 rounded-full">
                                    {porcentajeDescuento(producto)}% de descuento
                                </span>
                            </div>
                            <div className="p-4 pb-0">
                                <h3 className="font-headline font-bold">{producto.nombre}</h3>
                                <p className="text-neutral-light text-sm mt-1 line-clamp-2">
                                    {producto.descripcion}
                                </p>
                            </div>
                        </Link>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex flex-col">
                                <span className="text-neutral-light text-xs line-through">
                                    {formatMoney(producto.precio)}
                                </span>
                                <span className="font-bold text-primary">
                                    {formatMoney(precioConDescuento(producto))}
                                </span>
                            </div>
                            <button
                                onClick={() => handleAgregar(producto)}
                                className="bg-primary p-2 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <ShoppingCart size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            </section>
            <Footer />
        </>
    );
}