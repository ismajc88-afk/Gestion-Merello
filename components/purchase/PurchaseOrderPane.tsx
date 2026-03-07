import React, { useMemo } from 'react';
import {
    Printer, MessageCircle, Sparkles, ClipboardList, Tag, AlertCircle, Package, X, Edit3, DollarSign, ArrowRight
} from 'lucide-react';
import { Plan, PlanItem, StockItem } from '../../types';

interface Props {
    activePlan: Plan;
    updateActivePlan: (updates: Partial<Plan>) => void;
    mobileTab: 'ORDER' | 'CATALOG';
    isRenameMode: boolean;
    setIsRenameMode: (v: boolean) => void;
    renameValue: string;
    setRenameValue: (v: string) => void;
    stock: StockItem[];
    handlePrintOrder: () => void;
    handleShareWhatsapp: () => void;
    handleAutoFill: () => void;
    updateItemQuantity: (itemId: string, qty: number) => void;
    setIsCheckoutOpen: (v: boolean) => void;
    activePlanTotal: number;
}

export const PurchaseOrderPane: React.FC<Props> = ({
    activePlan, updateActivePlan, mobileTab, isRenameMode, setIsRenameMode, renameValue, setRenameValue,
    stock, handlePrintOrder, handleShareWhatsapp, handleAutoFill, updateItemQuantity, setIsCheckoutOpen, activePlanTotal
}) => {

    const groupedItems = useMemo((): Record<string, PlanItem[]> => {
        const groups: Record<string, PlanItem[]> = {};
        activePlan.items.forEach((item: PlanItem) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [activePlan.items]);

    return (
        <div className={`flex-1 bg-white rounded-[32px] lg:rounded-[40px] border-2 border-slate-100 shadow-xl flex flex-col overflow-hidden relative ${mobileTab === 'CATALOG' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Toolbar */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                    {isRenameMode ? (
                        <input
                            autoFocus
                            className="text-xl md:text-2xl font-black text-slate-900 bg-transparent outline-none border-b-2 border-indigo-500 w-full md:w-64"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onBlur={() => { updateActivePlan({ name: renameValue || activePlan.name }); setIsRenameMode(false); }}
                            onKeyDown={e => e.key === 'Enter' && setIsRenameMode(false)}
                        />
                    ) : (
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setRenameValue(activePlan.name); setIsRenameMode(true); }}>
                            <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter truncate max-w-[180px] md:max-w-none">{activePlan.name}</h2>
                            <Edit3 size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors hidden md:block" />
                        </div>
                    )}

                    <div className="flex bg-slate-200 p-1 rounded-xl shrink-0 scale-90 md:scale-100 origin-right">
                        <button onClick={() => updateActivePlan({ type: 'BAR' })} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${activePlan.type === 'BAR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Barra</button>
                        <button onClick={() => updateActivePlan({ type: 'CASAL' })} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${activePlan.type === 'CASAL' ? 'bg-orange-50 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Casal</button>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto no-scrollbar hidden md:flex">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-2 shrink-0">
                        <button onClick={handlePrintOrder} disabled={activePlan.items.length === 0} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"><Printer size={18} /></button>
                        <div className="w-px h-6 bg-slate-100 mx-1"></div>
                        <button onClick={handleShareWhatsapp} disabled={activePlan.items.length === 0} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"><MessageCircle size={18} /></button>
                    </div>

                    <button onClick={handleAutoFill} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all font-bold text-[10px] uppercase tracking-widest shrink-0">
                        <Sparkles size={14} /> <span className="hidden sm:inline">Auto-Stock</span>
                    </button>
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 custom-scrollbar">
                {Object.keys(groupedItems).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-4">
                        <ClipboardList size={64} />
                        <p className="font-black uppercase tracking-widest text-sm text-center">Hoja de pedido vacía<br /><span className="text-[10px] font-medium">Añade productos del catálogo</span></p>
                    </div>
                ) : (
                    (Object.entries(groupedItems) as [string, PlanItem[]][]).map(([cat, items]) => (
                        <div key={cat} className="space-y-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 bg-white py-2 z-10 flex items-center gap-2 border-b border-slate-100">
                                <Tag size={12} /> {cat}
                            </h3>
                            {items.map(item => {
                                const stockItem = stock.find(s => s.name.toUpperCase() === item.name.toUpperCase());
                                const stockAlert = stockItem && stockItem.quantity <= stockItem.minStock;

                                return (
                                    <div key={item.id} className="group flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all gap-2">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`p-2 rounded-xl shrink-0 ${stockAlert ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                                                {stockAlert ? <AlertCircle size={16} /> : <Package size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-xs md:text-sm leading-tight truncate">{item.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 truncate">
                                                    {stockItem ? `Stock: ${stockItem.quantity} ${stockItem.unit}` : 'Sin stock registrado'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-0.5">
                                                <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 font-bold transition-colors">-</button>
                                                <input
                                                    type="number"
                                                    className="w-10 text-center font-black text-slate-900 outline-none text-sm bg-transparent"
                                                    value={item.quantity}
                                                    onChange={e => updateItemQuantity(item.id, parseFloat(e.target.value) || 0)}
                                                />
                                                <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 font-bold transition-colors">+</button>
                                            </div>
                                            <div className="text-right w-14 hidden md:block">
                                                <span className="font-bold text-slate-700 w-16 text-right">{(item.unitPrice || 0).toFixed(2)}€</span>
                                            </div>
                                            <button onClick={() => updateItemQuantity(item.id, 0)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 w-full md:w-auto hidden md:flex">
                    <div className="p-3 bg-slate-900 text-white rounded-xl shrink-0"><DollarSign size={20} /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimado</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{activePlanTotal.toFixed(2)}€</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCheckoutOpen(true)}
                    disabled={activePlan.items.length === 0}
                    className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    Emitir Pedido <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};
