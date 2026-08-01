// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { loginUsuario, obtenerClientePorUsuario } from "@/lib/authApi";

export default function LoginPage() {
    const router = useRouter();
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setEnviando(true);

        try {
            const usuario = await loginUsuario({ nombre: nombreUsuario, contrasena });
            const cliente = await obtenerClientePorUsuario(usuario.id_usuario);

            if (!cliente) {
            setError("Este usuario no tiene un perfil de cliente asociado.");
            return;
            }

            localStorage.setItem("cliente", JSON.stringify(cliente));
            router.push("/");
        } catch (err) {
            setError("Usuario o contraseña incorrectos");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="bg-neutral text-white rounded-2xl p-10 w-full max-w-md">
            <h1 className="font-headline text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
            <p className="text-neutral-light mb-8">Inicia sesión para continuar.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-label block mb-1">Nombre de usuario</label>
                    <input
                        type="text"
                        value={nombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                        placeholder="tu_usuario"
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
                    {enviando ? "Ingresando..." : "Iniciar Sesión"}
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