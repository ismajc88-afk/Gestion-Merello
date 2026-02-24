"use client";

import { PiggyBank, Receipt, PlusCircle, TrendingDown, AlertCircle, FileText, PieChart, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useApp, Transaction } from "@/lib/DataContext";
import * as Dialog from "@radix-ui/react-dialog";

export default function ExpensesPage() {
    const { transactions, addTransaction } = useApp();
    const expenses = transactions.filter(t => t.type === "expense");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New Expense Form State
    const [newExpense, setNewExpense] = useState<Partial<Transaction>>({
        description: "", category: "Monumento", amount: 0, date: new Date().toISOString().split('T')[0], status: "Pagado"
    });

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.description || !newExpense.amount) return;

        addTransaction({
            type: "expense",
            description: newExpense.description!,
            category: newExpense.category || "General",
            amount: Number(newExpense.amount),
            date: newExpense.date || new Date().toISOString().split('T')[0],
            status: (newExpense.status as "Pagado" | "Pendiente") || "Pagado"
        });

        setIsAddModalOpen(false);
        setNewExpense({ description: "", category: "Monumento", amount: 0, date: new Date().toISOString().split('T')[0], status: "Pagado" });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 pb-20"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white mb-1 flex items-center gap-3">
                        GASTOS <span className="text-secondary text-2xl">2024</span>
                    </h2>
                    <p className="text-zinc-400">Control de partidas presupuestarias y pagos.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-rose-600 text-white font-bold hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all flex items-center gap-2"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Registrar Gasto
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <BudgetCard
                    title="Monumento"
                    budget={55000}
                    spent={expenses.filter(e => e.category === "Monumento").reduce((a, b) => a + b.amount, 0)}
                    color="rose"
                    icon={TrendingDown}
                />
                <BudgetCard
                    title="Pirotecnia"
                    budget={12000}
                    spent={expenses.filter(e => e.category === "Pirotecnia").reduce((a, b) => a + b.amount, 0)}
                    color="amber"
                    icon={TrendingDown}
                />
                <BudgetCard
                    title="Casal"
                    budget={10000}
                    spent={expenses.filter(e => e.category === "Casal").reduce((a, b) => a + b.amount, 0)}
                    color="blue"
                    icon={TrendingDown}
                    alert
                />
                <BudgetCard
                    title="Eventos"
                    budget={15000}
                    spent={expenses.filter(e => e.category === "Eventos").reduce((a, b) => a + b.amount, 0)}
                    color="emerald"
                    icon={TrendingDown}
                />
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/50 to-transparent opacity-50" />

                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-secondary" />
                        Historial de Gastos
                    </h3>
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-900/80 uppercase tracking-widest text-[10px] font-bold text-zinc-500">
                            <tr>
                                <th className="p-4 pl-6">Fecha</th>
                                <th className="p-4">Concepto</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4 text-right">Importe</th>
                                <th className="p-4 text-right pr-6">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {expenses.map((e, i) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={e.id}
                                        className="group/row hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4 pl-6 font-mono text-zinc-400 text-xs">{e.date}</td>
                                        <td className="p-4 font-bold text-zinc-200 group-hover/row:text-white">{e.description}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide border border-zinc-700 text-zinc-400 bg-zinc-800/50">
                                                {e.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-black text-secondary tabular-nums text-lg">
                                            -{e.amount.toLocaleString()} €
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${e.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${e.status === 'Pagado' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                {e.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-3xl z-50 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Nuevo Gasto</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button>
                        </div>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Concepto</label>
                                <input
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                                    placeholder="Ej. Pago pirotecnia"
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Importe (€)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                                        placeholder="0.00"
                                        value={newExpense.amount}
                                        onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Categoría</label>
                                    <select
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        <option>Monumento</option>
                                        <option>Pirotecnia</option>
                                        <option>Casal</option>
                                        <option>Eventos</option>
                                        <option>Otros</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Fecha</label>
                                <input
                                    type="date"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full py-4 bg-secondary text-white font-bold rounded-xl hover:bg-rose-700 transition-colors mt-4 flex justify-center items-center gap-2">
                                <Check className="h-5 w-5" />
                                Registrar Gasto
                            </button>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </motion.div>
    );
}

function BudgetCard({ title, budget, spent, color, alert, icon: Icon }: any) {
    const percentage = Math.round((spent / budget) * 100);
    const colorMap: Record<string, string> = {
        rose: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
        amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
        blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]",
        emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
    };

    const textMap: Record<string, string> = {
        rose: "text-rose-500",
        amber: "text-amber-500",
        blue: "text-blue-500",
        emerald: "text-emerald-500",
    };

    return (
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{title}</h3>
                    <div className="text-2xl font-black text-white tracking-tight">{spent.toLocaleString()} €</div>
                </div>
                {alert && <AlertCircle className="h-5 w-5 text-rose-500 animate-pulse" />}
            </div>

            <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${colorMap[color]}`}
                />
            </div>

            <div className="flex justify-between items-center text-xs">
                <span className={`font-bold ${textMap[color]}`}>{percentage}%</span>
                <span className="text-zinc-600">de {budget.toLocaleString()} €</span>
            </div>

            <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
    )
}
