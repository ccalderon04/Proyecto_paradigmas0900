// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";
import { useCarrito } from "@/context/carritocontext";

export default function Navbar() {
  const { cantidadTotal } = useCarrito();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Tienda" },
    { href: "/ofertas", label: "Ofertas" },
  ];

  const esActivo = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-neutral text-white px-8 py-4 flex items-center justify-between">
      <Link href="/" className="font-headline text-xl font-bold text-primary">
        ELITE SUPPS
      </Link>
      <nav className="flex gap-6 font-label text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${
              esActivo(link.href) ? "text-primary" : "hover:text-primary"
            }`}
          >
            {link.label}
          </Link>
        ))}
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