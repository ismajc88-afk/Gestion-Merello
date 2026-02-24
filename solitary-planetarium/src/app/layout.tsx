import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AppProvider } from "@/lib/DataContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión Fallera - Spectre",
  description: "Plataforma de gestión integral para comisiones falleras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen bg-black text-foreground selection:bg-primary/30`}
      >
        <AppProvider>
          <div className="flex min-h-screen relative">
            <Sidebar />
            <main className="flex-1 w-full p-4 md:p-8 lg:p-12 overflow-x-hidden transition-all duration-300">
              <div className="max-w-7xl mx-auto space-y-8 pb-20">
                {children}
              </div>
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
