
import React, { useState, useMemo } from 'react';
import { AppData, Transaction, TransactionType, UserRole } from '../types';
import {
    Plus, Wallet, ArrowUpRight, ArrowDownRight, Search,
    Trash2, Filter, Calendar, DollarSign, Download, TrendingUp, TrendingDown,
    PieChart, ArrowRight, FileText, Lock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from 'recharts';
import { usePermissions } from '../hooks/usePermissions';

interface Props {
    data: AppData;
    onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
    userRole: UserRole | null;
}

type TimeFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

export const CashManager: React.FC<Props> = ({ data, onAddTransaction, userRole }) => {
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [cat, setCat] = useState('General');
    const [filter, setFilter] = useState<TimeFilter>('ALL');
    const [search, setSearch] = useState('');

    const { canEdit, canViewSensitive } = usePermissions(data.appConfig, userRole, 'cash');


    // --- FILTERING LOGIC ---
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1)).setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        return data.transactions
            .filter(t => {
                const tDate = new Date(t.date).getTime();
                const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                    t.category.toLowerCase().includes(search.toLowerCase());

                let matchesTime = true;
                if (filter === 'TODAY') matchesTime = tDate >= todayStart;
                if (filter === 'WEEK') matchesTime = tDate >= weekStart;
                if (filter === 'MONTH') matchesTime = tDate >= monthStart;

                return matchesSearch && matchesTime;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [data.transactions, filter, search]);

    // --- CALCULATIONS ---
    const totals = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
        // Global balance is always ALL time, not filtered
        const globalBalance = data.transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0) -
            data.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

        return { income, expense, net: income - expense, globalBalance };
    }, [filteredTransactions, data.transactions]);

    // --- CHART DATA PREP ---
    const chartData = useMemo(() => {
        const grouped: Record<string, { income: number, expense: number }> = {};
        // Show last 7 days of data regardless of filter if 'ALL' or 'WEEK', otherwise limit
        const sourceData = filter === 'TODAY' ? filteredTransactions : data.transactions.slice(-50); // Last 50 txs for trend

        sourceData.forEach(t => {
            const dateKey = new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            if (!grouped[dateKey]) grouped[dateKey] = { income: 0, expense: 0 };
            if (t.type === 'INCOME') grouped[dateKey].income += t.amount;
            else grouped[dateKey].expense += t.amount;
        });

        return Object.entries(grouped).map(([date, vals]) => ({
            date,
            ingresos: vals.income,
            gastos: vals.expense
        })).reverse(); // Re-reverse to show chronological order
    }, [data.transactions, filter, filteredTransactions]);

    const handleTrans = (type: TransactionType) => {
        if (!desc || !amount) return;
        onAddTransaction({
            description: desc,
            amount: parseFloat(amount),
            type,
            category: cat,
            date: new Date().toISOString()
        });
        setDesc(''); setAmount('');
    };

    const exportCSV = () => {
        const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Importe'];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.category,
            `"${t.description}"`, // Quote description to handle commas
            t.amount
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `tesoreria_${filter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-20">

            {/* HEADER: FINANCIAL COCKPIT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Balance Card - Always shows global status */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Saldo Líquido Real</p>
                            {canViewSensitive ? <Wallet className="text-indigo-500" size={24} /> : <Lock className="text-slate-600" size={24} />}
                        </div>
                        <h2 className="text-5xl font-black tracking-tight tabular-nums">
                            {canViewSensitive ? `${totals.globalBalance.toLocaleString()}€` : '****€'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
                            {canViewSensitive ? 'Disponible en Caja' : 'Dato Oculto por Privacidad'}
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12"><DollarSign size={180} /></div>
                </div>

                {/* Period Stats */}
                <div className="md:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                            {['ALL', 'MONTH', 'WEEK', 'TODAY'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as TimeFilter)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {f === 'ALL' ? 'Todo' : f === 'MONTH' ? 'Mes' : f === 'WEEK' ? 'Semana' : 'Hoy'}
                                </button>
                            ))}
                        </div>
                        <button onClick={exportCSV} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 bg-slate-50 rounded-lg">
                            <Download size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ArrowDownRight size={14} className="text-emerald-500" /> Entradas Periodo</p>
                            <p className="text-3xl font-black text-emerald-600 tabular-nums">+{totals.income.toLocaleString()}€</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ArrowUpRight size={14} className="text-rose-500" /> Salidas Periodo</p>
                            <p className="text-3xl font-black text-rose-600 tabular-nums">-{totals.expense.toLocaleString()}€</p>
                        </div>
                    </div>

                    {/* Visual Flux Chart Background */}
                    {canViewSensitive && (
                        <div className="absolute bottom-0 left-0 w-full h-24 opacity-10 pointer-events-none">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <Area type="monotone" dataKey="ingresos" stroke="#10b981" fill="#10b981" strokeWidth={3} />
                                    <Area type="monotone" dataKey="gastos" stroke="#ef4444" fill="#ef4444" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full">

                {/* LEFT: TRANSACTION FEED */}
                <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><FileText size={16} className="text-indigo-500" /> Movimientos</h3>
                        <div className="relative w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredTransactions.map(t => (
                            <div key={t.id} className="p-4 bg-white border border-slate-100 rounded-3xl flex justify-between items-center group hover:border-indigo-200 hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {t.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm leading-tight">{t.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase tracking-wide">{t.category}</span>
                                            <span className="text-[9px] text-slate-300 font-bold flex items-center gap-1"><Calendar size={10} /> {new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`font-black text-lg tabular-nums ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}€
                                </span>
                            </div>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <div className="py-20 text-center opacity-30">
                                <PieChart size={48} className="mx-auto mb-4 text-slate-400" />
                                <p className="font-black uppercase tracking-widest text-slate-400">Sin movimientos</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: QUICK ACTION PANEL */}
                {canEdit && (
                    <div className="w-full lg:w-96 flex flex-col gap-6">
                        <div className="bg-white p-8 rounded-[40px] border-4 border-slate-900 shadow-2xl space-y-6">
                            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest flex items-center gap-2"><Plus size={18} className="bg-slate-900 text-white rounded-full p-0.5" /> Nuevo Asiento</h3>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Concepto</label>
                                    <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej. Lotería Navidad" className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl font-bold outline-none text-slate-800" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Importe</label>
                                    <div className="relative">
                                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-4 pl-6 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl font-black text-4xl outline-none pr-12 text-slate-900" />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">€</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Partida Presupuestaria</label>
                                    <select value={cat} onChange={e => setCat(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none appearance-none cursor-pointer text-xs uppercase">
                                        <option>General</option>
                                        <option>Venta Barra</option>
                                        <option>Lotería</option>
                                        <option>Cuotas</option>
                                        {data.budgetLines.map(l => <option key={l.category} value={l.category}>{l.category}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button onClick={() => handleTrans(TransactionType.INCOME)} className="py-4 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex flex-col items-center gap-1 group">
                                    <ArrowDownRight size={20} className="group-hover:scale-110 transition-transform" /> INGRESO
                                </button>
                                <button onClick={() => handleTrans(TransactionType.EXPENSE)} className="py-4 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex flex-col items-center gap-1 group">
                                    <ArrowUpRight size={20} className="group-hover:scale-110 transition-transform" /> GASTO
                                </button>
                            </div>
                        </div>

                        {/* QUICK STATS */}
                        {canViewSensitive && (
                            <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between h-48 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Tendencia Semanal</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <span className="text-4xl font-black">{chartData.length > 0 ? chartData[chartData.length - 1].ingresos.toFixed(0) : 0}€</span>
                                        <span className="text-xs font-bold text-indigo-200 mb-2">Ingresados hoy</span>
                                    </div>
                                </div>
                                <div className="h-16 w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData.slice(-7)}>
                                            <Bar dataKey="ingresos" fill="#ffffff" opacity={0.3} radius={[4, 4, 4, 4]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
