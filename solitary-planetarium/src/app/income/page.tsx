"use client";

import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowRight, Download, X, Check, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useApp, Transaction } from "@/lib/DataContext";
import * as Dialog from "@radix-ui/react-dialog";

export default function IncomePage() {
    const { transactions, addTransaction, members } = useApp();
    const incomeTransactions = transactions.filter(t => t.type === "income");
    const [activeTab, setActiveTab] = useState("overview");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New Income Form State
    const [newIncome, setNewIncome] = useState<Partial<Transaction>>({
        description: "", category: "Cuota", amount: 0, date: new Date().toISOString().split('T')[0], status: "Pagado", memberId: undefined
    });

    // Watch for category changes to toggle member selector logic
    useEffect(() => {
        if (newIncome.category !== "Cuota") {
            setNewIncome(prev => ({ ...prev, memberId: undefined }));
        }
    }, [newIncome.category]);

    const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    const handleAddIncome = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIncome.description || !newIncome.amount) return;

        addTransaction({
            type: "income",
            description: newIncome.description!,
            category: newIncome.category || "Cuota",
            amount: Number(newIncome.amount),
            date: newIncome.date || new Date().toISOString().split('T')[0],
            status: (newIncome.status as "Pagado" | "Pendiente") || "Pagado",
            memberId: newIncome.memberId // Include the link
        });

        setIsAddModalOpen(false);
        setNewIncome({ description: "", category: "Cuota", amount: 0, date: new Date().toISOString().split('T')[0], status: "Pagado", memberId: undefined });
    };

    const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const memberId = Number(e.target.value);
        const member = members.find(m => m.id === memberId);

        setNewIncome({
            ...newIncome,
            memberId: memberId,
            description: member ? `Cuota ${member.name}` : newIncome.description // Auto-fill description
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white mb-1">
                        INGRESOS
                    </h2>
                    <p className="text-zinc-400">Control de cuotas, lotería y subvenciones.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Registrar Ingreso
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <MetricCard
                    title="Total Recaudado"
                    value={`${totalIncome.toLocaleString()} €`}
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="emerald"
                />
                <MetricCard
                    title="Cuotas Pendientes"
                    value="3.200 €"
                    trend="45 recibos"
                    trendUp={false}
                    icon={CreditCard}
                    color="amber"
                    alert
                />
                <MetricCard
                    title="Beneficio Lotería"
                    value={`${incomeTransactions.filter(t => t.category === 'Lotería').reduce((a, b) => a + b.amount, 0).toLocaleString()} €`}
                    trend="Campaña actual"
                    trendUp={true}
                    icon={Wallet}
                    color="blue"
                />
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>

                <div className="flex border-b border-white/5 p-2 gap-2 overflow-x-auto">
                    {["Resumen", "Cuotas", "Lotería", "Subvenciones"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all relative overflow-hidden whitespace-nowrap ${activeTab === tab.toLowerCase()
                                    ? "text-black bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-8 bg-zinc-900/40">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Últimos Movimientos
                    </h3>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {incomeTransactions.map((t, i) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={t.id}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-900/10 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">{t.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                <span className="font-mono text-emerald-500/70">{t.date}</span>
                                                {t.memberId && (
                                                    <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-300 border border-zinc-700">
                                                        <User className="h-3 w-3" /> Fallero #{t.memberId}
                                                    </span>
                                                )}
                                                <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border border-zinc-700">{t.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div>
                                            <p className="font-black text-emerald-400 text-lg tabular-nums tracking-tight">+{t.amount.toLocaleString()} €</p>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Completado</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Add Income Modal */}
            <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-3xl z-50 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Nuevo Ingreso</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button>
                        </div>

                        <form onSubmit={handleAddIncome} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Categoría</label>
                                    <select
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={newIncome.category}
                                        onChange={e => setNewIncome({ ...newIncome, category: e.target.value })}
                                    >
                                        <option>Cuota</option>
                                        <option>Lotería</option>
                                        <option>Subvención</option>
                                        <option>Patrocinio</option>
                                        <option>Otros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Importe (€)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="0.00"
                                        value={newIncome.amount}
                                        onChange={e => setNewIncome({ ...newIncome, amount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Member Selector if Category is Cuota */}
                            {newIncome.category === "Cuota" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-zinc-900/50 p-3 rounded-xl border border-dashed border-zinc-700"
                                >
                                    <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Asignar a Fallero</label>
                                    <select
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        onChange={handleMemberSelect}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Selecciona un fallero...</option>
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Concepto</label>
                                <input
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ej. Cuota Juan Pérez"
                                    value={newIncome.description}
                                    onChange={e => setNewIncome({ ...newIncome, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Fecha</label>
                                <input
                                    type="date"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={newIncome.date}
                                    onChange={e => setNewIncome({ ...newIncome, date: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors mt-4 flex justify-center items-center gap-2">
                                <Check className="h-5 w-5" />
                                Registrar Ingreso
                            </button>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </motion.div>
    );
}

function MetricCard({ title, value, trend, trendUp, icon: Icon, color, alert }: any) {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-500 from-emerald-500/20 to-transparent",
        amber: "text-amber-500 from-amber-500/20 to-transparent",
        blue: "text-blue-500 from-blue-500/20 to-transparent",
    };

    return (
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className={`absolute -right-6 -top-6 h-32 w-32 bg-gradient-to-br ${colorClasses[color]} opacity-20 blur-3xl rounded-full group-hover:opacity-40 transition-opacity`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{title}</h3>
                    <Icon className={`h-5 w-5 ${colorClasses[color].split(" ")[0]}`} />
                </div>
                <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-4xl font-black tracking-tighter text-white">{value}</span>
                </div>
                <div className="mt-2 flex items-center text-xs">
                    <span className={`font-bold px-2 py-1 rounded-lg ${alert ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                        {trend}
                    </span>
                    <span className="text-zinc-500 ml-2">
                        {alert ? "requiere atención" : "vs mes anterior"}
                    </span>
                </div>
            </div>
        </div>
    )
}
