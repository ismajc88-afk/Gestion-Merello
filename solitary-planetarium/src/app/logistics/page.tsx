"use client";

import { motion } from "framer-motion";
import { Truck, Utensils, QrCode, ClipboardList, Bus, Clock, CalendarDays, Users } from "lucide-react";

export default function LogisticsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">LOGÍSTICA</h2>
                    <p className="text-zinc-400">Organización de eventos, turnos y viajes.</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Cuenta Atrás Plantà</p>
                        <p className="text-lg font-black text-white">34 Días</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                {/* 1. Turnos Barra */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ClipboardList className="h-8 w-8 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Turnos de Barra</h3>
                        <p className="text-sm text-zinc-400 mb-3">Cuadrante de voluntarios para servir en el casal. Hay 3 turnos vacíos este fin de semana.</p>
                        <span className="text-[10px] font-bold bg-orange-500/20 text-orange-500 px-2 py-1 rounded">REQUIERE ATENCIÓN</span>
                    </div>
                </div>

                {/* 2. Sitting */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="h-8 w-8 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Sitting Cenas</h3>
                        <p className="text-sm text-zinc-400 mb-3">Diseñador visual de mesas. Arrastra y suelta comensales para organizar la cena de Navidad.</p>
                    </div>
                </div>

                {/* 3. QR Acceso */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <QrCode className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Control de Acceso</h3>
                        <p className="text-sm text-zinc-400 mb-3">Escáner de entradas y tickets para fiestas. Valida el acceso de socios e invitados.</p>
                    </div>
                </div>

                {/* 4. Alérgenos */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Utensils className="h-8 w-8 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Cocina y Alérgenos</h3>
                        <p className="text-sm text-zinc-400 mb-3">Fichas de intolerancias alimentarias de los falleros para los equipos de cocina.</p>
                    </div>
                </div>

                {/* 5. Viajes */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors group cursor-pointer flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Bus className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Viajes y Excursiones</h3>
                        <p className="text-sm text-zinc-400 mb-3">Listas de autobús, asignación de habitaciones de hotel y pagos de viajes.</p>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
