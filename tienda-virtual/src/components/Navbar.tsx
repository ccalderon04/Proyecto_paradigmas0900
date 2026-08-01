import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

export default function Navbar() {
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
            <div className="flex gap-4">
                <Link href="/carrito"><ShoppingCart size={20} /></Link>
                <Link href="/login"><User size={20} /></Link>
            </div>
        </header>
    );
}