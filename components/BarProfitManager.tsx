import React, { useState, useMemo } from 'react';
import { AppData, Transaction, BarSession } from '../types';
import { Plus, X, BarChart2 } from 'lucide-react';
import { BarKPISummary } from './bar/BarKPISummary';
import { BarSessionList } from './bar/BarSessionList';
import { BarHistorySidebar } from './bar/BarHistorySidebar';
import { BarGlobalReport } from './bar/BarGlobalReport';
import { BarProductHistory } from './bar/BarProductHistory';

interface Props {
    data: AppData;
    onUpdateSessions: (sessions: BarSession[]) => void;
    onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
    onUpdateStock: (id: string, newQuantity: number) => void;
}

export const BarProfitManager: React.FC<Props> = ({ data, onUpdateSessions, onAddTransaction, onUpdateStock }) => {
    const [showNewSession, setShowNewSession] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [showGlobalReport, setShowGlobalReport] = useState(false);

    // VIEW MODE
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
    const [mainTab, setMainTab] = useState<'SESSIONS' | 'PRODUCT_HISTORY'>('SESSIONS');

    const [sessionName, setSessionName] = useState('');

    const sessions = data.barSessions || [];
    const closedSessions = useMemo(() => sessions.filter(s => s.isClosed), [sessions]);

    // --- KPI LOGIC ---
    const totalRevenue = closedSessions.reduce((acc, s) => acc + s.revenue, 0);
    const totalBottleCost = closedSessions.reduce((acc, s) => acc + s.consumptions.reduce((sum, c) => sum + (c.quantity * c.costAtMoment), 0), 0);
    const totalOpsExpenses = closedSessions.reduce((acc, s) => acc + (s.staffExpenses || 0) + (s.otherExpenses || 0), 0);
    const netProfit = totalRevenue - totalBottleCost - totalOpsExpenses;
    const globalMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const efficiencyRatio = totalBottleCost > 0 ? (totalRevenue / totalBottleCost).toFixed(2) : '0';

    // --- ADVANCED STATS (Lifted State) ---
    const advancedStats = useMemo(() => {
        const allConsumptions = closedSessions.flatMap(s => s.consumptions);

        const productPerformance: Record<string, { qty: number, cost: number, name: string }> = {};
        allConsumptions.forEach(c => {
            if (!productPerformance[c.name]) productPerformance[c.name] = { qty: 0, cost: 0, name: c.name };
            productPerformance[c.name].qty += c.quantity;
            productPerformance[c.name].cost += (c.quantity * c.costAtMoment);
        });

        const topProducts = Object.values(productPerformance)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        const catBreakdown: Record<string, number> = {};
        allConsumptions.forEach(c => {
            const stockItem = data.stock.find(s => s.id === c.stockItemId) || data.stock.find(s => s.name === c.name);
            const cat = stockItem?.category || 'OTROS';
            if (!catBreakdown[cat]) catBreakdown[cat] = 0;
            catBreakdown[cat] += c.quantity;
        });

        const pieData = Object.entries(catBreakdown).map(([name, value]) => ({ name, value }));

        let runningRevenue = 0;
        let runningProfit = 0;
        const evolutionData = closedSessions.map(s => {
            const sCost = s.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0) + (s.staffExpenses || 0) + (s.otherExpenses || 0);
            const sProfit = s.revenue - sCost;
            runningRevenue += s.revenue;
            runningProfit += sProfit;
            return {
                name: new Date(s.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
                revenue: s.revenue,
                profit: sProfit,
                accumulated: runningProfit
            };
        });

        const totalTickets: Record<string, number> = {};
        closedSessions.forEach(s => {
            if (s.ticketCounts) {
                Object.entries(s.ticketCounts).forEach(([type, count]) => {
                    if (!totalTickets[type]) totalTickets[type] = 0;
                    totalTickets[type] += (count as number);
                });
            }
        });

        return { topProducts, pieData, evolutionData, totalTickets };
    }, [closedSessions, data.stock]);


    const handleCreateSession = () => {
        if (!sessionName) return;
        const newS: BarSession = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            revenue: 0,
            consumptions: [],
            staffExpenses: 0,
            otherExpenses: 0,
            isClosed: false,
            notes: sessionName,
            ticketCounts: {},
            dispensedCounts: {}
        };
        onUpdateSessions([...sessions, newS]);
        setSessionName('');
        setShowNewSession(false);
        setActiveSessionId(newS.id);
    };

    const handleUpdateSession = (updatedSession: BarSession) => {
        onUpdateSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    };

    return (
        <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500 w-full pb-32">

            <BarKPISummary
                efficiencyRatio={efficiencyRatio}
                globalMargin={globalMargin}
                netProfit={netProfit}
                totalRevenue={totalRevenue}
                totalBottleCost={totalBottleCost}
                stockCount={data.stock.filter(i => i.usageType === 'VENTA').length}
                onShowGlobalReport={() => setShowGlobalReport(true)}
                onSetActiveSession={setActiveSessionId}
            />

            {/* TABS */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl self-start">
                <button
                    onClick={() => setMainTab('SESSIONS')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mainTab === 'SESSIONS' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Sesiones
                </button>
                <button
                    onClick={() => setMainTab('PRODUCT_HISTORY')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mainTab === 'PRODUCT_HISTORY' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <BarChart2 size={13} />
                    Historial de ventas
                </button>
            </div>

            {mainTab === 'SESSIONS' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    <BarSessionList
                        sessions={sessions}
                        activeSessionId={activeSessionId}
                        setActiveSessionId={setActiveSessionId}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        setShowNewSession={setShowNewSession}
                        onUpdateSession={handleUpdateSession}
                        onCloseSession={() => setActiveSessionId(null)}
                        onUpdateStock={onUpdateStock}
                        onAddTransaction={onAddTransaction}
                        data={data}
                        selectedHistoryId={selectedHistoryId}
                        setSelectedHistoryId={setSelectedHistoryId}
                    />
                    <BarHistorySidebar
                        selectedHistoryId={selectedHistoryId}
                        closedSessions={closedSessions}
                        data={data}
                        onClose={() => setSelectedHistoryId(null)}
                        advancedStats={advancedStats}
                    />
                </div>
            )}

            {mainTab === 'PRODUCT_HISTORY' && (
                <BarProductHistory
                    barSessions={data.barSessions || []}
                    barPrices={data.appConfig.barPrices}
                />
            )}

            <BarGlobalReport
                isOpen={showGlobalReport}
                onClose={() => setShowGlobalReport(false)}
                advancedStats={advancedStats}
                netProfit={netProfit}
                totalRevenue={totalRevenue}
                totalBottleCost={totalBottleCost}
            />

            {/* MODAL CREAR SESION */}
            {showNewSession && (
                <div className="bg-indigo-50 border-2 border-indigo-100 p-6 md:p-8 rounded-[32px] md:rounded-[40px] animate-in zoom-in-95 duration-300 transition-all fixed inset-0 z-[60] m-auto w-[90%] md:w-[600px] h-fit shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Nueva Referencia de Sesión</p>
                        <button onClick={() => setShowNewSession(false)} className="bg-white text-slate-400 p-2 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <input autoFocus value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Ej: Cena Viernes, Tardeo DJ..." className="w-full p-4 md:p-5 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-300 text-lg" />
                        <button onClick={handleCreateSession} className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
                            <Plus size={16} className="inline mr-2" /> Abrir Caja
                        </button>
                    </div>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-slate-900/40 -z-10 backdrop-blur-sm" onClick={() => setShowNewSession(false)}></div>
                </div>
            )}
        </div>
    );
};
