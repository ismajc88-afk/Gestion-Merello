"use client";

import { useApp } from "@/lib/DataContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, Download, FileText } from "lucide-react";

export default function ReportsPage() {
    const { transactions, members, getMemberFinancials } = useApp();

    // --- DATA PROCESSING FOR CHARTS ---

    // 1. Monthly Financials (Income vs Expense)
    const monthlyData = transactions.reduce((acc: any[], t) => {
        const month = new Date(t.date).toLocaleString('es-ES', { month: 'short' });
        const existing = acc.find(item => item.name === month);

        if (existing) {
            if (t.type === 'income') existing.ingresos += t.amount;
            else existing.gastos += t.amount;
        } else {
            acc.push({
                name: month,
                ingresos: t.type === 'income' ? t.amount : 0,
                gastos: t.type === 'expense' ? t.amount : 0
            });
        }
        return acc;
    }, []).sort((a, b) => {
        // Sort crudely for now (assuming 2024 data only)
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        return months.indexOf(a.name) - months.indexOf(b.name);
    });

    // 2. Expense Categories
    const expenseCategories = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc: any[], t) => {
            const existing = acc.find(item => item.name === t.category);
            if (existing) {
                existing.value += t.amount;
            } else {
                acc.push({ name: t.category, value: t.amount });
            }
            return acc;
        }, [])
        .sort((a, b) => b.value - a.value);

    // 3. Debtor List (Members with incomplete quota)
    const annualQuota = 350;
    const debtors = members
        .map(m => {
            const financials = getMemberFinancials(m.id);
            return { ...m, ...financials, debt: annualQuota - financials.totalPaid };
        })
        .filter(m => m.debt > 0)
        .sort((a, b) => b.debt - a.debt);

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white mb-1 leading-none">
                        INFORMES
                    </h2>
                    <p className="text-zinc-400">Análisis financiero y control de tesorería.</p>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all flex items-center gap-2 border border-zinc-700">
                    <Download className="h-4 w-4" />
                    <span>Exportar PDF</span>
                </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-24 w-24 text-emerald-500" />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-2">Ingresos Totales</p>
                    <p className="text-3xl font-black text-white">
                        {transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0).toLocaleString()} €
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingDown className="h-24 w-24 text-rose-500" />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-2">Gastos Totales</p>
                    <p className="text-3xl font-black text-white">
                        {transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0).toLocaleString()} €
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="h-24 w-24 text-amber-500" />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-2">Deuda de Cuotas</p>
                    <p className="text-3xl font-black text-amber-500">
                        {debtors.reduce((a, b) => a + b.debt, 0).toLocaleString()} €
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Bar Chart: Balance */}
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" /> Balance Mensual
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Expenses */}
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-rose-500" /> Distribución de Gastos
                    </h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        {expenseCategories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseCategories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => `${Number(value).toLocaleString()} €`}
                                    />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-zinc-500">No hay datos de gastos registrados.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Debtor List Table */}
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" /> Control de Cuotas Pendientes
                    </h3>
                    <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                        {debtors.length} Morosos
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950 text-xs uppercase text-zinc-500 font-bold">
                            <tr>
                                <th className="p-4 pl-6">Fallero</th>
                                <th className="p-4">Pagado</th>
                                <th className="p-4">Pendiente</th>
                                <th className="p-4">% Completado</th>
                                <th className="p-4 text-right pr-6">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-sm">
                            {debtors.map((debtor) => (
                                <tr key={debtor.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 pl-6 font-medium text-white flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${debtor.color} flex items-center justify-center text-[10px] font-bold`}>{debtor.avatar}</div>
                                        {debtor.name}
                                    </td>
                                    <td className="p-4 text-emerald-500 font-bold">{debtor.totalPaid} €</td>
                                    <td className="p-4 text-rose-500 font-bold">{debtor.debt} €</td>
                                    <td className="p-4">
                                        <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div style={{ width: `${debtor.quotaStatus}%` }} className="h-full bg-amber-500" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button className="text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors">
                                            Reclamar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {debtors.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                                        ¡Enhorabuena! Todos los falleros están al corriente de pago.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
