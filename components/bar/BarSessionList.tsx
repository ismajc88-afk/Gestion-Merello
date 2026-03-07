import React from 'react';
import { Plus, Calculator, Activity, History } from 'lucide-react';
import { AppData, BarSession } from '../../types';
import { BarActiveSession } from './BarActiveSession';

interface Props {
    sessions: BarSession[];
    activeSessionId: string | null;
    setActiveSessionId: (id: string | null) => void;
    viewMode: 'ACTIVE' | 'HISTORY';
    setViewMode: (mode: 'ACTIVE' | 'HISTORY') => void;
    setShowNewSession: (show: boolean) => void;
    onUpdateSession: (s: BarSession) => void;
    onCloseSession: () => void;
    onUpdateStock: (id: string, qty: number) => void;
    onAddTransaction: (t: any) => void;
    data: AppData;
    selectedHistoryId: string | null;
    setSelectedHistoryId: (id: string | null) => void;
}

export const BarSessionList: React.FC<Props> = ({
    sessions, activeSessionId, setActiveSessionId, viewMode, setViewMode, setShowNewSession,
    onUpdateSession, onCloseSession, onUpdateStock, onAddTransaction, data,
    selectedHistoryId, setSelectedHistoryId
}) => {
    const closedSessions = sessions.filter(s => s.isClosed);

    return (
        <div className="lg:col-span-8 space-y-4 md:space-y-6">

            {/* TAB NAVIGATION */}
            <div className="flex justify-between items-center px-2 md:px-4 mb-2">
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                    <button
                        onClick={() => setViewMode('ACTIVE')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all text-center ${viewMode === 'ACTIVE' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Activas
                    </button>
                    <button
                        onClick={() => setViewMode('HISTORY')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all text-center ${viewMode === 'HISTORY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Histórico
                    </button>
                </div>
                {viewMode === 'ACTIVE' && (
                    <button onClick={() => setShowNewSession(true)} className="hidden md:flex px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] items-center gap-2 hover:bg-indigo-600 shadow-xl transition-all">
                        <Plus size={16} /> Abrir Nueva Caja
                    </button>
                )}
            </div>

            {/* MOBILE ADD BUTTON */}
            {viewMode === 'ACTIVE' && (
                <button onClick={() => setShowNewSession(true)} className="md:hidden w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2">
                    <Plus size={16} /> Abrir Nueva Caja
                </button>
            )}

            {/* CONTENT AREA */}
            <div className="space-y-4">

                {/* ACTIVE VIEW */}
                {viewMode === 'ACTIVE' && (
                    <>
                        {sessions.filter(s => !s.isClosed).length === 0 ? (
                            <div className="py-20 text-center opacity-30 border-4 border-dashed border-slate-100 rounded-[48px]">
                                <Calculator size={64} className="mx-auto mb-4" />
                                <p className="font-black uppercase tracking-widest text-xs">No hay barras abiertas ahora mismo</p>
                            </div>
                        ) : (
                            sessions.filter(s => !s.isClosed).map(s => {
                                const isActive = activeSessionId === s.id;
                                const sessionBottleCost = s.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0);
                                const sessionOpsCost = (s.staffExpenses || 0) + (s.otherExpenses || 0);
                                const sessionNet = s.revenue - sessionBottleCost - sessionOpsCost;

                                return (
                                    <div key={s.id} className={`p-5 md:p-8 rounded-[32px] md:rounded-[48px] border-2 transition-all relative ${isActive ? 'bg-white border-indigo-500 shadow-2xl scale-[1.01] z-10' : 'bg-white border-slate-100 hover:border-indigo-200 cursor-pointer'}`} onClick={() => setActiveSessionId(s.id)}>
                                        {/* SESSION CARD HEADER */}
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all bg-indigo-50 text-indigo-600">
                                                    <Activity size={24} className="animate-pulse md:w-8 md:h-8" />
                                                </div>
                                                <div className="flex-1 md:flex-auto">
                                                    <h4 className="font-black text-slate-900 text-lg md:text-2xl tracking-tighter mb-1 uppercase italic truncate max-w-[200px] md:max-w-none">{s.notes}</h4>
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</span>
                                                        <span className="text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-700">Abierta</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 md:gap-6 flex-1 w-full md:w-auto px-2 md:px-6 border-t md:border-t-0 md:border-x border-slate-50 pt-4 md:pt-0">
                                                <div className="text-center">
                                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Caja Bruta</p>
                                                    <p className="text-lg md:text-xl font-black text-slate-800 tabular-nums">{s.revenue}€</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Coste Género</p>
                                                    <p className="text-lg md:text-xl font-black text-rose-500 tabular-nums">{sessionBottleCost.toFixed(0)}€</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Beneficio Neto</p>
                                                    <p className={`text-lg md:text-xl font-black tabular-nums ${sessionNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{sessionNet.toFixed(0)}€</p>
                                                </div>
                                            </div>
                                        </div>

                                        {isActive && (
                                            <BarActiveSession
                                                session={s}
                                                data={data}
                                                onUpdateSession={onUpdateSession}
                                                onCloseSession={onCloseSession}
                                                onUpdateStock={onUpdateStock}
                                                onAddTransaction={onAddTransaction}
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </>
                )}

                {/* HISTORY VIEW */}
                {viewMode === 'HISTORY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {closedSessions.slice().reverse().map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedHistoryId(s.id)}
                                className={`p-6 rounded-[32px] border-2 text-left transition-all ${selectedHistoryId === s.id ? 'bg-white border-indigo-500 shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg uppercase italic">{s.notes}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-2 bg-slate-100 rounded-xl text-slate-400"><History size={18} /></div>
                                </div>
                                <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Beneficio</p>
                                        <p className="text-xl font-black text-emerald-600 tabular-nums">
                                            {(s.revenue - s.consumptions.reduce((a, c) => a + (c.quantity * c.costAtMoment), 0) - (s.staffExpenses || 0) - (s.otherExpenses || 0)).toFixed(0)}€
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Caja</p>
                                        <p className="text-lg font-black text-slate-800 tabular-nums">{s.revenue}€</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {closedSessions.length === 0 && (
                            <div className="col-span-full py-20 text-center opacity-30">
                                <History size={48} className="mx-auto mb-4 text-slate-400" />
                                <p className="font-black uppercase tracking-widest text-slate-400">Sin historial disponible</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
