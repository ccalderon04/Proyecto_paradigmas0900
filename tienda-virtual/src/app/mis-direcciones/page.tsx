"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { useAuth } from "@/lib/useAuth";
import { obtenerDireccionesPorCliente, crearDireccion, eliminarDireccion } from "@/lib/direccionApi";
import { obtenerDepartamentos, obtenerCiudades, obtenerOCrearCiudad } from "@/lib/ubicacionApi";
import { Direccion, Departamento, Ciudad } from "@/types";
import { MapPin, Trash2, Plus } from "lucide-react";

export default function MisDireccionesPage() {
  const { cliente, cargando: cargandoAuth } = useAuth();
  const router = useRouter();

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [idDepartamento, setIdDepartamento] = useState("");
  const [ciudadTexto, setCiudadTexto] = useState("");
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");

  useEffect(() => {
    if (!cargandoAuth && !cliente) router.push("/login");
  }, [cargandoAuth, cliente, router]);

  useEffect(() => {
    if (!cliente) return;
    Promise.all([
      obtenerDireccionesPorCliente(cliente.id_cliente),
      obtenerDepartamentos(),
      obtenerCiudades(),
    ])
      .then(([dirs, deps, cius]) => {
        setDirecciones(dirs);
        setDepartamentos(deps);
        setCiudades(cius);
      })
      .catch(() => setError("No se pudieron cargar tus direcciones."))
      .finally(() => setCargando(false));
  }, [cliente]);

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !idDepartamento || !ciudadTexto.trim()) return;
    setGuardando(true);
    setError("");
    try {
      const idCiudad = await obtenerOCrearCiudad(ciudadTexto);
      const nueva = await crearDireccion({
        id_cliente: cliente.id_cliente,
        id_departamento: idDepartamento,
        id_ciudad: idCiudad,
        calle,
        colonia,
      });
      setDirecciones((prev) => [...prev, nueva]);
      const ciudadesActualizadas = await obtenerCiudades();
      setCiudades(ciudadesActualizadas);
      setMostrarForm(false);
      setCalle("");
      setColonia("");
      setIdDepartamento("");
      setCiudadTexto("");
    } catch {
      setError("No se pudo guardar la dirección.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await eliminarDireccion(id);
      setDirecciones((prev) => prev.filter((d) => d.id_direccion !== id));
    } catch {
      setError("No se pudo eliminar la dirección.");
    }
  };

  const nombreDepartamento = (id: string) => departamentos.find((d) => d.id_departamento === id)?.nombre ?? "";
  const nombreCiudad = (id: string) => ciudades.find((c) => c.id_ciudad === id)?.nombre ?? "";

  if (cargandoAuth || !cliente) return null;

  return (
    <>
      <Navbar />
      <section className="bg-white px-8 py-12 min-h-screen max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold text-secondary mb-1">Mis Direcciones</h1>
            <p className="text-neutral-light">Direcciones guardadas para tus entregas.</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-label block mb-1">Departamento</label>
                <select
                  value={idDepartamento}
                  onChange={(e) => setIdDepartamento(e.target.value)}
                  className="w-full bg-neutral rounded-lg px-4 py-3 outline-none"
                  required
                >
                  <option value="">Selecciona...</option>
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-label block mb-1">Ciudad</label>
                <input
                  type="text"
                  value={ciudadTexto}
                  onChange={(e) => setCiudadTexto(e.target.value)}
                  placeholder="Ej. Tegucigalpa"
                  className="w-full bg-neutral rounded-lg px-4 py-3 outline-none placeholder:text-neutral-light"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-label block mb-1">Calle</label>
              <input
                type="text"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                placeholder="Calle Principal #123"
                className="w-full bg-neutral rounded-lg px-4 py-3 outline-none placeholder:text-neutral-light"
                required
              />
            </div>
            <div>
              <label className="text-sm font-label block mb-1">Colonia</label>
              <input
                type="text"
                value={colonia}
                onChange={(e) => setColonia(e.target.value)}
                placeholder="Col. Kennedy"
                className="w-full bg-neutral rounded-lg px-4 py-3 outline-none placeholder:text-neutral-light"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary">
                {guardando ? "Guardando..." : "Guardar Dirección"}
              </Button>
              <Button type="button" variant="outlined" onClick={() => setMostrarForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-3">
          {direcciones.map((dir) => (
            <div key={dir.id_direccion} className="flex items-start justify-between bg-secondary text-white rounded-xl p-5">
              <div className="flex gap-3">
                <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-label text-sm">{dir.calle}, {dir.colonia}</p>
                  <p className="text-neutral-light text-sm">
                    {nombreCiudad(dir.id_ciudad)}, {nombreDepartamento(dir.id_departamento)}
                  </p>
                </div>
              </div>
              <button onClick={() => handleEliminar(dir.id_direccion)} className="text-primary">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {!cargando && direcciones.length === 0 && !mostrarForm && (
          <p className="text-neutral-light text-center py-8">No tienes direcciones guardadas.</p>
        )}
      </section>
      <Footer />
    </>
  );
}