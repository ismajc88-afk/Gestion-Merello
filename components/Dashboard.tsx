
import React, { useState, useEffect, useMemo } from 'react';
import { AppData, TransactionType, ShiftTime, UserRole, KioskWorkload } from '../types';
import {
    ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
    Wallet, Clock, Utensils, Beer, AlertTriangle, Check,
    Siren, Home, Flame, BatteryMedium, BatteryFull, Package,
    TrendingUp, BarChart3, Eye, EyeOff, Calendar, Users, Settings
} from 'lucide-react';

interface Props {
    data: AppData;
    onResolveIncident?: (id: string, status?: string) => void;
    userRole?: UserRole;
    kioskStatus?: { VENTA: KioskWorkload, CASAL: KioskWorkload };
}

export const Dashboard: React.FC<Props> = ({ data, onResolveIncident, userRole }) => {
    const {
        transactions = [],
        budgetLimit = 0,
        tasks = [],
        shoppingList = [],
        orders = [],
        shifts = [],
        mealEvents = [],
        incidents = [],
        stock = [],
        kioskStatus
    } = data;

    const [healthScore, setHealthScore] = useState(0);
    const isFallero = userRole === 'FALLERO';
    const isAdmin = userRole === 'ADMIN' || userRole === 'PRESIDENTE';

    // --- WIDGET VISIBILITY (stored in localStorage) ---
    const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem('merello_dashboard_widgets');
            return saved ? JSON.parse(saved) : { weekly: true, prediction: true, budget: true, sessions: true };
        } catch { return { weekly: true, prediction: true, budget: true, sessions: true }; }
    });
    const [showWidgetConfig, setShowWidgetConfig] = useState(false);
    const toggleWidget = (key: string) => {
        const next = { ...widgetVisibility, [key]: !widgetVisibility[key] };
        setWidgetVisibility(next);
        localStorage.setItem('merello_dashboard_widgets', JSON.stringify(next));
    };

    // ... (rest of stats calculation remains unchanged)

    const stats = useMemo(() => {
        const totalActual = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => acc + t.amount, 0);

        const globalCap = budgetLimit || 1;

        const taskProgress = tasks.length > 0 ? (tasks.filter(t => t.isCompleted).length / tasks.length) : 0;
        const budgetUsage = totalActual / globalCap;
        const shoppingProgress = shoppingList.length > 0 ? (shoppingList.filter(i => i.checked).length / shoppingList.length) : 0;
        const deliveryProgress = orders.length > 0 ? (orders.filter(o => o.status === 'RECEIVED').length / orders.length) : 0;

        const totalShifts = shifts.length || 1;
        const coveredShifts = shifts.filter((s) => s.assignedMembers.length > 0).length || 0;
        const personnelHealth = (coveredShifts / totalShifts) * 100;

        const healthData = [
            { subject: 'Econ', A: Math.max(0, 100 - (budgetUsage * 100)), full: 100 },
            { subject: 'Tareas', A: taskProgress * 100, full: 100 },
            { subject: 'Stock', A: shoppingProgress * 100, full: 100 },
            { subject: 'Envios', A: deliveryProgress * 100, full: 100 },
            { subject: 'Staff', A: personnelHealth, full: 100 },
        ];

        const score = Math.round(healthData.reduce((acc, d) => acc + d.A, 0) / healthData.length);
        const remainingBudget = globalCap - totalActual;

        const nextMeal = mealEvents
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .find(m => new Date(m.date) >= new Date(new Date().setHours(0, 0, 0, 0)));

        const now = new Date();
        const hour = now.getHours();
        let currentType = ShiftTime.MORNING;
        if (hour >= 15 && hour < 20) currentType = ShiftTime.AFTERNOON;
        if (hour >= 20 || hour < 2) currentType = ShiftTime.NIGHT;

        const todayStr = now.toISOString().split('T')[0];
        const nextShift = shifts.find(s => s.date === todayStr && s.time === currentType) ||
            shifts.find(s => s.date >= todayStr);

        return {
            healthData, score, nextMeal, nextShift, remainingBudget
        };
    }, [transactions, budgetLimit, tasks, shoppingList, orders, shifts, mealEvents]);

    const sortedIncidents = useMemo(() => {
        return incidents.filter(i => i.status === 'OPEN').sort((a, b) => {
            if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
            if (a.priority !== 'URGENT' && b.priority === 'URGENT') return 1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }, [incidents]);

    const lowStockItems = useMemo(() =>
        stock.filter(s => s.minStock > 0 && s.quantity <= s.minStock),
        [stock]);

    const pendingApprovals = useMemo(() => {
        return incidents.filter(i => i.status === 'PENDING_APPROVAL');
    }, [incidents]);

    useEffect(() => {
        const timer = setTimeout(() => setHealthScore(stats.score), 500);
        return () => clearTimeout(timer);
    }, [stats.score]);

    // --- RESUMEN SEMANAL ---
    const weeklyStats = useMemo(() => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);
        const weekTx = transactions.filter(t => new Date(t.date) >= weekStart);
        const expenses = weekTx.filter(t => t.type === TransactionType.EXPENSE).reduce((a, t) => a + t.amount, 0);
        const income = weekTx.filter(t => t.type === TransactionType.INCOME).reduce((a, t) => a + t.amount, 0);
        const weekIncidents = incidents.filter(i => new Date(i.timestamp) >= weekStart).length;
        const weekTasks = tasks.filter(t => t.isCompleted).length;
        return { expenses, income, balance: income - expenses, incidents: weekIncidents, tasksCompleted: weekTasks };
    }, [transactions, incidents, tasks]);

    // --- PREDICCIÓN DE CONSUMO ---
    const stockPredictions = useMemo(() => {
        const now = new Date();
        return stock
            .filter(s => s.quantity > 0 && s.minStock > 0)
            .map(s => {
                const logs = (data.auditLog || []).filter(l => l.module === 'stock' && l.detail?.includes(s.name) && l.action === 'STOCK_ACTUALIZADO');
                if (logs.length < 2) return { ...s, daysLeft: null, dailyUsage: 0 };
                const sorted = logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const firstLog = new Date(sorted[0].timestamp);
                const daysSinceFirst = Math.max(1, (now.getTime() - firstLog.getTime()) / (1000 * 60 * 60 * 24));
                const dailyUsage = logs.length / daysSinceFirst;
                const daysLeft = dailyUsage > 0 ? Math.round(s.quantity / dailyUsage) : null;
                return { ...s, daysLeft, dailyUsage: +dailyUsage.toFixed(1) };
            })
            .filter(s => s.daysLeft !== null && s.daysLeft < 14)
            .sort((a, b) => (a.daysLeft || 999) - (b.daysLeft || 999))
            .slice(0, 6);
    }, [stock, data.auditLog]);

    // --- PRESUPUESTO REAL vs ESTIMADO ---
    const budgetComparison = useMemo(() => {
        return (data.budgetLines || []).map(line => {
            const actual = transactions
                .filter(t => t.type === TransactionType.EXPENSE && t.category === line.category)
                .reduce((a, t) => a + t.amount, 0);
            const pct = line.estimated > 0 ? Math.round((actual / line.estimated) * 100) : 0;
            return { category: line.category, estimated: line.estimated, actual, pct };
        }).filter(l => l.estimated > 0);
    }, [data.budgetLines, transactions]);

    // --- HISTORIAL DE SESIONES ---
    const sessionHistory = useMemo(() => {
        return (data.auditLog || [])
            .filter(l => l.action === 'CONFIG_CAMBIADA' || l.action === 'LOGÍSTICA_ENTREGA' || l.action === 'GASTO_AÑADIDO' || l.action === 'INGRESO_AÑADIDO' || l.action === 'STOCK_ACTUALIZADO' || l.action === 'PRODUCTO_AÑADIDO')
            .slice(0, 20)
            .reduce((acc, log) => {
                const dateKey = new Date(log.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                const existing = acc.find(a => a.role === log.userRole && a.date === dateKey);
                if (existing) { existing.actions++; }
                else { acc.push({ role: log.userRole, date: dateKey, time: new Date(log.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), actions: 1 }); }
                return acc;
            }, [] as { role: string; date: string; time: string; actions: number }[])
            .slice(0, 8);
    }, [data.auditLog]);

    const getWorkloadConfig = (status: KioskWorkload) => {
        switch (status) {
            case 'ALTA': return {
                color: 'text-rose-600',
                bg: 'bg-rose-50 border-rose-200',
                iconBg: 'bg-rose-100 text-rose-600',
                label: 'ALTA DEMANDA',
                percentage: 100,
                barColor: 'bg-rose-500',
                animate: true
            };
            case 'NORMAL': return {
                color: 'text-blue-600',
                bg: 'bg-white border-slate-200',
                iconBg: 'bg-blue-50 text-blue-600',
                label: 'NORMAL',
                percentage: 60,
                barColor: 'bg-blue-500',
                animate: false
            };
            default: return {
                color: 'text-emerald-600',
                bg: 'bg-white border-slate-200',
                iconBg: 'bg-emerald-50 text-emerald-600',
                label: 'TRANQUILO',
                percentage: 25,
                barColor: 'bg-emerald-500',
                animate: false
            };
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 pb-24">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3 relative z-10">
                        {isFallero ? 'Mi Zona' : 'Centro de Mando'}
                        <div className="hidden md:flex items-center text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full not-italic">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                            Sistema Operativo
                        </div>
                    </h1>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">
                        Estado de la Falla: <span className="text-emerald-600">En Marcha</span>
                    </p>
                </div>
                {!isFallero && (
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-3 relative z-20">
                        <button onClick={() => setShowWidgetConfig(!showWidgetConfig)} className={`p-3 rounded-2xl border-2 transition-all cursor-pointer shadow-sm active:scale-95 ${showWidgetConfig ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/30' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-500'}`} title="Personalizar Dashboard">
                            <Settings size={18} />
                        </button>
                        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl flex items-center gap-6 min-w-[260px]">
                            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Arqueo Actual Total</p>
                                <p className="text-2xl font-black tabular-nums tracking-tighter">
                                    {transactions.reduce((acc, t) => t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL DE ALERTAS ROJAS (100% SEGURO) */}
            {!isFallero && lowStockItems.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-3xl shadow-sm flex items-start md:items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg animate-pulse hidden md:block">
                        <Siren size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-rose-800 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} className="md:hidden" />
                            Avisos Críticos de Logística ({lowStockItems.length})
                        </h3>
                        <p className="text-rose-600/80 text-xs font-bold mt-1">El stock de los siguientes productos ha caído por debajo del mínimo de seguridad establecido. Se requiere reposición urgente en almacén.</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {lowStockItems.map(item => (
                                <span key={item.id} className="bg-white text-rose-700 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl border border-rose-200 shadow-sm flex items-center gap-1">
                                    <Package size={12} /> {item.name}: {item.quantity}{item.unit}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. PENDING APPROVALS (TOP PRIORITY FOR ADMIN) */}
            {isAdmin && pendingApprovals.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-md overflow-hidden relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <div className="p-4 border-b border-orange-100 bg-orange-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-orange-700">
                            <Siren size={20} className="animate-pulse" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Solicitudes por Aprobar ({pendingApprovals.length})</h3>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                        {pendingApprovals.map((inc) => (
                            <div key={inc.id} className="p-3 mb-2 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{inc.title.replace('🔓 APROBACIÓN REQUERIDA:', '').trim()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{inc.terminal} • {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {inc.requestedBy}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pl-12 flex gap-2">
                                    <button
                                        onClick={() => onResolveIncident?.(inc.id, 'OPEN')}
                                        className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        Aprobar Pedido
                                    </button>
                                    <button
                                        onClick={() => onResolveIncident?.(inc.id, 'ARCHIVED')}
                                        className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase hover:bg-slate-200 transition-colors"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. BARRA STATUS (STACKED ON MOBILE) */}
            {kioskStatus && !isFallero && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {[
                        { id: 'VENTA', title: 'Barra Venta', icon: Beer, data: kioskStatus.VENTA },
                        { id: 'CASAL', title: 'Barra Casal', icon: Home, data: kioskStatus.CASAL },
                    ].map((bar) => {
                        const config = getWorkloadConfig(bar.data);
                        return (
                            <div key={bar.id} className={`p-4 md:p-6 rounded-2xl md:rounded-[32px] border-2 shadow-sm flex flex-col gap-3 transition-all ${config.bg}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 md:p-3 rounded-xl ${config.iconBg}`}>
                                            <bar.icon size={20} className={config.animate ? 'animate-bounce' : ''} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-sm md:text-lg uppercase italic">{bar.title}</h3>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</p>
                                        </div>
                                    </div>
                                    {config.animate && <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>}
                                </div>
                                <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${config.barColor}`} style={{ width: `${config.percentage}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 4b. ALERTA STOCK MíNIMO */}
            {!isFallero && lowStockItems.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-orange-100 bg-orange-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-orange-700">
                            <Package size={20} className="animate-pulse" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Stock Bajo Mínimo ({lowStockItems.length} art.)</h3>
                        </div>
                    </div>
                    <div className="p-3 grid grid-cols-1 gap-2">
                        {lowStockItems.slice(0, 5).map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                                        <Package size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{item.name}</span>
                                </div>
                                <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                                    {item.quantity} / {item.minStock} {item.unit}
                                </span>
                            </div>
                        ))}
                        {lowStockItems.length > 5 && (
                            <p className="text-center text-xs text-slate-400 font-bold pt-1">+{lowStockItems.length - 5} más con stock bajo</p>
                        )}
                    </div>
                </div>
            )}

            {/* 4. INCIDENTS (MOBILE FIRST LIST) */}
            {!isFallero && sortedIncidents.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-rose-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-rose-700">
                            <Siren size={20} className="animate-pulse" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Alertas Activas ({sortedIncidents.length})</h3>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                        {sortedIncidents.map((inc) => (
                            <div key={inc.id} className="p-3 mb-2 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-2 rounded-xl shrink-0 ${inc.priority === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-800 truncate">{inc.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{inc.terminal || 'Sistema'} • {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onResolveIncident?.(inc.id, 'RESOLVED')}
                                    className="p-2 bg-slate-900 text-white rounded-xl shadow-md active:scale-95"
                                >
                                    <Check size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. MAIN METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

                {/* RADAR CHART */}
                {!isFallero && (
                    <div className="bg-[#09090b] rounded-3xl md:rounded-[40px] p-6 text-white shadow-xl relative overflow-hidden border-4 border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Salud Operativa</h3>
                            <span className="text-2xl font-black text-white">{healthScore}%</span>
                        </div>
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={stats.healthData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <Radar name="Salud" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* NEXT SHIFT */}
                <div className="bg-white rounded-3xl md:rounded-[40px] p-6 border-2 border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Próximo Turno</p>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 italic tracking-tighter">{stats.nextShift?.time.split('(')[0] || 'Descanso'}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Clock size={20} /></div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[120px]">
                        {stats.nextShift?.assignedMembers.length ? stats.nextShift.assignedMembers.map((m, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">{m.charAt(0)}</div>
                                <span className="text-xs font-bold text-slate-700 truncate">{m}</span>
                            </div>
                        )) : <p className="text-xs text-slate-400 italic">Nadie asignado aún</p>}
                    </div>
                </div>

                {/* NEXT MEAL */}
                <div className="bg-white rounded-3xl md:rounded-[40px] p-6 border-2 border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Próxima Comida</p>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 italic tracking-tighter truncate max-w-[180px]">{stats.nextMeal?.name || 'Sin plan'}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Utensils size={20} /></div>
                    </div>
                    {stats.nextMeal && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-600 border-b border-slate-100 pb-2">
                                <span>Fecha</span>
                                <span>{new Date(stats.nextMeal.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold text-center">
                                {stats.nextMeal.ingredients.length} Ingredientes listos
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. WIDGET CONFIGURATOR */}
            {showWidgetConfig && !isFallero && (
                <div className="bg-white rounded-3xl border-2 border-indigo-200 p-5 shadow-sm animate-in slide-in-from-top-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2"><Settings size={14} /> Personalizar Dashboard</h3>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { key: 'weekly', label: 'Resumen Semanal' },
                            { key: 'prediction', label: 'Predicción Consumo' },
                            { key: 'budget', label: 'Presupuesto Real vs Estimado' },
                            { key: 'sessions', label: 'Historial Sesiones' },
                        ].map(w => (
                            <button key={w.key} onClick={() => toggleWidget(w.key)} className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${widgetVisibility[w.key] ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                                {widgetVisibility[w.key] ? <Eye size={14} /> : <EyeOff size={14} />}
                                {w.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 6. RESUMEN SEMANAL */}
            {!isFallero && widgetVisibility.weekly && (
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 opacity-10"><Calendar size={120} /></div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4 flex items-center gap-2"><Calendar size={14} /> Resumen de esta Semana</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-blue-200 uppercase">Gastos</p>
                            <p className="text-xl font-black mt-1">{weeklyStats.expenses.toLocaleString()}€</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-blue-200 uppercase">Ingresos</p>
                            <p className="text-xl font-black mt-1">{weeklyStats.income.toLocaleString()}€</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-blue-200 uppercase">Balance</p>
                            <p className={`text-xl font-black mt-1 ${weeklyStats.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{weeklyStats.balance >= 0 ? '+' : ''}{weeklyStats.balance.toLocaleString()}€</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-blue-200 uppercase">Incidencias</p>
                            <p className="text-xl font-black mt-1">{weeklyStats.incidents}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-blue-200 uppercase">Tareas hechas</p>
                            <p className="text-xl font-black mt-1">{weeklyStats.tasksCompleted}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. PREDICCIÓN DE CONSUMO */}
            {!isFallero && widgetVisibility.prediction && stockPredictions.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2"><TrendingUp size={16} className="text-amber-500" /> Predicción de Consumo</h3>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Basado en historial</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stockPredictions.map(item => (
                            <div key={item.id} className={`p-4 rounded-2xl border-2 ${(item.daysLeft || 99) <= 3 ? 'border-rose-200 bg-rose-50' : (item.daysLeft || 99) <= 7 ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-sm uppercase text-slate-800 truncate">{item.name}</h4>
                                    <span className={`text-xs font-black px-2 py-1 rounded-full ${(item.daysLeft || 99) <= 3 ? 'bg-rose-500 text-white' : (item.daysLeft || 99) <= 7 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {item.daysLeft}d
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500">Stock actual: {item.quantity} {item.unit}</p>
                                <p className="text-[10px] font-bold text-slate-400">Uso estimado: ~{item.dailyUsage} {item.unit}/día</p>
                                <div className="h-1.5 bg-slate-200 rounded-full mt-2">
                                    <div className={`h-full rounded-full ${(item.daysLeft || 99) <= 3 ? 'bg-rose-500' : (item.daysLeft || 99) <= 7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, ((item.daysLeft || 0) / 14) * 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 8. PRESUPUESTO REAL vs ESTIMADO */}
            {!isFallero && widgetVisibility.budget && budgetComparison.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2"><BarChart3 size={16} className="text-indigo-500" /> Presupuesto Real vs Estimado</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {budgetComparison.map(line => (
                            <div key={line.category}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-black uppercase text-slate-700 truncate">{line.category}</span>
                                    <span className={`text-xs font-black ${line.pct > 100 ? 'text-rose-600' : line.pct > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>{line.pct}%</span>
                                </div>
                                <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 bg-indigo-100 rounded-full" style={{ width: '100%' }}></div>
                                    <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${line.pct > 100 ? 'bg-rose-500' : line.pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(line.pct, 100)}%` }}></div>
                                    <div className="absolute inset-0 flex items-center justify-between px-3">
                                        <span className="text-[9px] font-black text-white drop-shadow-sm">{line.actual.toLocaleString()}€</span>
                                        <span className="text-[9px] font-black text-slate-400">{line.estimated.toLocaleString()}€</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 9. HISTORIAL DE SESIONES */}
            {!isFallero && widgetVisibility.sessions && sessionHistory.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2"><Users size={16} className="text-emerald-500" /> Actividad por Usuario</h3>
                    </div>
                    <div className="p-3 space-y-2">
                        {sessionHistory.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">{s.role.slice(0, 3)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-800 uppercase">{s.role}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{s.date} a las {s.time}</p>
                                </div>
                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full shrink-0">{s.actions} acciones</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 10. QUICK FINANCE (Mobile Friendly) */}
            {!isFallero && (
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Caja Disponible</p>
                        <h3 className="text-4xl font-black tabular-nums tracking-tight">{stats.remainingBudget.toLocaleString()}€</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Wallet size={24} />
                    </div>
                </div>
            )}
        </div>
    );
};
