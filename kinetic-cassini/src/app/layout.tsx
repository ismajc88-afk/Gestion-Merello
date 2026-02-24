import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Falla ERP — Gestión Integral de tu Falla",
  description:
    "Sistema ERP para la gestión completa de la tesorería, falleros, eventos y actividades de tu Falla.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.variable}>
        <nav className="nav-container">
          <div className="nav-inner">
            <a href="/" className="nav-brand">
              <span className="nav-brand-icon">🔥</span>
              <span>Falla ERP</span>
            </a>
            <div className="nav-links">
              <a href="/" className="nav-link active">Dashboard</a>
              <a href="/falleros" className="nav-link">Falleros</a>
              <a href="/tesoreria" className="nav-link">Tesorería</a>
              <a href="/presupuestos" className="nav-link">Presupuestos</a>
              <a href="/eventos" className="nav-link">Eventos</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
