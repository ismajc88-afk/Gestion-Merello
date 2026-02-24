"use client";

import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

const data = [
    { name: "Ene", income: 2400, expense: 1800 },
    { name: "Feb", income: 1398, expense: 2200 },
    { name: "Mar", income: 9800, expense: 4500 },
    { name: "Abr", income: 3908, expense: 2800 },
    { name: "May", income: 4800, expense: 1900 },
    { name: "Jun", income: 3800, expense: 2500 },
    { name: "Jul", income: 4300, expense: 2100 },
];

export function RevenueChart() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6"
        >
            <div className="flex flex-col space-y-1.5 mb-6">
                <h3 className="font-semibold text-lg leading-none tracking-tight">Balance Financiero</h3>
                <p className="text-sm text-muted-foreground">Evolución de ingresos y gastos del ejercicio actual.</p>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#64748b" />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `€${value}`} fontSize={12} stroke="#64748b" />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                        />
                        <Area type="monotone" dataKey="income" name="Ingresos" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" name="Gastos" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    </RechartsAreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
