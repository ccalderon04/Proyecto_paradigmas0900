"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { obtenerFacturaPorId } from "@/lib/facturaApi";
import { formatMoney } from "@/lib/format";
import { Factura } from "@/types";
import { CheckCircle2 } from "lucide-react";

export default function FacturaPage() {
    const params = useParams();
    const id = params.id as string;

    const [factura, setFactura] = useState<Factura | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!id) return;
        obtenerFacturaPorId(id)
            .then(setFactura)
            .catch((err) => console.error("Error cargando factura:", err))
            .finally(() => setCargando(false));
    }, [id]);

    if (cargando) {
        return (
            <>
            <Navbar />
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-neutral-light">Cargando factura...</p>
            </div>
            <Footer />
            </>
        );
    }

    if (!factura) {
        return (
            <>
            <Navbar />
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-neutral-light">No se encontró la factura.</p>
            </div>
            <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-12 min-h-screen flex justify-center">
            <div className="bg-secondary text-white rounded-2xl p-8 max-w-lg w-full">
                <div className="flex flex-col items-center text-center mb-6">
                    <CheckCircle2 className="text-tertiary mb-3" size={48} />
                    <h1 className="font-headline text-2xl font-bold">¡Compra Exitosa!</h1>
                    <p className="text-neutral-light text-sm mt-1">Factura #{factura.id_factura}</p>
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between text-neutral-light">
                        <span>Fecha</span>
                        <span>{new Date(factura.fecha).toLocaleDateString("es-HN")}</span>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex flex-col gap-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Productos</span>
                            <span>Precio</span>
                        </div>
                        {factura.detalles.map((detalle) => (
        <div key={detalle.id_detalle} className="flex justify-between text-neutral-light">
            <span>
                {detalle.cantidad}x {detalle.producto.nombre}
            </span>
            <span>{formatMoney(detalle.total)}</span>
        </div>
    ))}

    <div className="border-t border-white/10 pt-4 flex flex-col gap-2 mt-2">
        <div className="flex justify-between text-neutral-light">
            <span>Subtotal</span>
            <span>{formatMoney(factura.subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-light">
            <span>Impuestos</span>
            <span>{formatMoney(factura.impuestos)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-3 mt-2">
            <span>Total</span>
            <span className="text-primary">{formatMoney(factura.total)}</span>
        </div>
    </div>
</div>
                </div>

                <Link href="/productos">
                    <Button variant="primary" className="w-full mt-8">
                        Seguir Comprando
                    </Button>
                </Link>
            </div>
            </section>
            <Footer />
        </>
    );
}