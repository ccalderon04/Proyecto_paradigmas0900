"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { useAuth } from "@/lib/useAuth";
import { obtenerTarjetasPorCliente, crearTarjeta, eliminarTarjeta } from "@/lib/tarjetaApi";
import { Tarjeta } from "@/types";
import { CreditCard, Trash2, Plus } from "lucide-react";

export default function MisTarjetasPage() {
    const { cliente, cargando: cargandoAuth } = useAuth();
    const router = useRouter();

    const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const [titular, setTitular] = useState("");
    const [numero, setNumero] = useState("");
    const [marca, setMarca] = useState("Visa");
    const [expiracion, setExpiracion] = useState("");

    useEffect(() => {
        if (!cargandoAuth && !cliente) router.push("/login");
    }, [cargandoAuth, cliente, router]);

    useEffect(() => {
        if (!cliente) return;
        obtenerTarjetasPorCliente(cliente.id_cliente)
            .then(setTarjetas)
            .catch(() => setError("No se pudieron cargar tus tarjetas."))
            .finally(() => setCargando(false));
    }, [cliente]);

    const handleAgregar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cliente) return;

        const numeroLimpio = numero.replace(/\s/g, "");
        if (numeroLimpio.length < 4) {
            setError("Ingresa un número de tarjeta válido.");
            return;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(expiracion)) {
            setError("La fecha de expiración debe tener el formato MM/AAAA.");
            return;
        }

        setGuardando(true);
        setError("");
        try {
            const ultimosDigitos = numeroLimpio.slice(-4);
            const nueva = await crearTarjeta({
            id_cliente: cliente.id_cliente,
            titular,
            ultimos_digitos: ultimosDigitos,
            marca,
            fecha_expiracion: expiracion,
            });
            setTarjetas((prev) => [...prev, nueva]);
            setMostrarForm(false);
            setTitular("");
            setNumero("");
            setExpiracion("");
        } catch {
            setError("No se pudo guardar la tarjeta.");
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id: string) => {
        try {
            await eliminarTarjeta(id);
            setTarjetas((prev) => prev.filter((t) => t.id_tarjeta !== id));
        } catch {
            setError("No se pudo eliminar la tarjeta.");
        }
    };

    if (cargandoAuth || !cliente) return null;

    return (
        <>
            <Navbar />
            <section className="bg-white px-8 py-12 min-h-screen max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold text-secondary mb-1">Métodos de Pago</h1>
                    <p className="text-neutral-light">Tarjetas guardadas para pagos rápidos.</p>
                </div>
                {!mostrarForm && (
                    <Button variant="primary" onClick={() => setMostrarForm(true)}>
                        <span className="flex items-center gap-2"><Plus size={16} /> Agregar</span>
                    </Button>
                )}
            </div>

            {error && <p className="text-primary mb-4">{error}</p>}
            {cargando && <p className="text-neutral-light">Cargando...</p>}

            {mostrarForm && (
                <form onSubmit={handleAgregar} className="bg-secondary text-white rounded-xl p-6 mb-6 space-y-4">
                    <div>
                        <label className="text-sm font-label block mb-1">Nombre del titular</label>
                        <input
                            type="text"
                            value={titular}
                            onChange={(e) => setTitular(e.target.value)}
                            placeholder="Como aparece en la tarjeta"
                            className="w-full bg-neutral rounded-lg px-4 py-3 outline-none placeholder:text-neutral-light"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-label block mb-1">Número de tarjeta</label>
                        <input
                            type="text"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full bg-neutral rounded-lg px-4 py-3 outline-none placeholder:text-neutral-light"
                            required
                        />
                        <p className="text-xs text-neutral-light mt-1">
                            Solo guardamos los últimos 4 dígitos, nunca el número completo.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-label block mb-1">Marca</label>
                            <select
                                value={marca}
                                onChange={(e) => setMarca(e.target.value)}
                                className="w-full bg-neutral rounded-lg px-4 py-3 outline-none"
                            >
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="Amex">Amex</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-label block mb-1">Expiración (MM/AAAA)</label>
                            <input
                                type="text"
                                value={expiracion}
                                onChange={(e) => setExpiracion(e.target.value)}
                                placeholder="12/2028"
                                className="w-full bg-neutral rounded-lg px-4 py-3 outline-none placeholder:text-neutral-light"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit" variant="primary">
                            {guardando ? "Guardando..." : "Guardar Tarjeta"}
                        </Button>
                        <Button type="button" variant="outlined" onClick={() => setMostrarForm(false)}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-3">
                {tarjetas.map((t) => (
                    <div key={t.id_tarjeta} className="flex items-center justify-between bg-secondary text-white rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <CreditCard size={20} className="text-primary" />
                            <div>
                                <p className="font-label text-sm">{t.marca} •••• {t.ultimos_digitos}</p>
                                <p className="text-neutral-light text-sm">{t.titular} · Exp. {t.fecha_expiracion}</p>
                            </div>
                        </div>
                        <button onClick={() => handleEliminar(t.id_tarjeta)} className="text-primary">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {!cargando && tarjetas.length === 0 && !mostrarForm && (
                <p className="text-neutral-light text-center py-8">No tienes tarjetas guardadas.</p>
            )}
            </section>
            <Footer />
        </>
    );
}