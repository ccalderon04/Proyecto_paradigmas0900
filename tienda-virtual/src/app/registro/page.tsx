"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { registrarCliente } from "@/lib/authApi";
import { ArrowLeft } from "lucide-react";
import { Sesion } from "@/models/Sesion";

export default function RegistroPage() {
    const router = useRouter();

    const [pNombre, setPNombre] = useState("");
    const [sNombre, setSNombre] = useState("");
    const [pApellido, setPApellido] = useState("");
    const [sApellido, setSApellido] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [genero, setGenero] = useState<"M" | "F" | "Otro" | "">("");
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
                s_nombre: sNombre || undefined,
                p_apellido: pApellido,
                s_apellido: sApellido || undefined,
                fecha_nacimiento: fechaNacimiento || undefined,
                correo,
                telefono: telefono || undefined,
                genero: genero || undefined,
                nombre_usuario: nombreUsuario,
                contrasena,
            });

            Sesion.iniciar(cliente);
            router.push("/");
        } catch (err) {
            setError("No se pudo crear la cuenta. El usuario o correo ya podrían estar registrados.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
            <div className="bg-neutral text-white rounded-2xl p-10 w-full max-w-2xl relative">
            <button
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 flex items-center gap-1 text-neutral-light hover:text-white text-sm transition-colors"
            >
                <ArrowLeft size={16} />
                Volver atrás
            </button>
            <div className="mt-8">
            <h1 className="font-headline text-3xl font-bold mb-2">Únete a la Élite</h1>

            <p className="text-neutral-light mb-8">Rendimiento sofisticado al alcance de tu mano.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                        <label className="text-sm font-label block mb-1">Segundo nombre (opcional)</label>
                        <input
                            type="text"
                            value={sNombre}
                            onChange={(e) => setSNombre(e.target.value)}
                            placeholder="Ej. Andrés"
                            className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
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
                        <label className="text-sm font-label block mb-1">Segundo apellido (opcional)</label>
                        <input
                            type="text"
                            value={sApellido}
                            onChange={(e) => setSApellido(e.target.value)}
                            placeholder="Ej. Gómez"
                            className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-label block mb-1">Fecha de nacimiento (opcional)</label>
                        <input
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-label block mb-1">Género (opcional)</label>
                        <select
                            value={genero}
                            onChange={(e) => setGenero(e.target.value as "M" | "F" | "Otro" | "")}
                            className="w-full bg-secondary rounded-lg px-4 py-3 text-white outline-none"
                        >
                            <option value="">Prefiero no decir</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div className="col-span-2">
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

                    <div className="col-span-2">
                        <label className="text-sm font-label block mb-1">Teléfono (opcional)</label>
                        <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Ej. +52 55 1234 5678"
                            className="w-full bg-secondary rounded-lg px-4 py-3 text-white placeholder:text-neutral-light outline-none"
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