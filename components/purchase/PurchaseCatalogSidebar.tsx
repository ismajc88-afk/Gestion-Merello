import React, { useState } from 'react';
import { Search, Plus, Check, Settings } from 'lucide-react';
import { CatalogItem } from '../../types';

interface Props {
    catalog: CatalogItem[];
    onUpdateCatalog: (newCatalog: CatalogItem[]) => void;
    onAddItem: (item: CatalogItem) => void;
    mobileTab: 'ORDER' | 'CATALOG';
    lastAddedItem: string | null;
    onOpenCatalogManager: () => void;
}

export const PurchaseCatalogSidebar: React.FC<Props> = ({
    catalog, onAddItem, mobileTab, lastAddedItem, onOpenCatalogManager
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const uniqueCategories = Array.from(new Set(catalog.map(c => c.category)));

    const filteredCatalog = catalog
        .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(i => filterCategory === 'ALL' || i.category === filterCategory);

    return (
        <div className={`w-full lg:w-96 bg-slate-900 rounded-[32px] lg:rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/5 ${mobileTab === 'ORDER' ? 'hidden lg:flex' : 'flex flex-1 animate-in slide-in-from-right-4'}`}>
            <div className="p-6 border-b border-white/10 shrink-0">
                <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
                    <Search size={14} className="text-indigo-400" /> Catálogo Maestro
                </h3>
                <div className="relative">
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar producto..."
                        className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                    <button onClick={() => setFilterCategory('ALL')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${filterCategory === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Todo</button>
                    {uniqueCategories.map(c => (
                        <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${filterCategory === c ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{c}</button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar-dark">
                {filteredCatalog.map(item => {
                    const isAdded = lastAddedItem === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onAddItem(item)}
                            className={`w-full p-3 border rounded-xl flex items-center justify-between group transition-all text-left ${isAdded ? 'bg-emerald-500 border-emerald-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div>
                                <p className={`font-bold text-xs line-clamp-1 ${isAdded ? 'text-white' : 'text-slate-200'}`}>{item.name}</p>
                                <p className={`text-[9px] font-black uppercase mt-0.5 ${isAdded ? 'text-emerald-100' : 'text-slate-500'}`}>{item.category} • {item.unit}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-black ${isAdded ? 'text-white' : 'text-indigo-400'}`}>{item.defaultPrice}€</span>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isAdded ? 'bg-white text-emerald-500' : 'bg-indigo-600 text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                                    {isAdded ? <Check size={14} /> : <Plus size={14} />}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                <button onClick={onOpenCatalogManager} className="w-full py-3 bg-white/5 text-slate-400 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                    <Settings size={12} /> Administrar Catálogo
                </button>
            </div>
        </div>
    );
};
