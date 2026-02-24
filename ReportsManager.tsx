
import React, { useMemo } from 'react';
import { AppData, TransactionType, ESCUDO_BASE64 } from '../types';
import { FileText, Printer, CheckCircle, TrendingUp, AlertTriangle, User, Wallet, PieChart as PieIcon, Package, BarChart3, ArrowRight, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';

interface ReportsProps {
  data: AppData;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export const ReportsManager: React.FC<ReportsProps> = ({ data }) => {
  // Financial Core Calculations
  const totalIncome = data.transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = data.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;
  
  // Debt Analysis
  const paidMembers = data.members.filter(m => m.paid).length;
  const totalMembers = data.members.length;
  const unpaidMembers = totalMembers - paidMembers;
  const collectionRate = totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0;
  // Assuming a standard quota of 50€ for calculation (or derive from avg)
  const estimatedQuota = 50; 
  const pendingCollection = unpaidMembers * estimatedQuota; 

  // Budget Breakdown
  const expensesByCategory = useMemo(() => data.budgetLines.map(line => {
    const amount = data.transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.category === line.category)
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: line.category, value: amount, budget: line.estimated, remaining: line.estimated - amount };
  }).sort((a,b) => b.value - a.value), [data.budgetLines, data.transactions]);

  // Cash Flow Trend (Monthly)
  const cashFlowData = useMemo(() => {
      const months: Record<string, { income: number, expense: number }> = {};
      data.transactions.forEach(t => {
          const key = new Date(t.date).toLocaleDateString('es-ES', { month: 'short' });
          if (!months[key]) months[key] = { income: 0, expense: 0 };
          if (t.type === TransactionType.INCOME) months[key].income += t.amount;
          else months[key].expense += t.amount;
      });
      return Object.entries(months).map(([name, vals]) => ({ name, ...vals }));
  }, [data.transactions]);

  return (
    <div className="space-y-8 pb-24">
      {/* ACTION BAR */}
      <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 print:hidden border border-white/5">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-600 rounded-2xl"><FileText size={24}/></div>
           <div>
              <h2 className="font-black text-2xl uppercase italic tracking-tighter">Centro de Informes</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generador de Dossieres Oficiales</p>
           </div>
        </div>
        <button onClick={() => window.print()} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg flex items-center gap-2 active:scale-95">
           <Printer size={18} /> Imprimir Informe PDF
        </button>
      </div>

      {/* DOCUMENT PREVIEW WRAPPER */}
      <div className="bg-white p-8 md:p-16 shadow-sm border border-gray-100 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between print:shadow-none print:border-0 print:p-0 print:m-0 print:w-full break-after-page">
         <div>
            {/* HEADER OFICIAL */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-12">
               <div className="flex gap-6 items-center">
                  <div className="w-28 h-28 p-2 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center">
                     <img src={ESCUDO_BASE64} alt="Escudo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] italic">INFORME<br/><span className="text-indigo-600">EJECUTIVO</span></h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">Estado de la Comisión</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-5xl font-black text-slate-200">2026</p>
                  <p className="font-bold text-slate-900 uppercase text-xs tracking-widest mt-1">{new Date().toLocaleDateString()}</p>
               </div>
            </div>

            {/* EXECUTIVE SUMMARY CARDS */}
            <div className="grid grid-cols-2 gap-6 mb-12">
               <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative overflow-hidden">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Saldo Líquido</p>
                  <p className={`text-5xl font-black relative z-10 ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{balance.toLocaleString()}€</p>
                  <Wallet className="text-slate-200 absolute -right-4 -bottom-4 rotate-12" size={80} />
               </div>
               <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative overflow-hidden">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Ejecución Gasto</p>
                  <p className="text-5xl font-black text-slate-800 relative z-10">{totalExpense.toLocaleString()}€</p>
                  <TrendingUp className="text-slate-200 absolute -right-4 -bottom-4 rotate-12" size={80} />
               </div>
            </div>

            {/* CHART 1: BUDGET DEVIATION */}
            <div className="mb-12">
               <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={20}/> Análisis de Desviación Presupuestaria</h3>
               <div className="h-64 w-full border-l-2 border-b-2 border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={expensesByCategory} layout="vertical" margin={{ left: 40, right: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <Bar dataKey="value" name="Gastado" stackId="a" fill="#6366f1" barSize={20} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="remaining" name="Disponible" stackId="a" fill="#e2e8f0" barSize={20} radius={[0, 4, 4, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* CHART 2: MEMBER DEBT & CASH FLOW */}
            <div className="grid grid-cols-2 gap-8 mb-12">
               <div>
                   <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2"><User size={16}/> Estado de Cuotas</h3>
                   <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
                       <div className="w-32 h-32 relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie data={[{name: 'Pagado', value: paidMembers}, {name: 'Pendiente', value: unpaidMembers}]} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                       <Cell fill="#10b981" />
                                       <Cell fill="#ef4444" />
                                   </Pie>
                               </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-slate-400">{collectionRate.toFixed(0)}%</div>
                       </div>
                       <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pendiente de Cobro</p>
                           <p className="text-2xl font-black text-rose-500">{pendingCollection.toLocaleString()}€</p>
                           <p className="text-[9px] font-bold text-slate-400 mt-1">{unpaidMembers} socios morosos</p>
                       </div>
                   </div>
               </div>

               <div>
                   <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2"><Activity size={16}/> Flujo de Caja</h3>
                   <div className="h-40 w-full bg-slate-50 rounded-3xl p-4 border border-slate-100">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={cashFlowData}>
                               <defs>
                                   <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                   <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                               </defs>
                               <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
                               <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
            </div>
         </div>

         {/* FOOTER OFICIAL */}
         <div className="text-center pt-8 border-t border-slate-200">
            <div className="flex justify-center gap-8 mb-4">
                <div className="w-40 border-t border-slate-400 pt-2 text-[10px] font-bold uppercase text-slate-500">Firma Presidente</div>
                <div className="w-40 border-t border-slate-400 pt-2 text-[10px] font-bold uppercase text-slate-500">Firma Tesorero</div>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Documento Confidencial • Falla Eduardo Merello 2026</p>
         </div>
      </div>
    </div>
  );
};
