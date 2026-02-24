"use client";

import { motion } from "framer-motion";
import { Briefcase, FileCode, CreditCard, Wallet, Truck, PenTool, Activity } from "lucide-react";

export default function FinanceProPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="mb-4">
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">FINANZAS PRO</h2>
                <p className="text-zinc-400">Herramientas bancarias avanzadas y gestión económica.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

                {/* 1. SEPA */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileCode className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Remesas SEPA (XML)</h3>
                    <p className="text-sm text-zinc-400">Generador de ficheros bancarios para girar recibos a la totalidad de la comisión en un clic.</p>
                </div>

                {/* 2. Stripe */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CreditCard className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Pasarela de Pagos</h3>
                    <p className="text-sm text-zinc-400">Configuración de TPV Virtual (Stripe) para cobro de cuotas y lotería con tarjeta.</p>
                </div>

                {/* 3. Cashless */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Wallet className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Monedero Virtual</h3>
                    <p className="text-sm text-zinc-400">Sistema Cashless para recargar saldo y pagar en barra sin efectivo.</p>
                </div>

                {/* 4. Proveedores */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Truck className="h-6 w-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">CRM Proveedores</h3>
                    <p className="text-sm text-zinc-400">Base de datos de artistas, pirotécnicos, floristas y músicos con historial de facturas.</p>
                </div>

                {/* 5. Firma Digital */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-700/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PenTool className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Firma Biométrica</h3>
                    <p className="text-sm text-zinc-400">Recogida de firmas para actas y consentimientos RGPD directamente en pantalla.</p>
                </div>

                {/* 6. Logs */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Activity className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Auditoría (Logs)</h3>
                    <p className="text-sm text-zinc-400">Registro de seguridad. Quién accedió, qué modificó y cuándo. Control total.</p>
                </div>

            </div>
        </motion.div>
    );
}
