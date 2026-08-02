"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { registrarCliente } from "@/lib/authApi";
import { ArrowLeft } from "lucide-react";

export default function RegistroPage() {
    const router = useRouter();

    const [pNombre, setPNombre] = useState("");
    const [pApellido, setPApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [nombreUsuario, setNombreUsuario] = useState("");
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
            p_nombre: pNombre,
            p_apellido: pApellido,
            correo,
            nombre_usuario: nombreUsuario,
            contrasena,
            });

            localStorage.setItem("cliente", JSON.stringify(cliente));
            router.push("/");
        } catch (err) {
            setError("No se pudo crear la cuenta. El usuario o correo ya podrían estar registrados.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
            <div className="bg-neutral text-white rounded-2xl p-10 w-full max-w-md relative">
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 flex items-center gap-1 text-neutral-light hover:text-white text-sm transition-colors"
            >
                <ArrowLeft size={16} />
                Volver atrás
            </button>
            <div className="mt-8">  
            <h1 className="font-headline text-3xl font-bold mb-2">Únete a la Élite</h1>
            
            <p className="text-neutral-light mb-8">Rendimiento sofisticado al alcance de tu mano.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-label block mb-1">Nombre</label>
                    <input
                        type="text"
                        value={pNombre}
                        onChange={(e) => setPNombre(e.target.value)}
                        placeholder="Ej. Alex"
                        className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-label block mb-1">Apellido</label>
                    <input
                        type="text"
                        value={pApellido}
                        onChange={(e) => setPApellido(e.target.value)}
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
        </div>
    );
}