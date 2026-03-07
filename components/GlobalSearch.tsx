import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Package, ShoppingCart, User, X, ArrowRight } from 'lucide-react';
import { AppData } from '../types';
import { haptic } from '../utils/haptic';

interface Props {
    data: AppData;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: string) => void;
}

export const GlobalSearch: React.FC<Props> = ({ data, isOpen, onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
        }
    }, [isOpen]);

    const results = useMemo(() => {
        if (!query || query.length < 2) return null;
        const q = query.toLowerCase();

        return {
            stock: data.stock.filter(i => i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)),
            orders: data.orders.filter(o => o.title.toLowerCase().includes(q) || o.supplierName.toLowerCase().includes(q)),
            members: data.members.filter(m => m.name.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q))
        };
    }, [query, data]);

    const hasResults = results && (results.stock.length > 0 || results.orders.length > 0 || results.members.length > 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex items-center gap-4">
                    <Search size={24} className="text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar productos, pedidos, socios..."
                        className="flex-1 text-lg md:text-xl font-medium outline-none placeholder:text-slate-300 text-slate-800 bg-transparent"
                    />
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* RESULTS */}
                <div className="overflow-y-auto p-4 md:p-6 space-y-8 bg-slate-50/50 min-h-[300px]">

                    {!query && (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50 gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                                <Search size={32} className="text-indigo-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">Escribe para buscar en toda la aplicación...</p>
                        </div>
                    )}

                    {query && !hasResults && query.length >= 2 && (
                        <div className="text-center py-10 opacity-50">
                            <p className="font-bold text-slate-400">No hemos encontrado nada con "{query}"</p>
                        </div>
                    )}

                    {results?.stock && results.stock.length > 0 && (
                        <section>
                            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Package size={14} /> Inventario ({results.stock.length})
                            </h4>
                            <div className="grid gap-2">
                                {results.stock.slice(0, 5).map(item => (
                                    <div key={item.id} onClick={() => { onNavigate('stock'); onClose(); haptic.medium(); }} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                                                {item.quantity}u
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{item.name}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">{item.category} • {item.location}</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {results?.orders && results.orders.length > 0 && (
                        <section>
                            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShoppingCart size={14} /> Pedidos ({results.orders.length})
                            </h4>
                            <div className="grid gap-2">
                                {results.orders.slice(0, 5).map(order => (
                                    <div key={order.id} onClick={() => { onNavigate('purchase'); onClose(); haptic.medium(); }} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${order.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.status === 'RECEIVED' ? 'OK' : 'PDT'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{order.title}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">{order.supplierName} • {order.estimatedCost}€</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {results?.members && results.members.length > 0 && (
                        <section>
                            <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <User size={14} /> Socios / Usuarios ({results.members.length})
                            </h4>
                            <div className="grid gap-2">
                                {results.members.slice(0, 5).map(member => (
                                    <div key={member.id} onClick={() => { onNavigate('hr'); onClose(); haptic.medium(); }} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center font-bold text-rose-600 text-xs">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-rose-700 transition-colors">{member.name}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">{member.role}</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

                {/* FOOTER */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Presiona ESC para cerrar
                </div>
            </div>
        </div>
    );
};
