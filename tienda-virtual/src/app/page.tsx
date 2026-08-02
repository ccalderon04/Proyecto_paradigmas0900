"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { obtenerProductos } from "@/lib/productosApi";
import { obtenerCategorias } from "@/lib/categoriasApi";
import { useCarrito } from "@/context/carritocontext";
import { useAuth } from "@/lib/useAuth";
import { Producto, Categoria } from "@/types";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { tieneOfertaActiva, precioConDescuento, porcentajeDescuento } from "@/lib/pricing";
import { Sesion } from "@/models/Sesion";

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const { agregarProducto } = useCarrito();
  const { cliente } = useAuth();
  const router = useRouter();

  useEffect(() => {
    obtenerProductos()
      .then((data) => {
        const ordenados = [...data].sort(
          (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
        );
        setProductos(ordenados.slice(0, 4));
      })
      .catch((err) => console.error("Error cargando productos:", err));

    obtenerCategorias()
      .then((data) => setCategorias(data.slice(0, 3)))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  const handleAgregar = (producto: Producto) => {
    const sesionActual = Sesion.obtenerCliente();

    if (!sesionActual) {
      router.push("/login");
      return;
    }
    
    agregarProducto(producto.id_producto);
  };

  const [categoriaGrande, ...categoriasChicas] = categorias;

  return (
    <>
      <Navbar />

      <section className="bg-neutral text-white px-8 py-16">
        <div className="max-w-lg">
          <span className="inline-block bg-tertiary/20 text-tertiary text-xs font-label px-3 py-1 rounded-full mb-4">
            OFERTA ESPECIAL
          </span>
          <h1 className="font-headline text-4xl font-bold mb-4">
            Potencia tu Rendimiento
          </h1>
          <p className="text-neutral-light mb-6">
            Alcanza tus metas con nuestra linea de suplementos de alta calidad.
            Formulación avanzada para resultados reales.
          </p>
          <Link href="/ofertas">
            <Button variant="primary">Ver Productos</Button>
          </Link>
        </div>
      </section>

      <section className="bg-white px-8 py-16">
        <h2 className="font-headline text-2xl font-bold text-secondary mb-8">
          Artículos Recomendados
        </h2>
        <div className="grid grid-cols-4 gap-6 mb-16">
          {productos.map((producto) => (
            <div key={producto.id_producto} className="bg-secondary rounded-xl overflow-hidden text-white">
              <Link href={`/productos/${producto.id_producto}`}>
                <div className="h-40 bg-neutral relative">
                  {tieneOfertaActiva(producto) && (
                    <span className="absolute top-2 left-2 bg-tertiary text-white text-xs font-label px-2 py-1 rounded-full">
                      {porcentajeDescuento(producto)}% de descuento
                    </span>
                  )}
                </div>
                <div className="p-4 pb-0">
                  <h3 className="font-headline font-bold">{producto.nombre}</h3>
                  <p className="text-neutral-light text-sm mt-1 line-clamp-2">
                    {producto.descripcion}
                  </p>
                </div>
              </Link>
              <div className="flex items-center justify-between p-4">
                {tieneOfertaActiva(producto) ? (
                  <div className="flex flex-col">
                    <span className="text-neutral-light text-xs line-through">
                      {formatMoney(producto.precio)}
                    </span>
                    <span className="font-bold text-primary">
                      {formatMoney(precioConDescuento(producto))}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-primary">{formatMoney(producto.precio)}</span>
                )}
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

        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl font-bold text-secondary">
            Explora Categorías
          </h2>
          <Link
            href="/productos"
            className="flex items-center gap-1 text-primary font-label text-sm hover:underline"
          >
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {categoriaGrande && (
            <Link
              href={`/productos?categoria=${categoriaGrande.id_categoria}`}
              className="col-span-2 bg-secondary rounded-xl h-64 flex items-end p-6 hover:opacity-90 transition-opacity"
            >
              <p className="text-white font-headline text-xl">{categoriaGrande.nombre}</p>
            </Link>
          )}
          <div className="flex flex-col gap-4">
            {categoriasChicas.map((categoria) => (
              <Link
                key={categoria.id_categoria}
                href={`/productos?categoria=${categoria.id_categoria}`}
                className="bg-secondary rounded-xl h-28 flex items-end p-4 hover:opacity-90 transition-opacity"
              >
                <p className="text-white font-label text-sm">{categoria.nombre}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}