"use client";

import { useState } from "react";
import { Package, MapPin, AlertCircle, CheckCircle2, Search, Filter, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface Asset {
    id: number;
    name: string;
    category: "Cocina" | "Mobiliario" | "Tecnología" | "Vestuario" | "Decoración";
    quantity: number;
    location: "Casal" | "Almacén" | "Prestado";
    status: "Operativo" | "Reparar" | "Baja";
    value: number;
}

export default function InventoryPage() {
    const [assets, setAssets] = useState<Asset[]>([
        { id: 1, name: "Botelleros Industriales", category: "Cocina", quantity: 2, location: "Casal", status: "Operativo", value: 1200 },
        { id: 2, name: "Sillas de Plástico", category: "Mobiliario", quantity: 150, location: "Almacén", status: "Operativo", value: 1500 },
        { id: 3, name: "Estandarte Infantil", category: "Decoración", quantity: 1, location: "Casal", status: "Reparar", value: 400 },
        { id: 4, name: "Equipo de Sonido JBL", category: "Tecnología", quantity: 1, location: "Prestado", status: "Operativo", value: 800 },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">INVENTARIO</h2>
                    <p className="text-zinc-400">Control de patrimonio y activos de la comisión.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500 uppercase">Valor Total</p>
                    <p className="text-2xl font-black text-white">{assets.reduce((a, b) => a + b.value, 0).toLocaleString()} €</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        placeholder="Buscar activo..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>
                <button className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                </button>
            </div>

            {/* Asset Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map(asset => (
                    <div key={asset.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-amber-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${asset.status === 'Operativo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                asset.status === 'Reparar' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                {asset.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-4">{asset.category}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Cantidad</span>
                                <span className="font-bold text-white">{asset.quantity} un.</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Ubicación</span>
                                <span className="font-medium text-amber-500 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {asset.location}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                                Editar
                            </button>
                            <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                                Mover
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <button className="border-2 border-dashed border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-white hover:border-zinc-600 hover:bg-zinc-900/50 transition-all">
                    <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-bold">Añadir Activo</span>
                </button>
            </div>
        </motion.div>
    );
}
