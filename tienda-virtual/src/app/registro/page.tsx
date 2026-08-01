// src/app/registro/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { registrarCliente } from "@/lib/authApi";

export default function RegistroPage() {
    const router = useRouter();

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (contrasena.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setEnviando(true);
        try {
            const cliente = await registrarCliente({
            nombre,
            p_apellido: apellido,
            correo,
            contrasena,
            });

            localStorage.setItem("cliente", JSON.stringify(cliente));
            router.push("/");
        } catch (err) {
            setError("No se pudo crear la cuenta. Verifica tus datos o intenta con otro correo.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
            <div className="bg-neutral text-white rounded-2xl p-10 w-full max-w-md">
            <h1 className="font-headline text-3xl font-bold mb-2">Únete a la Élite</h1>
            <p className="text-neutral-light mb-8">Rendimiento sofisticado al alcance de tu mano.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-label block mb-1">Nombre</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Alex"
                        className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-label block mb-1">Apellido</label>
                    <input
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Ej. Rivera"
                        className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-label block mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-label block mb-1">Contraseña</label>
                    <input
                        type="password"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
                        required
                    />
                </div>

                {error && <p className="text-primary text-sm">{error}</p>}

                <Button type="submit" variant="primary" className="w-full">
                    {enviando ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
            </form>

            <p className="text-center text-sm text-neutral-light mt-6">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                    Inicia sesión
                </Link>
            </p>
            </div>
        </div>
    );
}