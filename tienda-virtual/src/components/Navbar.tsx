// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useCarrito } from "@/context/carritocontext";

export default function Navbar() {
  const { cantidadTotal } = useCarrito();

  return (
    <header className="bg-neutral text-white px-8 py-4 flex items-center justify-between">
      <Link href="/" className="font-headline text-xl font-bold text-primary">
        ELITE SUPPS
      </Link>
      <nav className="flex gap-6 font-label text-sm">
        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
        <Link href="/productos" className="hover:text-primary transition-colors">Tienda</Link>
        <Link href="/ofertas" className="hover:text-primary transition-colors">Ofertas</Link>
      </nav>
      <div className="flex gap-5 items-center">
        <Link href="/carrito" className="relative">
          <ShoppingCart size={20} />
          {cantidadTotal > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {cantidadTotal}
            </span>
          )}
        </Link>
        <Link href="/login"><User size={20} /></Link>
      </div>
    </header>
  );
}