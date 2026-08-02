import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { CarritoProvider } from "@/context/carritocontext";
import "./globals.css";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Elite Supps - Tienda Deportiva",
  description: "Rendimiento sofisticado al alcance de tu mano.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} font-body bg-white text-neutral`}>
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}