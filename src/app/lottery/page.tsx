"use client";

import { useApp, Member } from "@/lib/DataContext";
import { useState } from "react";
import { Ticket, DollarSign, RefreshCw, AlertCircle, Plus, Search, Check } from "lucide-react";
import { motion } from "framer-motion";

// Interface for Lottery Assignment
interface LotteryAssignment {
    id: string;
    memberId: number;
    startNumber: number;
    endNumber: number;
    status: "Distribudo" | "Vendido" | "Devuelto" | "Pagado";
    amount: number;
}

export default function LotteryPage() {
    const { members } = useApp();
    const [assignments, setAssignments] = useState<LotteryAssignment[]>([
        { id: "1", memberId: 1, startNumber: 100, endNumber: 120, status: "Vendido", amount: 100 },
        { id: "2", memberId: 2, startNumber: 121, endNumber: 140, status: "Distribudo", amount: 0 },
    ]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Stats
    const totalTickets = 1000;
    const distributedTickets = assignments.reduce((acc, curr) => acc + (curr.endNumber - curr.startNumber + 1), 0);
    const soldTickets = assignments.filter(a => a.status === "Vendido" || a.status === "Pagado").reduce((acc, curr) => acc + (curr.endNumber - curr.startNumber + 1), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">LOTERÍA</h2>
                    <p className="text-zinc-400">Campaña de Navidad 2024 - Sorteo 22 Diciembre</p>
                </div>
                <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Asignar Talonario
                </button>
            </div>

            {/* Lottery KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                    <Ticket className="h-8 w-8 text-zinc-500 mb-4" />
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Billetes</p>
                        <p className="text-2xl font-black text-white">{totalTickets}</p>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                    <RefreshCw className="h-8 w-8 text-blue-500 mb-4" />
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">En la calle</p>
                        <p className="text-2xl font-black text-blue-500">{distributedTickets}</p>
                        <p className="text-xs text-zinc-600">{Math.round((distributedTickets / totalTickets) * 100)}% Repartido</p>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                    <DollarSign className="h-8 w-8 text-emerald-500 mb-4" />
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Vendido</p>
                        <p className="text-2xl font-black text-emerald-500">{soldTickets}</p>
                        <p className="text-xs text-emerald-500/50">~ {soldTickets * 5} € Recaudados</p>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                    <AlertCircle className="h-8 w-8 text-rose-500 mb-4" />
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pendiente</p>
                        <p className="text-2xl font-black text-rose-500">{totalTickets - soldTickets}</p>
                    </div>
                </div>
            </div>

            {/* Distribution Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Control de Talonarios</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            placeholder="Buscar fallero..."
                            className="pl-10 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none w-64"
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-xs font-bold text-zinc-500 uppercase">
                        <tr>
                            <th className="p-4 pl-6">Fallero Responsable</th>
                            <th className="p-4 text-center">Números (Desde - Hasta)</th>
                            <th className="p-4 text-center">Cantidad</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right pr-6">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {assignments.map(assign => {
                            const member = members.find(m => m.id === assign.memberId);
                            if (!member) return null;
                            return (
                                <tr key={assign.id} className="group hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 pl-6 font-medium text-white flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-[10px] font-bold`}>{member.avatar}</div>
                                        {member.name}
                                    </td>
                                    <td className="p-4 text-center font-mono text-zinc-300">
                                        <span className="bg-zinc-800 px-2 py-1 rounded text-xs border border-zinc-700">{assign.startNumber}</span>
                                        <span className="mx-2 text-zinc-600">➔</span>
                                        <span className="bg-zinc-800 px-2 py-1 rounded text-xs border border-zinc-700">{assign.endNumber}</span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-white">
                                        {assign.endNumber - assign.startNumber + 1}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[assign.status]}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[assign.status]}`} />
                                            {assign.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button className="text-zinc-500 hover:text-white transition-colors text-sm font-medium hover:underline">
                                            Gestionar
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal Placeholder */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Asignar Talonario</h3>
                        <p className="text-zinc-500 mb-6">Selecciona un fallero y el rango de papeletas.</p>
                        <div className="space-y-4">
                            <select className="w-full bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-white">
                                <option>Seleccionar Fallero...</option>
                                {members.map(m => <option key={m.id}>{m.name}</option>)}
                            </select>
                            <div className="flex gap-4">
                                <input placeholder="Del Nº" className="w-1/2 bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-white" type="number" />
                                <input placeholder="Al Nº" className="w-1/2 bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-white" type="number" />
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors">
                                Confirmar Asignación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

const statusStyles = {
    "Distribudo": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Vendido": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Devuelto": "bg-zinc-800 text-zinc-500 border-zinc-700",
    "Pagado": "bg-amber-500/10 text-amber-500 border-amber-500/20"
};

const statusDot = {
    "Distribudo": "bg-blue-500",
    "Vendido": "bg-emerald-500",
    "Devuelto": "bg-zinc-500",
    "Pagado": "bg-amber-500"
};
