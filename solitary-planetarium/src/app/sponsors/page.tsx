"use client";

import { useState } from "react";
import { Store, Phone, ExternalLink, MoreHorizontal, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface Sponsor {
    id: number;
    name: string;
    description: string;
    contribution: number;
    type: "Llibret" | "Evento" | "Colaborador";
    status: "Pagado" | "Pendiente";
    contact: string;
    logo: string; // Gradient placeholder
}

export default function SponsorsPage() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([
        { id: 1, name: "Panadería El Horno", description: "Publicidad página completa llibret", contribution: 150, type: "Llibret", status: "Pagado", contact: "600 111 222", logo: "from-orange-400 to-amber-500" },
        { id: 2, name: "Talleres Manolo", description: "Patrocinio Concurso Paellas", contribution: 300, type: "Evento", status: "Pendiente", contact: "600 333 444", logo: "from-blue-500 to-cyan-500" },
        { id: 3, name: "Bar La Esquina", description: "Media página llibret", contribution: 80, type: "Llibret", status: "Pagado", contact: "600 555 666", logo: "from-red-500 to-rose-500" },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">PATROCINADORES</h2>
                    <p className="text-zinc-400">Gestión de colaboradores comerciales y publicidad.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Recaudado</p>
                        <p className="text-xl font-black text-emerald-500">
                            {sponsors.filter(s => s.status === 'Pagado').reduce((a, b) => a + b.contribution, 0)} €
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Pendiente</p>
                        <p className="text-xl font-black text-amber-500">
                            {sponsors.filter(s => s.status === 'Pendiente').reduce((a, b) => a + b.contribution, 0)} €
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {sponsors.map(sponsor => (
                    <div key={sponsor.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-zinc-700 transition-colors">
                        {/* Logo Placeholder */}
                        <div className={`h-16 w-16 md:h-20 md:w-20 rounded-xl bg-gradient-to-br ${sponsor.logo} flex items-center justify-center shadow-lg`}>
                            <Store className="h-8 w-8 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-white mb-1">{sponsor.name}</h3>
                            <p className="text-zinc-400 text-sm mb-2">{sponsor.description}</p>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                <span>{sponsor.type}</span>
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {sponsor.contact}</span>
                            </div>
                        </div>

                        {/* Financials & Status */}
                        <div className="flex flex-col items-center md:items-end gap-2 min-w-[120px]">
                            <span className="text-2xl font-black text-white">{sponsor.contribution} €</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${contextStyles[sponsor.status]}`}>
                                {sponsor.status}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
                                <ExternalLink className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

const contextStyles = {
    "Pagado": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Pendiente": "bg-amber-500/10 text-amber-500 border-amber-500/20"
};
