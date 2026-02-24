"use client";

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    RadialBarChart, RadialBar, Legend, Tooltip
} from "recharts";
import { motion } from "framer-motion";

const radarData = [
    { subject: 'Presupuesto', A: 120, fullMark: 150 },
    { subject: 'Ingresos', A: 98, fullMark: 150 },
    { subject: 'Gastos', A: 86, fullMark: 150 },
    { subject: 'Ahorro', A: 99, fullMark: 150 },
    { subject: 'Inversión', A: 85, fullMark: 150 },
    { subject: 'Deuda', A: 65, fullMark: 150 },
];

const radialData = [
    { name: 'Monumento', uv: 31.47, fill: '#8884d8' },
    { name: 'Pirotecnia', uv: 26.69, fill: '#83a6ed' },
    { name: 'Casal', uv: 15.69, fill: '#8dd1e1' },
    { name: 'Eventos', uv: 8.22, fill: '#82ca9d' },
    { name: 'Otros', uv: 18.63, fill: '#a4de6c' },
];

export function FinancialRadar() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="glass-panel rounded-3xl p-6 h-[400px] flex flex-col relative overflow-hidden group"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <h3 className="text-xl font-bold tracking-tight text-white mb-2 z-10">Salud Financiera</h3>
            <p className="text-sm text-zinc-400 mb-4 z-10">Análisis multidimensional de cuentas</p>

            <div className="flex-1 w-full h-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#3f3f46" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar
                            name="Estado Actual"
                            dataKey="A"
                            stroke="#fbbf24"
                            strokeWidth={3}
                            fill="#fbbf24"
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                            itemStyle={{ color: '#fbbf24' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Background Glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
        </motion.div>
    );
}

export function BudgetRadial() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel rounded-3xl p-6 h-[400px] flex flex-col relative overflow-hidden group"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />
            <h3 className="text-xl font-bold tracking-tight text-white mb-2 z-10">Distribución de Gastos</h3>
            <p className="text-sm text-zinc-400 mb-4 z-10">Consumo por partida presupuestaria</p>

            <div className="flex-1 w-full h-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={20} data={radialData}>
                        <RadialBar
                            label={{ position: 'insideStart', fill: '#fff' }}
                            background
                            dataKey="uv"
                        />
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, color: "#a1a1aa" }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>

            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-secondary/20 transition-colors duration-500" />
        </motion.div>
    );
}
