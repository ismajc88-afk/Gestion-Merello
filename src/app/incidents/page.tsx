"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface Incident {
    id: number;
    title: string;
    description: string;
    priority: "Alta" | "Media" | "Baja";
    status: "Abierto" | "En Proceso" | "Resuelto";
    date: string;
    assignedTo: string;
}

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([
        { id: 1, title: "Fuga de agua en baño señoras", description: "El grifo del lavabo pierde mucha agua.", priority: "Alta", status: "Abierto", date: "2024-02-09", assignedTo: "Fontanero Pepe" },
        { id: 2, title: "Bombilla fundida entrada", description: "Luz principal del casal.", priority: "Media", status: "En Proceso", date: "2024-02-08", assignedTo: "Delegado Casal" },
        { id: 3, title: "Pintura pared fondo", description: "Retoques necesarios antes de la presentación.", priority: "Baja", status: "Resuelto", date: "2024-01-20", assignedTo: "Voluntarios" },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">INCIDENCIAS</h2>
                    <p className="text-zinc-400">Mantenimiento y reparaciones del Casal.</p>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20">
                    <AlertCircle className="h-5 w-5" />
                    <span>Nueva Incidencia</span>
                </button>
            </div>

            <div className="grid gap-4">
                {incidents.map(incident => (
                    <div key={incident.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-zinc-600 transition-all">
                        {/* Status Icon */}
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${incident.status === 'Resuelto' ? 'bg-emerald-500/10 text-emerald-500' :
                                incident.status === 'En Proceso' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-rose-500/10 text-rose-500'
                            }`}>
                            {incident.status === 'Resuelto' ? <CheckCircle2 className="h-6 w-6" /> :
                                incident.status === 'En Proceso' ? <Wrench className="h-6 w-6" /> :
                                    <AlertCircle className="h-6 w-6" />}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white mb-1">{incident.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${incident.priority === 'Alta' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        incident.priority === 'Media' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }`}>
                                    Prioridad {incident.priority}
                                </span>
                            </div>
                            <p className="text-zinc-400 mb-4 text-sm">{incident.description}</p>

                            <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {incident.date}</span>
                                <span>Asignado a: {incident.assignedTo}</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center gap-2">
                            {incident.status !== 'Resuelto' && (
                                <button className="px-4 py-2 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-400 text-xs font-bold rounded-lg transition-colors">
                                    Marcar Resuelto
                                </button>
                            )}
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold rounded-lg transition-colors">
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
