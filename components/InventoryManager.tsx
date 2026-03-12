
import React, { useState, useMemo } from 'react';
import { AppData, TransactionType } from '../types';
import {
   PieChart as PieIcon, TrendingUp, ChevronRight, X,
   Activity, Utensils, Wine,
   Wallet, Plus, Trash2,
   Store, ArrowUpRight,
   ShieldAlert, BarChart3, Receipt, History,
   Flame, CalendarClock, Telescope,
   Layers
} from 'lucide-react';
import {
   PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Bar, XAxis, YAxis, CartesianGrid, Area, ComposedChart
} from 'recharts';

interface Props {
   data: AppData;
   onUpdateBudget: (category: string, amount: number) => void;
   onUpdateLimit: (newLimit: number) => void;
   onAddLine: (category: string, amount: number) => void;
   onDeleteLine: (category: string) => void;
}

export const InventoryManager: React.FC<Props> = ({ data, onUpdateBudget, onUpdateLimit, onAddLine, onDeleteLine }) => {
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [isEditingLimit, setIsEditingLimit] = useState(false);
   const [showAddForm, setShowAddForm] = useState(false);
   const [newLine, setNewLine] = useState({ name: '', amount: '' });

   // --- ENGINE DE CÁLCULO AVANZADO ---
   // IMPORTANTE: Excluimos inversiones de barra del presupuesto "gastable"
   const internalExpenses = useMemo(() =>
      data.transactions
         .filter(t => t.type === TransactionType.EXPENSE && !t.isBarInvestment)
         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      [data.transactions]);

   const barRevenue = useMemo(() =>
      data.transactions
         .filter(t => t.type === TransactionType.INCOME && (t.category === 'Venta Barra' || t.isBarInvestment))
         .reduce((acc, t) => acc + t.amount, 0),
      [data.transactions]);

   const barExpenses = useMemo(() =>
      data.transactions
         .filter(t => t.type === TransactionType.EXPENSE && (t.category.toLowerCase().includes('bebida') || t.isBarInvestment))
         .reduce((acc, t) => acc + t.amount, 0),
      [data.transactions]);

   // KPIs Maestros
   const totalBudget = data.budgetLimit || 1;
   const totalSpent = internalExpenses.reduce((acc, t) => acc + t.amount, 0);
   const remainingBudget = totalBudget - totalSpent;
   const solvencyRatio = (remainingBudget / totalBudget) * 100;

   // Burn Rate: Gasto por día
   const daysOfData = useMemo(() => {
      if (internalExpenses.length < 2) return 1;
      const first = new Date(internalExpenses[0].date).getTime();
      const last = new Date(internalExpenses[internalExpenses.length - 1].date).getTime();
      return Math.max(1, Math.ceil((last - first) / (1000 * 60 * 60 * 24)));
   }, [internalExpenses]);

   const burnRate = totalSpent / daysOfData;
   const costPerFallero = data.members.length > 0 ? totalSpent / data.members.length : 0;
   const barROI = barExpenses > 0 ? ((barRevenue - barExpenses) / barExpenses) * 100 : 0;

   // Max Recommended Burn Rate Calculation
   const maxBurnRate = useMemo(() => {
      if (!data.appConfig.startDate || !data.appConfig.endDate) return totalBudget / 30; // Fallback default
      const start = new Date(data.appConfig.startDate).getTime();
      const end = new Date(data.appConfig.endDate).getTime();
      const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      return totalBudget / totalDays;
   }, [data.appConfig.startDate, data.appConfig.endDate, totalBudget]);

   const burnHealth = burnRate > maxBurnRate * 1.15 ? 'CRITICAL' : burnRate > maxBurnRate ? 'WARNING' : 'HEALTHY';

   // --- PROYECCIÓN FINANCIERA (RUNWAY) ---
   const projection = useMemo(() => {
      const today = new Date();
      const endDate = new Date(data.appConfig.endDate);
      const msPerDay = 1000 * 60 * 60 * 24;

      // Días que faltan hasta el fin de fiesta oficial
      const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / msPerDay);

      // Evitar división por cero
      const safeBurnRate = burnRate > 0 ? burnRate : 0.1;

      // Días hasta quedarse a 0€ (Runway)
      const daysToZero = remainingBudget / safeBurnRate;

      // Fecha exacta de bancarrota
      const bankruptcyDate = new Date(today.getTime() + (daysToZero * msPerDay));

      // Balance proyectado al día final
      const projectedEndBalance = remainingBudget - (safeBurnRate * (daysUntilEnd > 0 ? daysUntilEnd : 0));

      // ¿Llegamos vivos?
      const isBankruptBeforeEnd = daysToZero < daysUntilEnd && daysUntilEnd > 0;

      return {
         daysToZero,
         bankruptcyDate,
         projectedEndBalance,
         isBankruptBeforeEnd,
         daysUntilEnd: Math.max(0, daysUntilEnd)
      };
   }, [remainingBudget, burnRate, data.appConfig.endDate]);


   // Datos para Gráfico de Tendencia
   const trendData = useMemo(() => {
      let runningTotal = 0;
      return internalExpenses.map(t => {
         runningTotal += t.amount;
         return {
            date: new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            gasto: t.amount,
            acumulado: runningTotal
         };
      });
   }, [internalExpenses]);

   const categoriesStats = useMemo(() => data.budgetLines.map(line => {
      const categoryTransactions = internalExpenses.filter(t => t.category === line.category);
      const spent = categoryTransactions.reduce((acc, t) => acc + t.amount, 0);
      const percent = line.estimated > 0 ? (spent / line.estimated) * 100 : 0;
      const status = percent > 100 ? 'DANGER' : percent > 85 ? 'CRITICAL' : percent > 60 ? 'WARNING' : 'HEALTHY';

      // Logic for subgroups based on description grouping
      const subgroups: Record<string, number> = {};
      categoryTransactions.forEach(t => {
         // Try to identify a subgroup from the description (e.g. "Pedido: Vasos (Proveedor X)" -> "Vasos")
         // Simplified approach: Use first 2 words or clean up common prefixes
         let name = t.description.replace('Pedido:', '').replace('Compra:', '').trim().split('(')[0].trim();
         if (!subgroups[name]) subgroups[name] = 0;
         subgroups[name] += t.amount;
      });

      return { ...line, spent, remaining: line.estimated - spent, percent, status, transactions: categoryTransactions, subgroups };
   }), [data.budgetLines, internalExpenses]);

   const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

   const handleAddNewLine = () => {
      if (!newLine.name || !newLine.amount) return;
      onAddLine(newLine.name, parseFloat(newLine.amount));
      setNewLine({ name: '', amount: '' });
      setShowAddForm(false);
   };

   const selectedCatData = categoriesStats.find(c => c.category === selectedCategory);

   return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 w-full pb-20">

         {/* SECCIÓN 1: CABECERA DE INTELIGENCIA FINANCIERA */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Gran Total y Solvencia */}
            <div className="lg:col-span-2 bg-[#09090b] text-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden border border-white/5 group">
               <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><TrendingUp size={400} /></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg"><Wallet size={24} /></div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Gasto Real Comisión (Casal)</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Presupuesto Ejecutable Disponible</p>
                     <div className="flex items-center gap-4">
                        {isEditingLimit ? (
                           <input type="number" autoFocus className="bg-white/5 text-5xl md:text-6xl font-black outline-none border-b-4 border-indigo-500 px-2 w-full" value={data.budgetLimit} onChange={e => onUpdateLimit(parseFloat(e.target.value) || 0)} onBlur={() => setIsEditingLimit(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingLimit(false)} />
                        ) : (
                           <h2 onClick={() => setIsEditingLimit(true)} className="text-5xl md:text-7xl font-black tracking-tighter hover:text-indigo-400 cursor-pointer transition-colors tabular-nums">{data.budgetLimit.toLocaleString()}€</h2>
                        )}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Margen para la Fiesta</p>
                        <p className={`text-2xl md:text-3xl font-black tabular-nums ${remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>{remainingBudget.toLocaleString()}€</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Eficiencia de Caja</p>
                        <p className="text-2xl md:text-3xl font-black text-white tabular-nums">{solvencyRatio.toFixed(1)}%</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* ROI Barra */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[48px] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-300 transition-all">
               <div className="space-y-6">
                  <div className="flex justify-between items-start">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ROI Operación Barra (Fuera Presupuesto)</p>
                     <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Store size={20} /></div>
                  </div>
                  <div>
                     <h4 className="text-5xl font-black text-slate-900 tabular-nums">+{barROI.toFixed(0)}%</h4>
                     <p className="text-[10px] text-slate-500 font-bold mt-1 italic">Rentabilidad neta de la inversión de género.</p>
                  </div>
               </div>
               <div className="pt-6 border-t border-slate-50 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                     <span className="text-slate-400">Total Ingresado</span>
                     <span className="text-emerald-600">+{barRevenue.toLocaleString()}€</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase">
                     <span className="text-slate-400">Género Comprado</span>
                     <span className="text-rose-500">-{barExpenses.toLocaleString()}€</span>
                  </div>
               </div>
            </div>

            {/* Burn Rate - IMPROVED */}
            <div className={`p-6 md:p-8 rounded-[32px] md:rounded-[48px] shadow-xl flex flex-col justify-between relative overflow-hidden transition-all ${burnHealth === 'CRITICAL' ? 'bg-rose-600 text-white' : burnHealth === 'WARNING' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}>
               <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                  {burnHealth === 'CRITICAL' ? <Flame size={140} /> : <Activity size={140} />}
               </div>

               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Velocidad de Gasto</p>
                     <div className="bg-black/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase backdrop-blur-sm">
                        {burnHealth === 'CRITICAL' ? 'Insostenible' : burnHealth === 'WARNING' ? 'Precaución' : 'Óptimo'}
                     </div>
                  </div>

                  <div>
                     <h4 className="text-5xl font-black tabular-nums tracking-tighter">
                        {burnRate.toFixed(0)}€<span className="text-lg opacity-60 font-bold">/día</span>
                     </h4>
                     <div className="mt-2 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                        <div
                           className="h-full bg-white transition-all duration-1000"
                           style={{ width: `${Math.min((burnRate / (maxBurnRate * 1.5)) * 100, 100)}%` }}
                        />
                     </div>
                     <p className="text-[10px] font-bold mt-2 opacity-90 flex justify-between">
                        <span>Límite recomendado:</span>
                        <span>{maxBurnRate.toFixed(0)}€/día</span>
                     </p>
                  </div>
               </div>

               <div className="pt-6 border-t border-white/10 relative z-10 grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-0.5">Coste/Fallero</p>
                     <p className="text-xl font-black tabular-nums">{costPerFallero.toFixed(1)}€</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-0.5">Días Activos</p>
                     <p className="text-xl font-black tabular-nums">{daysOfData}</p>
                  </div>
               </div>
            </div>

         </div>

         {/* SECCIÓN 2: PREDICCIÓN FINANCIERA (RUNWAY) */}
         <div className={`p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-lg relative overflow-hidden ${projection.isBankruptBeforeEnd ? 'bg-gradient-to-r from-rose-600 to-rose-800 text-white' : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'}`}>
            <div className="absolute top-0 right-0 p-12 opacity-10"><Telescope size={300} className="-rotate-12" /></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"><CalendarClock size={24} /></div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Predicción IA • Algoritmo de Gasto</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight max-w-2xl">
                     {projection.isBankruptBeforeEnd
                        ? 'ALERTA: Presupuesto Insuficiente'
                        : 'PROYECCIÓN: Superávit Esperado'}
                  </h3>
                  <p className="text-base md:text-lg opacity-80 mt-4 max-w-xl font-medium">
                     {projection.isBankruptBeforeEnd
                        ? `Al ritmo actual (${burnRate.toFixed(0)}€/día), te quedarás sin fondos el día ${projection.bankruptcyDate.toLocaleDateString()}. Faltan ${projection.daysUntilEnd} días de fiesta.`
                        : `Estás gestionando bien. Llegarás al final de la fiesta con dinero de sobra si mantienes este ritmo.`}
                  </p>
               </div>

               <div className="flex flex-col md:flex-row gap-8 bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/20 w-full md:w-auto">
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Fecha Agotamiento</p>
                     <p className="text-3xl font-black">{projection.bankruptcyDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <div className="w-px bg-white/20 hidden md:block"></div>
                  <div className="h-px bg-white/20 block md:hidden"></div>
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Cierre Proyectado</p>
                     <p className={`text-3xl font-black tabular-nums ${projection.projectedEndBalance < 0 ? 'text-rose-200' : 'text-emerald-200'}`}>
                        {projection.projectedEndBalance > 0 ? '+' : ''}{projection.projectedEndBalance.toFixed(0)}€
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border-2 border-slate-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
                     <Activity className="text-indigo-600" /> Evolución Gasto Comisión
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">Acumulado real (Gasto Casal)</p>
               </div>
            </div>

            <div className="h-[250px] md:h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: '800', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                     <YAxis hide />
                     <Tooltip
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                        itemStyle={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}
                     />
                     <Area type="monotone" dataKey="acumulado" fill="url(#colorAcumulado)" stroke="#6366f1" strokeWidth={4} />
                     <Bar dataKey="gasto" barSize={12} fill="#e2e8f0" radius={[6, 6, 6, 6]} />
                     <defs>
                        <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-8 space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-3"><BarChart3 size={20} className="text-indigo-600" /> Monitor de Ejecución Presupuestaria</h3>
                  <button onClick={() => setShowAddForm(!showAddForm)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-indigo-600 shadow-xl transition-all"><Plus size={16} /> Nueva Partida</button>
               </div>

               {showAddForm && (
                  <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[32px] animate-in zoom-in-95 duration-300 space-y-4">
                     <div className="flex flex-wrap gap-3">
                        <select value={newLine.name} onChange={e => setNewLine({ ...newLine, name: e.target.value })} className="flex-1 min-w-[200px] p-4 bg-white border rounded-2xl font-bold">
                           <option value="">Categoría Presupuesto...</option>
                           {data.appConfig.budgetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="relative">
                           <input type="number" placeholder="Límite" value={newLine.amount} onChange={e => setNewLine({ ...newLine, amount: e.target.value })} className="w-32 p-4 bg-white border rounded-2xl font-black text-xl" />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">€</span>
                        </div>
                        <button onClick={handleAddNewLine} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">Crear</button>
                     </div>
                  </div>
               )}

               <div className="grid grid-cols-1 gap-4">
                  {categoriesStats.map((cat) => (
                     <div key={cat.category} onClick={() => setSelectedCategory(cat.category)} className="bg-white p-6 md:p-8 rounded-[40px] border-2 border-slate-100 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                           <div className="flex items-center gap-6 w-full md:w-auto">
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${cat.status === 'DANGER' ? 'bg-rose-50 text-white rotate-12' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                 {cat.category.includes('Bebida') ? <Wine size={28} /> : <Utensils size={28} />}
                              </div>
                              <div>
                                 <h4 className="font-black text-slate-900 text-xl tracking-tighter mb-1 uppercase italic">{cat.category}</h4>
                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${cat.status === 'DANGER' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {cat.status === 'DANGER' ? 'Presupuesto Agotado' : 'Disponible OK'}
                                 </span>
                              </div>
                           </div>

                           <div className="flex-1 w-full md:w-auto space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 <span>Ejecución: {cat.percent.toFixed(0)}%</span>
                                 <span>Tope: {cat.estimated}€</span>
                              </div>
                              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                 <div className={`h-full rounded-full transition-all duration-1000 ${cat.status === 'DANGER' ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(cat.percent, 100)}%` }} />
                              </div>
                           </div>

                           <div className="text-right shrink-0 w-full md:w-auto flex justify-between md:block items-center">
                              <p className="text-3xl font-black text-slate-900 tabular-nums">{cat.spent.toLocaleString()}€</p>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${cat.remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                 {cat.remaining < 0 ? `Excedido: ${Math.abs(cat.remaining)}€` : `Libre: ${cat.remaining}€`}
                              </p>
                           </div>
                           <ChevronRight className="text-slate-200 group-hover:text-indigo-400 transition-colors hidden md:block" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-8">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><PieIcon size={20} className="text-indigo-600" /> Distribución Gasto</h4>
                  <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={categoriesStats} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="spent">
                              {categoriesStats.map((_, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-amber-50 p-10 rounded-[48px] border-2 border-amber-100 space-y-6">
                  <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest flex items-center gap-3"><ShieldAlert size={20} className="text-amber-600" /> Salubridad de Caja</h4>
                  <p className="text-xs font-medium text-amber-700 leading-relaxed italic">
                     Este módulo monitoriza solo el dinero que NO genera retorno directo (Casal). Los pedidos de Barra se consideran activos de inventario y no penalizan la salud del ejercicio hasta el cierre.
                  </p>
               </div>
            </div>
         </div>

         {/* DETALLE CATEGORÍA */}
         {selectedCategory && selectedCatData && (
            <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-md animate-in fade-in">
               <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right overflow-hidden">
                  <div className="p-12 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2 block">Partida Registrada</span>
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">{selectedCategory}</h3>
                     </div>
                     <button onClick={() => setSelectedCategory(null)} className="p-4 bg-white rounded-2xl shadow-sm border transition-all hover:bg-slate-900 hover:text-white"><X size={32} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Gastado</p>
                           <p className="text-4xl font-black tabular-nums">{selectedCatData.spent.toLocaleString()}€</p>
                        </div>
                        <div className={`p-8 rounded-[40px] border-2 ${selectedCatData.remaining < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                           <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Remanente</p>
                           <p className="text-4xl font-black tabular-nums">{Math.abs(selectedCatData.remaining).toLocaleString()}€</p>
                        </div>
                     </div>

                     {/* DESGLOSE POR SUBGRUPOS (NUEVO) */}
                     <section className="space-y-6">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><Layers size={20} className="text-indigo-600" /> Desglose por Subgrupos</h4>
                        <div className="grid grid-cols-1 gap-3">
                           {Object.entries(selectedCatData.subgroups).map(([name, amount]) => (
                              <div key={name} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="font-bold text-slate-700 text-xs uppercase">{name}</span>
                                 <span className="font-black text-slate-900">{amount.toLocaleString()}€</span>
                              </div>
                           ))}
                           {Object.keys(selectedCatData.subgroups).length === 0 && <p className="text-slate-400 text-xs italic">Sin subgrupos registrados.</p>}
                        </div>
                     </section>

                     <section className="space-y-6">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><Receipt size={20} className="text-indigo-600" /> Tickets de Gasto Casal</h4>
                        <div className="space-y-3">
                           {selectedCatData.transactions.length > 0 ? (
                              selectedCatData.transactions.slice().reverse().map(t => (
                                 <div key={t.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm"><ArrowUpRight size={18} /></div>
                                       <div>
                                          <p className="font-bold text-slate-800 text-sm uppercase">{t.description}</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(t.date).toLocaleDateString()}</p>
                                       </div>
                                    </div>
                                    <span className="font-black text-xl tabular-nums text-rose-600">-{t.amount.toLocaleString()}€</span>
                                 </div>
                              ))
                           ) : (
                              <div className="py-20 text-center opacity-20 border-4 border-dashed border-slate-100 rounded-[48px]">
                                 <History size={48} className="mx-auto mb-4" />
                                 <p className="font-black uppercase tracking-widest text-xs">Sin gastos facturados aún</p>
                              </div>
                           )}
                        </div>
                     </section>

                     <section className="pt-12 border-t border-slate-100 space-y-6">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ajustes de Gestión</h4>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modificar Límite de la Partida</label>
                           <div className="bg-slate-50 p-6 rounded-[32px] border-2 flex items-center gap-4 focus-within:border-indigo-500 transition-colors">
                              <input type="number" className="bg-transparent text-4xl font-black text-slate-900 outline-none w-full tabular-nums" value={selectedCatData.estimated} onChange={e => onUpdateBudget(selectedCategory, parseFloat(e.target.value) || 0)} />
                              <span className="text-3xl font-black text-slate-300">€</span>
                           </div>
                        </div>
                        <button onClick={() => { if (confirm('¿Eliminar esta partida?')) { onDeleteLine(selectedCategory); setSelectedCategory(null); } }} className="w-full py-6 text-rose-500 hover:bg-rose-50 rounded-[32px] font-black uppercase text-xs tracking-widest border-2 border-rose-100 flex items-center justify-center gap-3">
                           <Trash2 size={18} /> Eliminar Partida
                        </button>
                     </section>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
      </div>
   );
};
