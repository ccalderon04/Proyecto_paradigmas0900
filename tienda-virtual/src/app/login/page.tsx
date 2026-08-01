"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

export default function LoginPage() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasena }),
            });

            if (!res.ok) throw new Error("Credenciales inválidas");

            const data = await res.json();
            localStorage.setItem("cliente", JSON.stringify(data));
            window.location.href = "/";
        } catch (err) {
            setError("Correo o contraseña incorrectos");
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="bg-neutral text-white rounded-2xl p-10 w-full max-w-md">
            <h1 className="font-headline text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
            <p className="text-neutral-light mb-8">Inicia sesión para continuar.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Iniciar Sesión
                </Button>
            </form>

            <p className="text-center text-sm text-neutral-light mt-6">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="text-primary hover:underline">
                    Regístrate
                </Link>
            </p>
            </div>
        </div>
    );
}