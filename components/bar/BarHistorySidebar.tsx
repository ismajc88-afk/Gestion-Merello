import React, { useMemo } from 'react';
import { X, Ticket, Snowflake, Trash2, Coins, Siren, Crown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AppData, BarSession } from '../../types';

interface Props {
    selectedHistoryId: string | null;
    closedSessions: BarSession[];
    data: AppData;
    onClose: () => void;
    advancedStats: {
        topProducts: { qty: number, cost: number, name: string }[];
        pieData: { name: string, value: number }[];
    };
}

export const BarHistorySidebar: React.FC<Props> = ({
    selectedHistoryId, closedSessions, data, onClose, advancedStats
}) => {
    const historySession = closedSessions.find(s => s.id === selectedHistoryId);

    // --- HISTORICAL DETAIL LOGIC ---
    const historyIncidents = useMemo(() => {
        if (!historySession) return [];

        const sessionDate = new Date(historySession.date);
        const start = new Date(sessionDate);
        start.setHours(12, 0, 0, 0);
        const end = new Date(sessionDate);
        end.setDate(end.getDate() + 1);
        end.setHours(10, 0, 0, 0);

        return (data.incidents || []).filter(inc => {
            const t = new Date(inc.timestamp);
            return t >= start && t <= end;
        });
    }, [historySession, data.incidents]);

    const historyMetrics = useMemo(() => {
        if (!historySession) return null;
        const bottleCost = historySession.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0);
        const opsCost = (historySession.staffExpenses || 0) + (historySession.otherExpenses || 0);
        const profit = historySession.revenue - bottleCost - opsCost;

        const iceRequests = historyIncidents.filter(i => i.title.toLowerCase().includes('hielo')).length;
        const glassBreak = historyIncidents.filter(i => i.title.toLowerCase().includes('vaso') || i.title.toLowerCase().includes('rotura')).length;
        const changeRequests = historyIncidents.filter(i => i.title.toLowerCase().includes('cambio')).length;
        const urgentCount = historyIncidents.filter(i => i.priority === 'URGENT').length;

        return { bottleCost, opsCost, profit, iceRequests, glassBreak, changeRequests, urgentCount };
    }, [historySession, historyIncidents]);

    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

    return (
        <div className="lg:col-span-4 space-y-6">
            {historySession && historyMetrics ? (
                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-lg sticky top-6 animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-900 uppercase italic">Auditoría Sesión</h3>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X size={16} /></button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 p-6 rounded-[32px] text-white text-center">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Resultado Neto</p>
                            <h4 className="text-5xl font-black tabular-nums">{historyMetrics.profit.toFixed(2)}€</h4>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-black text-slate-500 uppercase">Ingresos</span>
                                <span className="font-black text-emerald-600">+{historySession.revenue}€</span>
                            </div>
                            <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-black text-slate-500 uppercase">Coste Bebida</span>
                                <span className="font-black text-rose-500">-{historyMetrics.bottleCost.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-black text-slate-500 uppercase">Personal/Otros</span>
                                <span className="font-black text-rose-500">-{historyMetrics.opsCost}€</span>
                            </div>
                        </div>

                        {/* VISOR HISTÓRICO DE TICKETS */}
                        {historySession.ticketCounts && Object.keys(historySession.ticketCounts).length > 0 && (
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Ticket size={14} /> Registro de Tickets (Arqueo)
                                </h4>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-40 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-2">
                                        {Object.entries(historySession.ticketCounts).map(([name, count]) => (
                                            <div key={name} className="flex justify-between items-center text-xs border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                                                <span className="font-bold text-slate-700 uppercase">{name}</span>
                                                <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Incidencias Registradas</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-cyan-50 text-cyan-700 rounded-xl text-center">
                                    <Snowflake size={20} className="mx-auto mb-1" />
                                    <span className="block text-xl font-black">{historyMetrics.iceRequests}</span>
                                    <span className="text-[9px] font-bold uppercase">Hielo</span>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-center">
                                    <Trash2 size={20} className="mx-auto mb-1" />
                                    <span className="block text-xl font-black">{historyMetrics.glassBreak}</span>
                                    <span className="text-[9px] font-bold uppercase">Roturas</span>
                                </div>
                                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-center">
                                    <Coins size={20} className="mx-auto mb-1" />
                                    <span className="block text-xl font-black">{historyMetrics.changeRequests}</span>
                                    <span className="text-[9px] font-bold uppercase">Cambio</span>
                                </div>
                                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-center">
                                    <Siren size={20} className="mx-auto mb-1" />
                                    <span className="block text-xl font-black">{historyMetrics.urgentCount}</span>
                                    <span className="text-[9px] font-bold uppercase">Urgencias</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-6">
                            <Crown size={18} className="text-amber-500" /> Top Ventas (Volumen)
                        </h4>
                        <div className="space-y-4">
                            {advancedStats.topProducts.map((p, i) => (
                                <div key={p.name} className="flex items-center gap-4">
                                    <span className="font-black text-slate-300 text-lg w-4">#{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                            <span className="text-slate-700 truncate max-w-[120px]">{p.name}</span>
                                            <span className="text-slate-900">{p.qty}u</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${(p.qty / advancedStats.topProducts[0].qty) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {advancedStats.topProducts.length === 0 && <p className="text-center text-slate-300 text-xs py-4">Sin datos de ventas</p>}
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Mix de Producto</h4>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={advancedStats.pieData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                            {advancedStats.pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#000' }} itemStyle={{ color: '#000', fontWeight: 'bold', fontSize: '10px' }} />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
