import React from 'react';
import { Check, X, PlusCircle, Trash2 } from 'lucide-react';
import { Plan, Supplier, CatalogItem } from '../../types';

interface Props {
    isCheckoutOpen: boolean;
    setIsCheckoutOpen: (v: boolean) => void;
    activePlan: Plan;
    activePlanTotal: number;
    suppliers: Supplier[];
    selectedSupplierId: string;
    setSelectedSupplierId: (id: string) => void;
    handleFinalize: () => void;
    isCatalogManagerOpen: boolean;
    setIsCatalogManagerOpen: (v: boolean) => void;
    newCatItem: Omit<CatalogItem, 'id'>;
    setNewCatItem: (item: Omit<CatalogItem, 'id'>) => void;
    handleAddCatalogItem: () => void;
    catalog: CatalogItem[];
    onUpdateCatalog: (items: CatalogItem[]) => void;
}

export const PurchaseModals: React.FC<Props> = ({
    isCheckoutOpen, setIsCheckoutOpen, activePlan, activePlanTotal, suppliers, selectedSupplierId, setSelectedSupplierId, handleFinalize,
    isCatalogManagerOpen, setIsCatalogManagerOpen, newCatItem, setNewCatItem, handleAddCatalogItem, catalog, onUpdateCatalog
}) => {
    return (
        <>
            {/* 1. CHECKOUT MODAL */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[48px] p-8 md:p-10 w-full max-w-lg shadow-2xl border-8 border-slate-900 space-y-6 md:space-y-8 max-h-[90vh] overflow-y-auto">
                        <div className="text-center">
                            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-2">Confirmar Envío</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">El pedido pasará a estado "Pendiente de Recepción"</p>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                <span>Referencias Totales</span>
                                <span>{activePlan.items.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                <span>Unidades Totales</span>
                                <span>{activePlan.items.reduce((a: number, b) => a + b.quantity, 0)}</span>
                            </div>
                            <div className="w-full h-px bg-slate-200 my-2"></div>
                            <div className="flex justify-between items-center text-xl font-black text-slate-900">
                                <span>Coste Estimado</span>
                                <span>{activePlanTotal.toFixed(2)}€</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Proveedor Asignado</label>
                            <select
                                value={selectedSupplierId}
                                onChange={e => setSelectedSupplierId(e.target.value)}
                                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-colors text-sm"
                            >
                                <option value="">Seleccionar Proveedor...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200">Volver</button>
                            <button
                                onClick={handleFinalize}
                                disabled={!selectedSupplierId}
                                className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Check size={16} /> Finalizar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. CATALOG MANAGER */}
            {isCatalogManagerOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[48px] w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden border-8 border-slate-900">
                        <div className="p-6 md:p-8 border-b bg-slate-50 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Maestro de Productos</h3>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Base de datos de artículos</p>
                            </div>
                            <button onClick={() => setIsCatalogManagerOpen(false)} className="p-3 md:p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X size={24} /></button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* ADD FORM */}
                            <div className="w-full md:w-80 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 overflow-y-auto shrink-0">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2"><PlusCircle size={14} /> Alta Rápida</h4>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nombre</label>
                                        <input value={newCatItem.name} onChange={e => setNewCatItem({ ...newCatItem, name: e.target.value })} placeholder="Ej. Ron Barceló" className="w-full p-3 bg-white border rounded-xl font-bold text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Precio x Defecto</label>
                                        <div className="relative">
                                            <input type="number" step="0.01" value={newCatItem.defaultPrice} onChange={e => setNewCatItem({ ...newCatItem, defaultPrice: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-white border rounded-xl font-black text-lg outline-none focus:border-indigo-500" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-slate-300">€</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Unidad</label>
                                            <select
                                                value={newCatItem.unit}
                                                onChange={e => setNewCatItem({ ...newCatItem, unit: e.target.value })}
                                                className="w-full p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                                            >
                                                <option value="u">Unidades</option>
                                                <option value="kg">Kilos</option>
                                                <option value="L">Litros</option>
                                                <option value="cajas">Cajas</option>
                                                <option value="packs">Packs</option>
                                                <option value="botellas">Botellas</option>
                                                <option value="barriles">Barriles</option>
                                                <option value="latas">Latas</option>
                                                <option value="bolsas">Bolsas</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Categoría</label>
                                            <input value={newCatItem.category} onChange={e => setNewCatItem({ ...newCatItem, category: e.target.value })} placeholder="Bebida" className="w-full p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-indigo-500" />
                                        </div>
                                    </div>
                                    <button onClick={handleAddCatalogItem} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg mt-4 hover:bg-indigo-700 transition-all">Guardar</button>
                                </div>
                            </div>

                            {/* LIST */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(catalog as CatalogItem[]).map(item => (
                                        <div key={item.id} className="p-4 border rounded-2xl flex justify-between items-center group hover:border-indigo-300 transition-all">
                                            <div>
                                                <p className="font-black text-slate-800 text-sm italic uppercase">{item.name}</p>
                                                <div className="flex gap-2 items-center mt-1">
                                                    <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">{item.category}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{item.unit} • {item.defaultPrice}€</span>
                                                </div>
                                            </div>
                                            <button onClick={() => onUpdateCatalog(catalog.filter(i => i.id !== item.id))} className="p-3 text-slate-200 hover:text-rose-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
