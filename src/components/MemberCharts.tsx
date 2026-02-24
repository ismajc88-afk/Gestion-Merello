"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

const data = [
    { name: 'Falleros', value: 400, color: '#fbbf24' },
    { name: 'Infantiles', value: 300, color: '#f43f5e' },
    { name: 'Honor', value: 50, color: '#a855f7' },
    { name: 'Juveniles', value: 100, color: '#3b82f6' },
];

export function MemberDistribution() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-6 h-[300px] flex flex-row items-center justify-between relative"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-50" />
            <div className="flex-1 h-full">
                <h3 className="text-lg font-bold text-white mb-1">Distribución</h3>
                <p className="text-xs text-zinc-500 mb-4">Por categoría de fallero</p>
                <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 mr-8">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-zinc-300 font-medium">{item.name}</span>
                        <span className="text-xs text-zinc-500 ml-auto">{item.value}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
