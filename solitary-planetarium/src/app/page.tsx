"use client";

import { DashboardCard } from "@/components/DashboardCard";
import { FinancialRadar, BudgetRadial } from "@/components/SpectreCharts";
import { Users, Euro, Wallet, PiggyBank, Calendar as CalendarIcon, Bell, Search, PlusCircle, FileBarChart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useApp } from "@/lib/DataContext";
import Link from "next/link";

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { members, getFinancials } = useApp();
  const { income, expense, balance } = getFinancials();

  // Calculate trends
  const incomeTrend = "+4%";
  const expenseTrend = "-2%";

  return (
    <div className="space-y-8">
      {/* Top Bar - Simplified and Functional */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between py-2"
      >
        <div className="flex items-center gap-4 bg-zinc-900/50 p-2 pr-6 rounded-full border border-white/5 backdrop-blur-sm">
          <Search className="h-4 w-4 text-zinc-500 ml-2" />
          <input
            type="text"
            placeholder="Buscar (Alt+K)"
            className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none w-32 md:w-48 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:text-primary transition-all relative group">
            <Bell className="h-5 w-5 text-zinc-400 group-hover:text-primary" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_#e11d48]"></span>
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 p-[2px] shadow-lg shadow-orange-500/20">
            <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider">
              TF
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section - Better Typography & CTA */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-2 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 leading-none">
            PANELDECONTROL<span className="text-primary">.</span>
          </h1>
          <p className="text-zinc-500 text-lg font-medium">
            Resumen ejecutivo del ejercicio fallero <span className="text-zinc-300">2024-2025</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap gap-3 w-full lg:w-auto"
        >
          <button className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2 group">
            <FileBarChart className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
            Exportar Informe
          </button>
          <Link
            href="/income"
            className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl bg-primary text-black font-black hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Nueva Operación
          </Link>
        </motion.div>
      </div>

      {/* Metrics Grid - Proportion Fix */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[
          { t: "Saldo Global", v: `${balance.toLocaleString()} €`, i: Euro, c: "text-emerald-400", bg: "emerald", tr: "+15%" },
          { t: "Ingresos", v: `${income.toLocaleString()} €`, i: Wallet, c: "text-amber-400", bg: "amber", tr: incomeTrend },
          { t: "Gastos", v: `${expense.toLocaleString()} €`, i: PiggyBank, c: "text-rose-400", bg: "rose", tr: expenseTrend },
          { t: "Censo", v: members.filter(m => m.status === 'Activo').length.toString(), i: Users, c: "text-white", bg: "zinc", tr: "+2" },
        ].map((item, idx) => (
          <DashboardCard
            key={idx}
            index={idx}
            title={item.t}
            value={item.v}
            icon={item.i}
            trend={item.tr.startsWith("+") ? "up" : "down"}
            trendValue={item.tr}
            className={`glass-card bg-zinc-900/40 hover:bg-zinc-900/60 border-zinc-800/50 transition-all duration-300 group`}
          />
        ))}
      </div>

      {/* Charts Layout - Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart Area (2/3 width on large screens) */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FinancialRadar />
          <BudgetRadial />
        </div>

        {/* Sidebar Widgets (1/3 width) */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel rounded-3xl p-6 bg-zinc-900/30 border-zinc-800/50 h-[420px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Agenda
              </h3>
              <button className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider">Ver todo</button>
            </div>

            <div className="flex-1 flex justify-center w-full">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                styles={{
                  caption: { color: '#f59e0b', fontWeight: 'bold' },
                  head_cell: { color: '#a1a1aa', fontSize: '0.8rem' },
                  day: { color: '#e4e4e7', fontSize: '0.9rem', margin: '2px' },
                  day_selected: { backgroundColor: '#f59e0b', color: 'black', borderRadius: '50%' },
                  day_today: { color: '#f59e0b', fontWeight: '900', textDecoration: 'underline' }
                }}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-start gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                <div className="h-full w-1 bg-primary rounded-full group-hover:shadow-[0_0_8px_#f59e0b] transition-all" />
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Junta General Extraordinaria</p>
                  <p className="text-xs text-zinc-500">Viernes 24, 20:30h • Casal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
