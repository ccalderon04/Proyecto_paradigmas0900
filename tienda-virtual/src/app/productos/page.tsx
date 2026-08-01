"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { obtenerProductos, obtenerProductosPorCategoria } from "@/lib/productosApi";
import { obtenerCategorias } from "@/lib/categoriasApi";
import { useCarrito } from "@/context/carritocontext";
import { Producto, Categoria } from "@/types";
import { ShoppingCart } from "lucide-react";

export default function ProductosPage() {
    const searchParams = useSearchParams();
    const categoriaInicial = searchParams.get("categoria");

    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaActiva, setCategoriaActiva] = useState<number | null>(
        categoriaInicial ? Number(categoriaInicial) : null
    );
    const [cargando, setCargando] = useState(true);
    const { agregarProducto } = useCarrito();

    useEffect(() => {
        obtenerCategorias()
            .then(setCategorias)
            .catch((err) => console.error("Error cargando categorías:", err));
    }, []);

    useEffect(() => {
        setCargando(true);
        const promesa =
            categoriaActiva === null
            ? obtenerProductos()
            : obtenerProductosPorCategoria(categoriaActiva);

        promesa
            .then(setProductos)
            .catch((err) => console.error("Error cargando productos:", err))
            .finally(() => setCargando(false));
    }, [categoriaActiva]);

    const nombreCategoriaActiva = categoriaActiva
        ? categorias.find((c) => c.id_categoria === categoriaActiva)?.nombre
        : "Todos los Productos";

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-12 min-h-screen grid grid-cols-[220px_1fr] gap-10">
            <aside>
                <h2 className="font-headline font-bold text-secondary mb-1">Categorías</h2>
                <p className="text-neutral-light text-sm mb-4">Explora nuestra selección</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setCategoriaActiva(null)}
                        className={`text-left px-4 py-3 rounded-lg font-label text-sm transition-colors ${
                            categoriaActiva === null
                                ? "bg-secondary text-white"
                                : "bg-white text-secondary hover:bg-secondary/5 border border-secondary/10"
                        }`}
                    >
                        Todas
                    </button>
                    {categorias.map((categoria) => (
                        <button
                            key={categoria.id_categoria}
                            onClick={() => setCategoriaActiva(categoria.id_categoria)}
                            className={`text-left px-4 py-3 rounded-lg font-label text-sm transition-colors ${
                                categoriaActiva === categoria.id_categoria
                                    ? "bg-secondary text-white"
                                    : "bg-white text-secondary hover:bg-secondary/5 border border-secondary/10"
                            }`}
                        >
                            {categoria.nombre}
                        </button>
                    ))}
                </div>
            </aside>

            <div>
                <h1 className="font-headline text-3xl font-bold text-secondary mb-1">
                    {nombreCategoriaActiva}
                </h1>
                <p className="text-neutral-light mb-8">
                    Potencia tus entrenamientos con la mejor calidad.
                </p>

                {cargando && <p className="text-neutral-light">Cargando productos...</p>}

                {!cargando && productos.length === 0 && (
                    <p className="text-neutral-light">No hay productos en esta categoría.</p>
                )}

                <div className="grid grid-cols-3 gap-6">
                    {productos.map((producto) => (
                        <div key={producto.id_producto} className="bg-secondary rounded-xl overflow-hidden text-white">
                            <Link href={`/productos/${producto.id_producto}`}>
                                <div className="h-40 bg-neutral" />
                                <div className="p-4 pb-0">
                                    <h3 className="font-headline font-bold">{producto.nombre}</h3>
                                    <p className="text-neutral-light text-sm mt-1 line-clamp-2">
                                        {producto.descripcion}
                                    </p>
                                </div>
                            </Link>
                            <div className="flex items-center justify-between p-4">
                                <span className="font-bold text-primary">${producto.precio.toFixed(2)}</span>
                                <button
                                    onClick={() => agregarProducto(producto)}
                                    className="bg-primary p-2 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <ShoppingCart size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </section>
            <Footer />
        </>
    );
}