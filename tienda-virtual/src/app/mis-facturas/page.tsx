"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { useAuth } from "@/lib/useAuth";
import { obtenerFacturasPorCliente } from "@/lib/facturaApi";
import { formatMoney } from "@/lib/format";
import { Factura } from "@/types";
import { FileText, ChevronRight } from "lucide-react";

export default function MisFacturasPage() {
    const { cliente, cargando: cargandoAuth } = useAuth();
    const router = useRouter();

    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!cargandoAuth && !cliente) {
            router.push("/login");
        }
    }, [cargandoAuth, cliente, router]);

    useEffect(() => {
        if (!cliente) return;

        obtenerFacturasPorCliente(cliente.id_cliente)
            .then((data) => {
            // Más recientes primero
            const ordenadas = [...data].sort(
                (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            setFacturas(ordenadas);
            })
            .catch(() => setError("No se pudieron cargar tus facturas."))
            .finally(() => setCargando(false));
    }, [cliente]);

    if (cargandoAuth || !cliente) return null;

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-12 min-h-screen max-w-3xl mx-auto">
            <h1 className="font-headline text-3xl font-bold text-secondary mb-1">
                Mis Facturas
            </h1>
            <p className="text-neutral-light mb-8">
                Historial de tus compras.
            </p>

            {cargando && <p className="text-neutral-light">Cargando facturas...</p>}

            {error && <p className="text-primary">{error}</p>}

            {!cargando && facturas.length === 0 && !error && (
                <div className="flex flex-col items-center gap-4 py-16">
                    <FileText size={40} className="text-neutral-light" />
                    <p className="text-neutral-light">Aún no tienes compras registradas.</p>
                    <Link href="/productos">
                        <Button variant="primary">Ir a la Tienda</Button>
                    </Link>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {facturas.map((factura) => (
                    <Link
                        key={factura.id_factura}
                        href={`/factura/${factura.id_factura}`}
                        className="flex items-center justify-between bg-secondary text-white rounded-xl p-5 hover:bg-secondary/90 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-neutral rounded-lg p-3">
                                <FileText size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-headline font-bold">
                                    Factura #{factura.id_factura.slice(0, 8)}
                                </p>
                                <p className="text-neutral-light text-sm">
                                    {new Date(factura.fecha).toLocaleDateString("es-HN", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-primary">{formatMoney(factura.total)}</span>
                            <ChevronRight size={18} className="text-neutral-light" />
                        </div>
                    </Link>
                ))}
            </div>
            </section>
            <Footer />
        </>
    );
}