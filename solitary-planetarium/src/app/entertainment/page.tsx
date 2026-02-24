"use client";

import { motion } from "framer-motion";
import { Gamepad2, Trophy, Medal, BrainCircuit, Tablet, HelpCircle, Music } from "lucide-react";

export default function EntertainmentPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="mb-4">
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">ZONA LÚDICA</h2>
                <p className="text-zinc-400">Gamificación y herramientas de entretenimiento.</p>
            </div>

            {/* Hero Ranking */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 relative overflow-hidden mb-8">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-black mb-1">RANKING FALLERO AÑO</h3>
                        <p className="text-black/70 font-bold">Temporada 2024-2025</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                        <span className="text-black font-black text-2xl">#1 Vicente Moliner</span>
                        <span className="block text-right text-xs font-bold text-black/60">3.450 XP</span>
                    </div>
                </div>
                <Trophy className="absolute -right-10 -bottom-10 h-64 w-64 text-black/10 rotate-12" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Logros */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer text-center">
                    <Medal className="h-10 w-10 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white mb-1">Medallero</h3>
                    <p className="text-xs text-zinc-400">Colección de insignias digitales.</p>
                </div>

                {/* 2. Quiz */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer text-center">
                    <BrainCircuit className="h-10 w-10 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white mb-1">Quiz Fallero</h3>
                    <p className="text-xs text-zinc-400">Trivial sobre historia de la falla.</p>
                </div>

                {/* 3. Kiosco */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer text-center">
                    <Tablet className="h-10 w-10 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white mb-1">Modo Kiosco</h3>
                    <p className="text-xs text-zinc-400">Interfaz simplificada para tablets.</p>
                </div>

                {/* 4. Spotify */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer text-center">
                    <Music className="h-10 w-10 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white mb-1">DJ Fallero</h3>
                    <p className="text-xs text-zinc-400">Votación colaborativa de playlist.</p>
                </div>

            </div>

            {/* 5. Objetos Perdidos */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center gap-6">
                <div className="h-16 w-16 bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
                    <HelpCircle className="h-8 w-8 text-zinc-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">Objetos Perdidos</h3>
                    <p className="text-sm text-zinc-400">Tablón de chaquetas, móviles y llaves olvidadas en el casal.</p>
                </div>
                <button className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors">
                    Ver Tablón
                </button>
            </div>
        </motion.div>
    );
}
