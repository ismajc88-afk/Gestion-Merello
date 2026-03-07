import React from 'react';
import { Plan } from '../../types';
import { PlusCircle, ChevronDown, Trash2, List, Grid } from 'lucide-react';

interface Props {
    plans: Plan[];
    activePlanId: string;
    setActivePlanId: (id: string) => void;
    handleCreatePlan: () => void;
    handleDeletePlan: (id: string) => void;
    budgetImpact: number;
    activePlanTotal: number;
    currentSpent: number;
    totalBudget: number;
    mobileTab: 'ORDER' | 'CATALOG';
    setMobileTab: (tab: 'ORDER' | 'CATALOG') => void;
    activePlan: Plan;
}

export const PurchaseHeader: React.FC<Props> = ({
    plans, activePlanId, setActivePlanId, handleCreatePlan, handleDeletePlan,
    budgetImpact, activePlanTotal, currentSpent, totalBudget, mobileTab, setMobileTab, activePlan
}) => {
    return (
        <>
            {/* 1. DESKTOP HEADER (Full Featured) */}
            <div className="hidden lg:flex flex-row gap-6 shrink-0">
                <div className="flex-1 bg-white p-2 rounded-[28px] border border-slate-200 shadow-sm flex items-center overflow-hidden">
                    <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar px-2">
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setActivePlanId(plan.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all min-w-[160px] border ${activePlanId === plan.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${plan.type === 'BAR' ? 'bg-indigo-500' : 'bg-orange-500'}`}></div>
                                <div className="text-left overflow-hidden">
                                    <p className="text-xs font-black uppercase truncate max-w-[100px]">{plan.name}</p>
                                    <p className="text-[9px] font-bold opacity-60 uppercase">{plan.items.length} Refs</p>
                                </div>
                            </button>
                        ))}
                        <button onClick={handleCreatePlan} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><PlusCircle /></button>
                    </div>
                </div>

                <div className="bg-white px-6 py-4 rounded-[28px] border border-slate-200 shadow-sm flex flex-col justify-center min-w-[280px]">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto Presupuestario</span>
                        <span className={`text-lg font-black ${budgetImpact > 100 ? 'text-rose-500' : 'text-slate-800'}`}>{activePlanTotal.toFixed(2)}€</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-slate-300" style={{ width: `${Math.min((currentSpent / totalBudget) * 100, 100)}%` }}></div>
                        <div className="h-full bg-indigo-500 striped-bar" style={{ width: `${Math.min((activePlanTotal / totalBudget) * 100, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-400">
                        <span>Gastado</span>
                        <span className="text-indigo-500">+ Este Pedido</span>
                    </div>
                </div>
            </div>

            {/* 2. MOBILE HEADER (Compact) */}
            <div className="lg:hidden bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="relative flex-1">
                        <select
                            value={activePlanId}
                            onChange={(e) => {
                                if (e.target.value === 'NEW') handleCreatePlan();
                                else setActivePlanId(e.target.value);
                            }}
                            className="appearance-none bg-slate-100 text-slate-900 font-black text-sm uppercase py-3 pl-4 pr-10 rounded-xl outline-none w-full truncate border-r-8 border-transparent"
                        >
                            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            <option value="NEW">+ Nuevo Borrador</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <button onClick={() => handleDeletePlan(activePlanId)} className="ml-2 p-3 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-xl"><Trash2 size={18} /></button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setMobileTab('ORDER')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'ORDER' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                        <List size={14} /> Pedido ({activePlan.items.length})
                    </button>
                    <button onClick={() => setMobileTab('CATALOG')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'CATALOG' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                        <Grid size={14} /> Catálogo
                    </button>
                </div>

                <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimado</span>
                    <span className="text-sm font-black text-slate-900">{activePlanTotal.toFixed(2)}€</span>
                </div>
            </div>
        </>
    );
};
