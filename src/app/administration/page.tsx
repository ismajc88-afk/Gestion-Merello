"use client";

import { motion } from "framer-motion";
import { Shield, Award, Shirt, Users, Speaker, AlertTriangle, Calculator, Crown, GitMerge } from "lucide-react";

export default function AdministrationPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="mb-4">
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">ADMINISTRACIÓN</h2>
                <p className="text-zinc-400">Herramientas de gestión interna y secretaría.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Calculadora de Bunyols */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Calculator className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Calculadora JCF</h3>
                    <p className="text-sm text-zinc-400">Calcula automáticamente los años de censo y las recompensas (Bunyols) correspondientes.</p>
                </div>

                {/* 2. Indumentaria */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shirt className="h-6 w-6 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Indumentaria</h3>
                    <p className="text-sm text-zinc-400">Registro de telas, tallas, modistas y valoración de seguros para trajes regionales.</p>
                </div>

                {/* 3. Genealogía */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <GitMerge className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Genealogía</h3>
                    <p className="text-sm text-zinc-400">Árbol familiar de la comisión. Vincula padres e hijos para descuentos y cuotas familiares.</p>
                </div>

                {/* 4. Histórico Premios */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Crown className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Palets y Premios</h3>
                    <p className="text-sm text-zinc-400">Museo digital. Registro histórico de todos los premios ganados por la falla año a año.</p>
                </div>

                {/* 5. Playbacks */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Speaker className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Playbacks & Teatro</h3>
                    <p className="text-sm text-zinc-400">Gestión de ensayos, casting de actores/bailarines y repositorio de música.</p>
                </div>

                {/* 6. Sanciones */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Régimen Sancionador</h3>
                    <p className="text-sm text-zinc-400">Control de faltas de asistencia obligatoria y gestión automática de penalizaciones.</p>
                </div>

            </div>
        </motion.div>
    );
}
