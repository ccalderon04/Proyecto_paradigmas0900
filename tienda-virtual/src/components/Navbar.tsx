"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, User, FileText, LogOut, MapPin, CreditCard } from "lucide-react";
import { useCarrito } from "@/context/carritocontext";
import { useAuth } from "@/lib/useAuth";

export default function Navbar() {
  const { cantidadTotal, limpiarCarritoLocal } = useCarrito();
  const { cliente, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Tienda" },
    { href: "/ofertas", label: "Ofertas" },
  ];

  const esActivo = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    limpiarCarritoLocal();
    setMenuAbierto(false);
    router.push("/");
};

  return (
    <header className="bg-neutral text-white px-8 py-4 grid grid-cols-3 items-center relative">
      <Link href="/" className="font-headline text-xl font-bold text-primary justify-self-start">
        TIENDA DEPORTIVA
      </Link>

      <nav className="flex gap-6 font-label text-sm justify-self-center">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${
              esActivo(link.href)
              ? "text-primary"
              : link.href === "/ofertas"
              ? "text-tertiary hover:text-tertiary/80"
              : "hover:text-primary"
            }`}
          >
        {link.label}
          </Link>
            ))}
          </nav>

      <div className="flex gap-5 items-center justify-self-end relative">
        <Link href="/carrito" className="relative">
          <ShoppingCart size={20} />
          {cantidadTotal > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {cantidadTotal}
            </span>
          )}
        </Link>

        {cliente ? (
          <div className="relative">
            <button onClick={() => setMenuAbierto((v) => !v)}>
              <User size={20} />
            </button>
            {menuAbierto && (
              <div className="absolute right-0 top-8 bg-secondary rounded-lg shadow-lg py-2 w-48 z-50">
                <p className="px-4 py-2 text-sm text-neutral-light border-b border-white/10">
                  Hola, {cliente.p_nombre}
                </p>
                <Link
                  href="/mis-facturas"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
                >
                  <FileText size={16} /> Mis Facturas
                </Link>
                <Link href="/mis-direcciones" onClick={() => setMenuAbierto(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5">
                  <MapPin size={16} /> Mis Direcciones
                </Link>
                <Link href="/mis-tarjetas" onClick={() => setMenuAbierto(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5">
                  <CreditCard size={16} /> Métodos de Pago
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-white/5 w-full text-left"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login"><User size={20} /></Link>
        )}
      </div>
    </header>
  );
}