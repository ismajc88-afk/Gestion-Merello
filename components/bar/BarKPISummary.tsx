import React from 'react';
import { Scale, Beer, Zap, BarChart3, Printer, Box } from 'lucide-react';

interface Props {
    efficiencyRatio: string;
    globalMargin: number;
    netProfit: number;
    totalRevenue: number;
    totalBottleCost: number;
    stockCount: number;
    onShowGlobalReport: () => void;
    onSetActiveSession: (id: string | null) => void;
}

export const BarKPISummary: React.FC<Props> = ({
    efficiencyRatio,
    globalMargin,
    netProfit,
    totalRevenue,
    totalBottleCost,
    stockCount,
    onShowGlobalReport,
    onSetActiveSession
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-5 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-300 transition-all">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retorno de Inversión (x)</p>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Scale size={18} /></div>
                    </div>
                    <div>
                        <h4 className="text-4xl md:text-5xl font-black text-slate-900 tabular-nums">{efficiencyRatio}<span className="text-xl text-slate-400 ml-1">x</span></h4>
                        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold mt-1 italic">Cada 1€ genera {efficiencyRatio}€.</p>
                    </div>
                </div>
                <div className="pt-6 border-t border-slate-50">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                        <span>Margen Global</span>
                        <span className="text-emerald-600">{globalMargin.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-[#09090b] text-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
                <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Beer size={200} className="md:w-[280px] md:h-[280px]" /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Consolidado Tesorería Barra</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Beneficio Neto Real</p>
                            <h3 className="text-5xl md:text-7xl font-black text-emerald-400 tracking-tighter tabular-nums">{netProfit.toLocaleString()}€</h3>
                        </div>
                        <div className="flex flex-col gap-1 border-l border-white/10 pl-6 pb-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase">Caja Bruta: <span className="text-white">{totalRevenue.toLocaleString()}€</span></p>
                            <p className="text-[9px] font-black text-slate-500 uppercase">Inversión Género: <span className="text-rose-400">{totalBottleCost.toLocaleString()}€</span></p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 md:mt-8 pt-6 border-t border-white/5 relative z-10 flex gap-2 md:gap-4 flex-wrap">
                    <button onClick={onShowGlobalReport} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border border-white/10">
                        <BarChart3 size={16} /> Reporte Completo
                    </button>
                    <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 md:px-6 py-3 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40">
                        <Printer size={16} /> PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-5 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Género en Barra</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-4xl font-black text-slate-900 tabular-nums">
                            {stockCount}
                        </h4>
                        <span className="text-xs font-bold text-slate-400 uppercase">Referencias</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Artículos vinculados al control de costes de esta terminal.</p>
                </div>
                <button onClick={() => onSetActiveSession(null)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[9px] tracking-widest border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                    <Box size={14} /> Ver Inventario Venta
                </button>
            </div>
        </div>
    );
};
