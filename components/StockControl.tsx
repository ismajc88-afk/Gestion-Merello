
import React, { useState, useMemo } from 'react';
import { StockItem, BarSession, Incident, StockCategoryDef, PREDEFINED_STOCK_CATEGORIES } from '../types';
import {
   Package, Plus, Minus, Search, Wine, Utensils,
   Box, Edit3, Trash2, X, Lock,
   BadgeEuro, Save, ShoppingBag, User, Timer,
   BarChart3, TrendingUp, Clock, Zap, AlertTriangle, ArrowRight,
   MoreHorizontal, ChevronDown, Filter, LayoutGrid, List, ShieldAlert,
   Flame, Calendar, Activity
} from 'lucide-react';
import {
   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface Props {
   items: StockItem[];
   categories: string[];
   categoryDefs?: StockCategoryDef[];
   units: string[];
   barSessions?: BarSession[];
   incidents?: Incident[];
   onUpdateStock: (id: string, newQuantity: number) => void;
   onAddItem: (item: Omit<StockItem, 'id' | 'lastUpdated'>) => void;
   onUpdateItem: (id: string, updates: Partial<StockItem>) => void;
   onDelete: (id: string) => void;
}

export const StockControl: React.FC<Props> = ({
   items, categories, categoryDefs = PREDEFINED_STOCK_CATEGORIES, units, barSessions = [], incidents = [],
   onUpdateStock, onAddItem, onDelete, onUpdateItem
}) => {
   const [filterCat, setFilterCat] = useState<string>('ALL');
   const [filterUsage, setFilterUsage] = useState<'ALL' | 'CASAL' | 'VENTA'>('ALL');
   const [search, setSearch] = useState('');
   const [showAddForm, setShowAddForm] = useState(false);
   const [editingItem, setEditingItem] = useState<StockItem | null>(null);
   const [activeTab, setActiveTab] = useState<'CONFIG' | 'STATS'>('CONFIG');
   const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

   // Menu contextual para móvil
   const [contextMenu, setContextMenu] = useState<string | null>(null);

   const [newItem, setNewItem] = useState<Partial<StockItem>>({
      name: '', quantity: 0, minStock: 5, unit: units[0] || 'u', category: categories[0] || 'BEBIDAS', subCategory: '', location: 'Almacén', costPerUnit: 0, usageType: 'CASAL', dailyLimit: 0
   });

   const activeCategories = useMemo(() => {
      // Return predefined or custom categories that are active in the config
      return categoryDefs.filter(c => categories.includes(c.id));
   }, [categories, categoryDefs]);

   // Helper to format category > subcategory for display
   const formatCategory = (catId?: string, subId?: string) => {
      if (!catId) return 'SIN CATEGORÍA';
      const cat = categoryDefs.find(c => c.id === catId);
      if (!cat) return catId;
      if (!subId) return cat.name.toUpperCase();
      const sub = cat.subcategories?.find(s => s.id === subId);
      return sub ? `${cat.name.toUpperCase()} > ${sub.name.toUpperCase()}` : cat.name.toUpperCase();
   };

   const filteredItems = useMemo(() => {
      return items.filter(i => {
         const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
         const matchesCat = filterCat === 'ALL' || i.category === filterCat;
         const matchesUsage = filterUsage === 'ALL' || i.usageType === filterUsage;
         return matchesSearch && matchesCat && matchesUsage;
      });
   }, [items, search, filterCat, filterUsage]);

   // --- HELPER: Get Today's Usage for Casal Items ---
   const getTodayUsage = (itemId: string) => {
      const today = new Date().toISOString().split('T')[0];
      return incidents
         .filter(inc => inc.stockItemId === itemId && inc.timestamp.startsWith(today) && (inc.terminal === 'CASAL' || !inc.terminal)) // Support legacy incidents without terminal
         .reduce((acc, inc) => acc + (inc.quantity || 1), 0);
   };

   // --- ANALYTICS ENGINE ---
   const itemStats = useMemo(() => {
      if (!editingItem) return null;

      let history: { date: string, quantity: number, hour: number }[] = [];

      // 1. Gather Data based on usage type
      if (editingItem.usageType === 'VENTA') {
         barSessions.forEach(session => {
            const consumption = session.consumptions.find(c => c.stockItemId === editingItem.id);
            if (consumption) {
               const dateObj = new Date(session.date);
               history.push({
                  date: dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                  quantity: consumption.quantity,
                  hour: dateObj.getHours()
               });
            }
         });
      } else {
         // For CASAL, we look at resolved incidents/requests
         incidents.filter(inc => inc.stockItemId === editingItem.id).forEach(inc => {
            const dateObj = new Date(inc.timestamp);
            history.push({
               date: dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
               quantity: inc.quantity || 1,
               hour: dateObj.getHours()
            });
         });
      }

      // 2. Process Daily Trend
      const dailyMap = new Map<string, number>();
      history.forEach(h => {
         dailyMap.set(h.date, (dailyMap.get(h.date) || 0) + h.quantity);
      });
      const trendData = Array.from(dailyMap.entries()).map(([name, value]) => ({ name, value })).slice(-7);

      // 3. Process Peak Hour
      const hourMap = new Array(24).fill(0);
      history.forEach(h => hourMap[h.hour] += h.quantity);
      const peakHourIndex = hourMap.indexOf(Math.max(...hourMap));
      const peakHourLabel = `${peakHourIndex}:00 - ${peakHourIndex + 1}:00`;

      // 4. Advanced Metrics
      const totalConsumed = history.reduce((acc, h) => acc + h.quantity, 0);
      const daysActive = new Set(history.map(h => h.date)).size || 1;
      const avgDailyConsumption = totalConsumed / daysActive;
      const avgDailyCost = avgDailyConsumption * editingItem.costPerUnit;
      const velocityPerHour = totalConsumed / (daysActive * 24); // Crude approximation
      const daysRemaining = avgDailyConsumption > 0 ? Math.floor(editingItem.quantity / avgDailyConsumption) : 999;

      return {
         trendData,
         hourMap: hourMap.map((val, h) => ({ hour: h, value: val })),
         peakHourLabel,
         totalConsumed,
         avgDailyConsumption,
         avgDailyCost,
         daysRemaining,
         totalValue: (editingItem.quantity * editingItem.costPerUnit).toFixed(2),
         velocity: velocityPerHour.toFixed(2)
      };

   }, [editingItem, barSessions, incidents]);


   const handleAddManual = () => {
      if (!newItem.name) return;
      onAddItem({
         name: newItem.name.toUpperCase(),
         quantity: Number(newItem.quantity),
         minStock: Number(newItem.minStock),
         unit: newItem.unit || 'u',
         category: newItem.category || 'BEBIDAS',
         subCategory: newItem.subCategory || undefined,
         location: newItem.location || 'Almacén',
         costPerUnit: Number(newItem.costPerUnit) || 0,
         usageType: newItem.usageType as any || 'CASAL',
         dailyLimit: newItem.usageType === 'CASAL' ? Number(newItem.dailyLimit) : undefined
      });
      setNewItem({ name: '', quantity: 0, minStock: 5, unit: units[0] || 'u', category: categories[0] || 'BEBIDAS', subCategory: '', location: 'Almacén', costPerUnit: 0, usageType: 'CASAL', dailyLimit: 0 });
      setShowAddForm(false);
   };

   const handleSaveEdit = () => {
      if (editingItem) {
         onUpdateItem(editingItem.id, editingItem);
         setEditingItem(null);
      }
   };

   return (
      <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in duration-500 w-full pb-32">

         {/* 1. KPIs HEADER */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl flex flex-col justify-between h-32 md:h-40 group">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Valor Venta</p>
                  <h3 className="text-3xl md:text-4xl font-black tabular-nums">{items.filter(i => i.usageType === 'VENTA').reduce((acc, i) => acc + (i.quantity * i.costPerUnit), 0).toFixed(0)}€</h3>
               </div>
               <div className="relative z-10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stock Comercial</span>
               </div>
               <ShoppingBag size={100} className="absolute -right-4 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
            </div>

            <div className="bg-orange-50 border-2 border-orange-100 rounded-[32px] p-6 text-slate-900 relative overflow-hidden shadow-sm flex flex-col justify-between h-32 md:h-40 group">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Valor Casal</p>
                  <h3 className="text-3xl md:text-4xl font-black tabular-nums">{items.filter(i => i.usageType === 'CASAL').reduce((acc, i) => acc + (i.quantity * i.costPerUnit), 0).toFixed(0)}€</h3>
               </div>
               <div className="relative z-10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase">Consumo Interno</span>
               </div>
               <User size={100} className="absolute -right-4 -bottom-6 opacity-5 rotate-12 text-orange-600 group-hover:scale-110 transition-transform" />
            </div>

            <button onClick={() => setShowAddForm(true)} className="bg-white border-2 border-slate-200 rounded-[32px] p-6 text-slate-900 shadow-sm flex flex-col items-center justify-center gap-3 active:scale-95 transition-all h-32 md:h-40 hover:border-indigo-300 group">
               <div className="p-3 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-full transition-colors"><Plus size={32} /></div>
               <span className="font-black uppercase text-xs tracking-widest text-slate-500 group-hover:text-indigo-600">Nuevo Producto</span>
            </button>
         </div>

         {/* 2. SEARCH & FILTERS BAR */}
         <div className="sticky top-2 z-30 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md p-2 rounded-[24px] border border-slate-200 shadow-lg flex gap-2 items-center">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     placeholder="Buscar en almacén..."
                     className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-bold outline-none text-slate-800 placeholder:text-slate-400"
                  />
               </div>
               <div className="w-px h-6 bg-slate-200"></div>
               <button onClick={() => setFilterUsage(f => f === 'ALL' ? 'VENTA' : f === 'VENTA' ? 'CASAL' : 'ALL')} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wide transition-colors min-w-[80px] justify-center ${filterUsage === 'VENTA' ? 'bg-indigo-100 text-indigo-700' : filterUsage === 'CASAL' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                  {filterUsage === 'ALL' ? 'Todos' : filterUsage}
               </button>
            </div>

            {/* Categories Scroll */}
            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar px-1">
               <button onClick={() => setFilterCat('ALL')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${filterCat === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Todo
               </button>
               {activeCategories.map(cat => (
                  <button key={cat.id} onClick={() => setFilterCat(cat.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${filterCat === cat.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                     {cat.name}
                  </button>
               ))}
            </div>
         </div>

         {/* 3. PRODUCT GRID */}
         <div className={`grid gap-3 md:gap-4 ${viewMode === 'GRID' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredItems.map(item => {
               const isLowStock = item.quantity <= item.minStock;
               const isVenta = item.usageType === 'VENTA';
               const todayUsage = !isVenta ? getTodayUsage(item.id) : 0;
               const limit = item.dailyLimit || 0;
               const hasLimit = limit > 0;
               const isOverLimit = hasLimit && todayUsage >= limit;

               // THEME DEFINITIONS
               const cardBg = isVenta ? 'bg-white' : 'bg-orange-50/40';
               const cardBorder = isOverLimit ? 'border-rose-500' : isVenta ? 'border-slate-100' : 'border-orange-200';
               const iconBg = isVenta ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-100 text-orange-600';
               const typeLabel = isVenta ? 'VENTA PÚBLICO' : 'BARRA FALLERA (CASAL)';
               const typeColor = isVenta ? 'text-indigo-400' : 'text-orange-600';

               return (
                  <div key={item.id} className={`rounded-[32px] p-4 md:p-5 shadow-sm border-2 relative transition-all ${cardBg} ${cardBorder} ${isLowStock ? 'ring-4 ring-rose-100' : ''} ${isOverLimit ? 'bg-rose-50' : ''}`}>

                     {/* CARD HEADER */}
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                           <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isOverLimit ? 'bg-rose-500 text-white animate-pulse' : iconBg}`}>
                              {isOverLimit ? <ShieldAlert size={20} className="md:w-6 md:h-6" /> : item.category?.includes('BEBIDA') ? <Wine size={20} className="md:w-6 md:h-6" /> : <Utensils size={20} className="md:w-6 md:h-6" />}
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-0.5 mb-1.5 align-start">
                                 <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isOverLimit ? 'text-rose-600' : typeColor}`}>{isOverLimit ? 'CUPO AGOTADO' : typeLabel}</span>
                                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none block">{formatCategory(item.category, item.subCategory)}</span>
                              </div>
                              <h4 className="font-black text-slate-900 text-base md:text-lg leading-tight truncate uppercase italic">{item.name}</h4>

                              {/* LIVE QUOTA TRACKER */}
                              {!isVenta && hasLimit && (
                                 <div className="mt-2 w-full">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wide mb-1">
                                       <span className={isOverLimit ? 'text-rose-600' : 'text-orange-700'}>
                                          {isOverLimit ? `¡Límite Superado!` : `${todayUsage} / ${limit}`}
                                       </span>
                                       <span className="text-slate-400">{((todayUsage / limit) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden border border-orange-100">
                                       <div
                                          className={`h-full transition-all duration-500 ${isOverLimit ? 'bg-rose-500' : todayUsage / limit > 0.8 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                          style={{ width: `${Math.min((todayUsage / limit) * 100, 100)}%` }}
                                       ></div>
                                    </div>
                                 </div>
                              )}

                              {/* NO LIMIT BADGE */}
                              {!isVenta && !hasLimit && (
                                 <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-100/50 border border-orange-200/50">
                                    <Zap size={10} className="text-orange-500 fill-orange-500" />
                                    <span className="text-[8px] md:text-[9px] font-black text-orange-600 uppercase tracking-wide">Barra Libre</span>
                                 </div>
                              )}

                              {/* LOW STOCK INDICATOR */}
                              {isLowStock && (
                                 <div className="mt-1.5 inline-flex items-center gap-1 text-[8px] md:text-[9px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md animate-pulse">
                                    <AlertTriangle size={10} /> STOCK BAJO
                                 </div>
                              )}
                           </div>
                        </div>
                        <button onClick={() => setContextMenu(contextMenu === item.id ? null : item.id)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                           <MoreHorizontal size={24} />
                        </button>
                     </div>

                     {/* QUANTITY STEPPER (MASSIVE TOUCH TARGET) */}
                     <div className={`rounded-[24px] p-1.5 flex items-center justify-between border relative overflow-hidden ${isVenta ? 'bg-slate-50 border-slate-200' : 'bg-white border-orange-200 shadow-sm'}`}>
                        <button onClick={() => onUpdateStock(item.id, Math.max(0, item.quantity - 1))} className={`w-12 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-[20px] active:scale-90 transition-all z-10 border ${isVenta ? 'bg-white shadow-sm border-slate-100 text-slate-400' : 'bg-orange-50 border-orange-100 text-orange-400'}`}>
                           <Minus size={20} className="md:w-6 md:h-6" />
                        </button>

                        <div className="flex flex-col items-center justify-center flex-1 z-10 cursor-default" onClick={(e) => { e.stopPropagation(); /* Prevent card click */ }}>
                           <span className={`text-2xl md:text-3xl font-black tabular-nums leading-none ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>{item.quantity}</span>
                           <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</span>
                        </div>

                        <button onClick={() => onUpdateStock(item.id, item.quantity + 1)} className={`w-12 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-[20px] shadow-lg text-white active:scale-90 transition-all z-10 ${isVenta ? 'bg-indigo-600 shadow-indigo-200' : 'bg-orange-500 shadow-orange-200'}`}>
                           <Plus size={20} className="md:w-6 md:h-6" />
                        </button>

                        {/* Progress Bar Background */}
                        <div className={`absolute bottom-0 left-0 h-1 transition-all ${isLowStock ? 'bg-rose-500' : isVenta ? 'bg-indigo-200' : 'bg-orange-300'}`} style={{ width: `${Math.min((item.quantity / (item.minStock * 3)) * 100, 100)}%` }}></div>
                     </div>

                     {/* CONTEXT MENU OVERLAY */}
                     {contextMenu === item.id && (
                        <div className="absolute inset-2 bg-white/95 backdrop-blur-sm rounded-[28px] z-20 flex flex-col justify-center gap-2 p-4 animate-in fade-in zoom-in-95 border-2 border-slate-100 shadow-xl">
                           <div className="flex justify-between items-center mb-2 px-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Opciones</span>
                              <button onClick={() => setContextMenu(null)}><X size={16} className="text-slate-400" /></button>
                           </div>
                           <button onClick={() => { setEditingItem(item); setActiveTab('STATS'); setContextMenu(null); }} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-xs transition-colors">
                              <BarChart3 size={16} /> Ver Estadísticas
                           </button>
                           <button onClick={() => { setEditingItem(item); setActiveTab('CONFIG'); setContextMenu(null); }} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-xs transition-colors">
                              <Edit3 size={16} /> Editar Ficha
                           </button>
                           <button onClick={() => { if (confirm('¿Borrar?')) onDelete(item.id); }} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs transition-colors">
                              <Trash2 size={16} /> Eliminar Producto
                           </button>
                        </div>
                     )}
                  </div>
               );
            })}

            {filteredItems.length === 0 && (
               <div className="col-span-full py-20 text-center opacity-40 flex flex-col items-center">
                  <Package size={64} className="mb-4 text-slate-300" />
                  <p className="font-black uppercase tracking-widest text-slate-400">Inventario vacío</p>
               </div>
            )}
         </div>

         {/* --- MODALS (ADD & EDIT) --- */}
         {/* Simplified Add Modal */}
         {showAddForm && (
            <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
               <div className="bg-white p-6 md:p-8 rounded-t-[40px] md:rounded-[40px] w-full max-w-md shadow-2xl space-y-6 animate-in slide-in-from-bottom md:zoom-in-95 border-t-4 md:border-4 border-slate-900 h-auto max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xl font-black uppercase italic tracking-tighter">Nuevo Producto</h3>
                     <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
                  </div>

                  <div className="space-y-4">
                     <input placeholder="Nombre (ej. Coca Cola)" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 uppercase" />

                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Uso</label>
                           <select value={newItem.usageType} onChange={e => setNewItem({ ...newItem, usageType: e.target.value as any })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                              <option value="VENTA">Venta</option>
                              <option value="CASAL">Casal (Barra Fallera)</option>
                           </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Categoría</label>
                           <select value={newItem.category} onChange={e => {
                              setNewItem({ ...newItem, category: e.target.value, subCategory: '' });
                           }} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                              {activeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>

                        {/* Rendering cascaded subcategory if selected category has them */}
                        {activeCategories.find(c => c.id === newItem.category)?.subcategories?.length ? (
                           <div className="col-span-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Subcategoría</label>
                              <select value={newItem.subCategory || ''} onChange={e => setNewItem({ ...newItem, subCategory: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                                 <option value="">(Ninguna)</option>
                                 {activeCategories.find(c => c.id === newItem.category)?.subcategories?.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                 ))}
                              </select>
                           </div>
                        ) : null}
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Stock Inicial</label>
                           <input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center text-lg outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                           <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Unidad</label>
                           <select value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                              {units.map(u => <option key={u} value={u}>{u}</option>)}
                           </select>
                        </div>
                     </div>

                     {/* Daily Limit Input for CASAL */}
                     {newItem.usageType === 'CASAL' && (
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                           <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Lock size={10} /> Cupo Diario (Opcional)</label>
                           <input
                              type="number"
                              placeholder="0 = Sin límite"
                              value={newItem.dailyLimit}
                              onChange={e => setNewItem({ ...newItem, dailyLimit: Number(e.target.value) })}
                              className="w-full p-3 bg-white border border-orange-200 rounded-xl font-bold text-orange-900 outline-none focus:border-orange-400"
                           />
                           <p className="text-[9px] text-orange-400 mt-2 leading-tight">Si pones 0, será barra libre. Si pones un número, la app avisará al superar ese consumo diario.</p>
                        </div>
                     )}
                  </div>
                  <button onClick={handleAddManual} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl mb-4">Guardar</button>
               </div>
            </div>
         )}

         {/* Full Edit Modal - OPTIMIZED FOR MOBILE */}
         {editingItem && (
            <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
               <div className="bg-white w-full h-[95vh] md:h-[85vh] md:max-w-3xl rounded-t-[32px] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95">
                  <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
                     <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white ${editingItem.usageType === 'VENTA' ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                           <Box size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                           <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Editando</p>
                           <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase truncate max-w-[200px] md:max-w-none">{editingItem.name}</h3>
                        </div>
                     </div>
                     <button onClick={() => setEditingItem(null)} className="p-2 md:p-3 bg-white rounded-full border shadow-sm"><X size={20} /></button>
                  </div>

                  <div className="flex border-b border-slate-100 shrink-0">
                     <button onClick={() => setActiveTab('CONFIG')} className={`flex-1 py-4 font-black uppercase text-[10px] md:text-xs tracking-widest ${activeTab === 'CONFIG' ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}>Configuración</button>
                     <button onClick={() => setActiveTab('STATS')} className={`flex-1 py-4 font-black uppercase text-[10px] md:text-xs tracking-widest ${activeTab === 'STATS' ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}>Estadísticas</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/30 custom-scrollbar">
                     {activeTab === 'CONFIG' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre</label>
                                 <input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value.toUpperCase() })} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Actual</label>
                                 <div className="flex items-center gap-2">
                                    <input type="number" value={editingItem.quantity} onChange={e => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-2xl outline-none focus:border-indigo-500" />
                                    <span className="font-bold text-slate-400">{editingItem.unit}</span>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría Principal</label>
                                 <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value, subCategory: '' })} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                                    {activeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                 </select>
                              </div>
                              {activeCategories.find(c => c.id === editingItem.category)?.subcategories?.length ? (
                                 <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Subcategoría</label>
                                    <select value={editingItem.subCategory || ''} onChange={e => setEditingItem({ ...editingItem, subCategory: e.target.value })} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                                       <option value="">(Ninguna)</option>
                                       {activeCategories.find(c => c.id === editingItem.category)?.subcategories?.map(s => (
                                          <option key={s.id} value={s.id}>{s.name}</option>
                                       ))}
                                    </select>
                                 </div>
                              ) : null}
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Coste Unitario (€)</label>
                                 <input type="number" step="0.01" value={editingItem.costPerUnit} onChange={e => setEditingItem({ ...editingItem, costPerUnit: Number(e.target.value) })} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alerta Stock Bajo</label>
                                 <input type="number" value={editingItem.minStock} onChange={e => setEditingItem({ ...editingItem, minStock: Number(e.target.value) })} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 text-rose-500" />
                              </div>

                              {/* DAILY LIMIT EDIT */}
                              {editingItem.usageType === 'CASAL' && (
                                 <div className="md:col-span-2 space-y-2 bg-orange-50 p-4 rounded-3xl border border-orange-100">
                                    <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Lock size={12} /> Límite de Consumo Diario</label>
                                    <input
                                       type="number"
                                       value={editingItem.dailyLimit || 0}
                                       onChange={e => setEditingItem({ ...editingItem, dailyLimit: Number(e.target.value) })}
                                       className="w-full p-4 bg-white border-2 border-orange-200 rounded-2xl font-black text-xl outline-none focus:border-orange-400 text-orange-900"
                                    />
                                    <p className="text-[10px] text-orange-400 ml-2">Unidades permitidas por día. 0 para desactivar.</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {activeTab === 'STATS' && itemStats && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4">

                           {/* KPI GRID */}
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm text-center">
                                 <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Total Valor</p>
                                 <p className="text-xl md:text-2xl font-black text-slate-900">{itemStats.totalValue}€</p>
                              </div>
                              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm text-center">
                                 <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Días Restantes</p>
                                 <p className={`text-xl md:text-2xl font-black ${itemStats.daysRemaining < 3 ? 'text-rose-500' : 'text-emerald-500'}`}>{itemStats.daysRemaining}</p>
                              </div>
                              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm text-center">
                                 <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Coste Diario</p>
                                 <p className="text-xl md:text-2xl font-black text-slate-900">{itemStats.avgDailyCost.toFixed(2)}€</p>
                              </div>
                              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm text-center">
                                 <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Velocidad</p>
                                 <p className="text-xl md:text-2xl font-black text-indigo-600">{itemStats.velocity}<span className="text-[10px]"> u/h</span></p>
                              </div>
                           </div>

                           {/* TREND CHART */}
                           <div className="h-56 md:h-64 bg-white p-4 md:p-6 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm">
                              <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp size={14} /> Tendencia de Consumo (7 días)</h4>
                              <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={itemStats.trendData}>
                                    <defs>
                                       <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                       </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#colorVal)" strokeWidth={4} />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </div>

                           {/* HOURLY DISTRIBUTION */}
                           <div className="h-56 md:h-64 bg-white p-4 md:p-6 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-4">
                                 <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Horas Punta</h4>
                                 <span className="text-[8px] md:text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Pico: {itemStats.peakHourLabel}</span>
                              </div>
                              <ResponsiveContainer width="100%" height="85%">
                                 <BarChart data={itemStats.hourMap}>
                                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px' }} />
                                    <Bar dataKey="value" fill="#cbd5e1" radius={[4, 4, 4, 4]} activeBar={{ fill: '#6366f1' }} />
                                 </BarChart>
                              </ResponsiveContainer>
                           </div>

                        </div>
                     )}
                  </div>

                  <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex gap-4 shrink-0 safe-pb">
                     <button onClick={() => setEditingItem(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] md:text-xs rounded-2xl tracking-widest">Cancelar</button>
                     <button onClick={handleSaveEdit} className="flex-[2] py-4 bg-slate-900 text-white font-black uppercase text-[10px] md:text-xs rounded-2xl tracking-widest shadow-xl">Guardar Cambios</button>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .snap-x > div { scroll-snap-align: center; }
      `}</style>
      </div>
   );
};
