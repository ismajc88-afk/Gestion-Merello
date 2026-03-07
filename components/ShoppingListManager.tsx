
import React, { useState, useMemo } from 'react';
import { ShoppingItem, BudgetLine } from '../types';
import { 
  CheckSquare, Square, MapPin, Wand2, ArrowLeft, 
  Trash2, ShoppingCart, Plus, X, Tag,
  AlertCircle, 
  TrendingUp, AlertTriangle, CheckCircle2, Archive, Smartphone,
  Edit2, StickyNote
} from 'lucide-react';

interface Props {
  items: ShoppingItem[];
  budgetLines: BudgetLine[];
  locations: string[];
  onToggle: (id: string, cost?: number, category?: string) => void;
  onAdd: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  onEdit: (id: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
  onAutoFill: () => void;
}

export const ShoppingListManager: React.FC<Props> = ({ items, budgetLines, locations, onToggle, onAdd, onEdit, onDelete, onAutoFill }) => {
  const [isSuperMode, setIsSuperMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New/Edit Item State
  const initialFormState = { 
    name: '', quantity: 1, unit: 'u', location: locations[0] || 'Despensa', priority: 'NORMAL', estimatedCost: 0, budgetCategory: '', notes: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // Cost Recording State
  const [showCostModal, setShowCostModal] = useState<{id:string, name:string, defaultCat: string} | null>(null);
  const [tempCost, setTempCost] = useState('');
  const [tempCategory, setTempCategory] = useState('');

  // Filters
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'NORMAL' | 'LOW'>('ALL');

  const hapticClick = () => { if ("vibrate" in navigator) navigator.vibrate(20); };

  // --- METRICS ---
  const metrics = useMemo(() => {
    const totalItems = items.length;
    const boughtItems = items.filter(i => i.checked).length;
    const progress = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0;
    
    // Coste estimado de lo PENDIENTE (Forecast de gasto futuro)
    const estimatedPending = items.filter(i => !i.checked).reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
    
    // Coste real de lo COMPRADO
    const realSpent = items.filter(i => i.checked).reduce((acc, i) => acc + (i.actualCost || 0), 0);

    return { progress, estimatedPending, realSpent, boughtItems, totalItems };
  }, [items]);

  const handleSaveItem = () => {
    if(!formData.name) return;
    
    if (editingId) {
        onEdit(editingId, {
            name: formData.name, 
            quantity: formData.quantity, 
            unit: formData.unit, 
            location: formData.location,
            priority: formData.priority as any,
            estimatedCost: formData.estimatedCost,
            budgetCategory: formData.budgetCategory,
            notes: formData.notes
        });
    } else {
        onAdd({ 
            name: formData.name, 
            quantity: formData.quantity, 
            unit: formData.unit, 
            location: formData.location,
            priority: formData.priority as any,
            estimatedCost: formData.estimatedCost,
            budgetCategory: formData.budgetCategory,
            notes: formData.notes
        });
    }
    
    resetForm();
    setShowAddModal(false);
    hapticClick();
  };

  const openEditModal = (item: ShoppingItem) => {
      setEditingId(item.id);
      setFormData({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          location: item.location,
          priority: item.priority || 'NORMAL',
          estimatedCost: item.estimatedCost || 0,
          budgetCategory: item.budgetCategory || '',
          notes: item.notes || ''
      });
      setShowAddModal(true);
  };

  const resetForm = () => {
      setFormData(initialFormState);
      setEditingId(null);
  };

  const handleToggleAttempt = (item: ShoppingItem) => {
    hapticClick();
    if(!item.checked) {
       setShowCostModal({ id: item.id, name: item.name, defaultCat: item.budgetCategory || budgetLines[0]?.category || 'General' });
       setTempCost(item.estimatedCost ? item.estimatedCost.toString() : '');
       setTempCategory(item.budgetCategory || budgetLines[0]?.category || 'General');
    } else {
       onToggle(item.id);
    }
  };

  const confirmToggleWithCost = () => {
    if (!showCostModal) return;
    onToggle(showCostModal.id, parseFloat(tempCost) || 0, tempCategory);
    setShowCostModal(null); setTempCost('');
    hapticClick();
  };

  const getPriorityColor = (p?: string) => {
      switch(p) {
          case 'HIGH': return 'border-rose-500 bg-rose-50 text-rose-700';
          case 'LOW': return 'border-slate-200 bg-slate-50 text-slate-500';
          default: return 'border-indigo-100 bg-white text-indigo-900';
      }
  };

  const renderItemCard = (item: ShoppingItem, minimal = false) => (
    <div key={item.id} className={`relative flex items-center justify-between p-4 rounded-2xl border-l-4 mb-3 transition-all shadow-sm group ${item.checked ? 'bg-slate-50 opacity-50 grayscale border-l-slate-300' : getPriorityColor(item.priority)} ${minimal ? 'py-6' : ''}`}>
       
       {/* CHECKBOX & INFO */}
       <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggleAttempt(item)}>
          <div className={`rounded-full p-1 ${item.checked ? 'text-slate-400' : item.priority === 'HIGH' ? 'text-rose-500' : 'text-indigo-400'}`}>
              {item.checked ? <CheckSquare size={24}/> : <Square size={24}/>}
          </div>
          <div className="min-w-0">
              <p className={`font-bold text-lg leading-none truncate ${item.checked ? 'line-through decoration-2' : ''}`}>{item.name}</p>
              {!minimal && (
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin size={10}/> {item.location}
                      </span>
                      {item.budgetCategory && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Tag size={10}/> {item.budgetCategory}
                          </span>
                      )}
                      {item.estimatedCost && item.estimatedCost > 0 && !item.checked && (
                          <span className="text-[9px] font-bold opacity-70">~{item.estimatedCost}€</span>
                      )}
                  </div>
              )}
              {item.notes && !minimal && (
                  <p className="text-[10px] text-slate-500 mt-1 italic flex items-center gap-1"><StickyNote size={10}/> {item.notes}</p>
              )}
          </div>
       </div>

       {/* ACTIONS (Only in Normal Mode) */}
       <div className="flex items-center gap-3 pl-4">
           <div className="text-right">
               <span className="text-2xl font-black tabular-nums block">{item.quantity}</span>
               <span className="text-[10px] font-bold uppercase block opacity-60 leading-none">{item.unit}</span>
           </div>
           
           {!minimal && !item.checked && (
               <div className="flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="p-2 bg-white/80 hover:bg-white text-indigo-600 rounded-lg shadow-sm"><Edit2 size={14}/></button>
                   <button onClick={(e) => { e.stopPropagation(); if(confirm('¿Borrar?')) onDelete(item.id); }} className="p-2 bg-white/80 hover:bg-white text-rose-500 rounded-lg shadow-sm"><Trash2 size={14}/></button>
               </div>
           )}
       </div>
       
       {item.priority === 'HIGH' && !item.checked && (
           <div className="absolute top-2 right-2 pointer-events-none">
               <AlertTriangle size={12} className="text-rose-500 animate-pulse"/>
           </div>
       )}
    </div>
  );

  // --- SUPER MODE (SHOPPING VIEW) ---
  if (isSuperMode) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] z-[100] flex flex-col pt-[env(safe-area-inset-top)] animate-in slide-in-from-bottom duration-300">
         <div className="bg-slate-900 p-6 text-white flex justify-between items-center shadow-2xl shrink-0">
           <div>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter">MODO SÚPER</h2>
               <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
                   <ShoppingCart size={12}/> {metrics.boughtItems}/{metrics.totalItems} Completados
               </p>
           </div>
           <button onClick={() => { setIsSuperMode(false); hapticClick(); }} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all"><ArrowLeft size={24}/></button>
         </div>
         
         <div className="p-4 bg-slate-200 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {locations.map(loc => {
                const count = items.filter(i => i.location === loc && !i.checked).length;
                if(count === 0) return null;
                return (
                    <span key={loc} className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-700 shadow-sm whitespace-nowrap border border-slate-300">
                        {loc} ({count})
                    </span>
                )
            })}
         </div>

         <div className="flex-1 overflow-y-auto p-4 pb-32">
            {items.filter(i => !i.checked).sort((a,b) => (a.location > b.location ? 1 : -1)).map(item => renderItemCard(item, true))}
            
            {items.filter(i => !i.checked).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-4">
                    <CheckCircle2 size={80}/>
                    <p className="font-black uppercase text-2xl tracking-widest">¡Compra Finalizada!</p>
                </div>
            )}

            {items.filter(i => i.checked).length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-300">
                    <p className="text-center text-xs font-bold text-slate-400 uppercase mb-4">Ya en el carro</p>
                    {items.filter(i => i.checked).map(item => (
                        <div key={item.id} onClick={() => onToggle(item.id)} className="p-3 mb-2 bg-slate-100 rounded-xl flex justify-between items-center opacity-60 grayscale cursor-pointer">
                            <span className="font-bold line-through decoration-2 text-slate-500">{item.name}</span>
                            <span className="text-xs font-black">{item.quantity}</span>
                        </div>
                    ))}
                </div>
            )}
         </div>

         {/* COST MODAL IN SUPER MODE */}
         {showCostModal && (
            <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95">
               <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6">
                  <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirmar Precio</p>
                      <h3 className="text-2xl font-black text-slate-900 leading-none">{showCostModal.name}</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="relative">
                        <input type="number" step="0.01" autoFocus placeholder="0.00" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[28px] text-5xl font-black text-center outline-none focus:border-indigo-500 transition-all text-slate-900" value={tempCost} onChange={e => setTempCost(e.target.value)} />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">€</span>
                     </div>
                     <select value={tempCategory} onChange={e=>setTempCategory(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                        {budgetLines.map(l => <option key={l.category} value={l.category}>{l.category}</option>)}
                        <option value="General">General</option>
                     </select>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setShowCostModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                      <button onClick={confirmToggleWithCost} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Guardar</button>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  }

  // --- NORMAL MODE ---
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full pb-20">
      
      {/* DASHBOARD HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col justify-between h-40">
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Progreso Compra</p>
                  <h2 className="text-5xl font-black">{metrics.progress.toFixed(0)}%</h2>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${metrics.progress}%` }}></div>
              </div>
              <ShoppingCart size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12"/>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-40 group hover:border-indigo-200 transition-all">
              <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2"><TrendingUp size={12}/> Gasto Real</p>
                  <h3 className="text-3xl font-black text-slate-900">{metrics.realSpent.toFixed(2)}€</h3>
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2"><AlertCircle size={12}/> Pendiente Est.</p>
                  <h3 className="text-3xl font-black text-slate-400">{metrics.estimatedPending.toFixed(2)}€</h3>
              </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-[32px] shadow-xl shadow-indigo-200 text-white flex flex-col justify-center gap-4 text-center cursor-pointer active:scale-95 transition-all" onClick={() => setIsSuperMode(true)}>
              <Smartphone size={48} className="mx-auto"/>
              <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight">Activar Modo Súper</h3>
                  <p className="text-[10px] font-bold opacity-80">Vista optimizada para comprar</p>
              </div>
          </div>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-800 transition-all shrink-0">
              <Plus size={16}/> Añadir Producto
          </button>
          <button onClick={onAutoFill} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shrink-0">
              <Wand2 size={16}/> Cargar Básicos
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2 self-center shrink-0"></div>
          {['ALL', 'HIGH', 'NORMAL', 'LOW'].map(p => (
              <button 
                key={p} 
                onClick={() => setFilterPriority(p as any)}
                className={`px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shrink-0 ${filterPriority === p ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-400 border border-slate-100'}`}
              >
                  {p === 'ALL' ? 'Todo' : p}
              </button>
          ))}
      </div>

      {/* LIST VIEW GROUPED BY LOCATION */}
      <div className="space-y-8">
         {locations.map(loc => {
            const locItems = items.filter(i => i.location === loc && (filterPriority === 'ALL' || i.priority === filterPriority));
            if (locItems.length === 0) return null;

            return (
                <div key={loc} className="space-y-3">
                    <div className="flex items-center gap-3 px-4">
                        <MapPin size={14} className="text-slate-400"/>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{loc}</h3>
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full">{locItems.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {locItems.map(item => renderItemCard(item))}
                    </div>
                </div>
            )
         })}
         
         {items.length === 0 && (
             <div className="py-20 text-center opacity-30">
                 <ShoppingCart size={64} className="mx-auto mb-4 text-slate-400"/>
                 <p className="font-black uppercase tracking-widest text-slate-400">Tu lista está vacía</p>
             </div>
         )}
      </div>

      {/* MODAL ADD/EDIT ITEM */}
      {showAddModal && (
          <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-[48px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 border-4 border-slate-900">
                  <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                      <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-rose-100 hover:text-rose-500"><X size={24}/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">¿Qué necesitamos?</label>
                          <input autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-lg outline-none focus:border-indigo-500 transition-all uppercase" placeholder="EJ: HIELO, SERVILLETAS..." />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Cantidad</label>
                              <div className="flex gap-2">
                                  <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})} className="w-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none" />
                                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none appearance-none">
                                      <option value="u">Unidades</option>
                                      <option value="kg">Kilos</option>
                                      <option value="L">Litros</option>
                                      <option value="cajas">Cajas</option>
                                      <option value="packs">Packs</option>
                                      <option value="botellas">Botellas</option>
                                      <option value="latas">Latas / Botes</option>
                                      <option value="sacos">Sacos</option>
                                      <option value="barras">Barras</option>
                                  </select>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Ubicación</label>
                              <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Coste Est. (€)</label>
                              <input type="number" value={formData.estimatedCost} onChange={e => setFormData({...formData, estimatedCost: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center outline-none text-slate-600" placeholder="0.00" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Prioridad</label>
                              <div className="flex bg-slate-50 p-1 rounded-2xl border-2 border-slate-100">
                                  {['LOW', 'NORMAL', 'HIGH'].map(p => (
                                      <button 
                                        key={p} 
                                        onClick={() => setFormData({...formData, priority: p as any})}
                                        className={`flex-1 py-3 rounded-xl transition-all ${formData.priority === p ? (p === 'HIGH' ? 'bg-rose-50 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md') : 'text-slate-400'}`}
                                      >
                                          {p === 'HIGH' ? <AlertTriangle size={16} className="mx-auto"/> : p === 'LOW' ? <Archive size={16} className="mx-auto"/> : <CheckCircle2 size={16} className="mx-auto"/>}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría Presupuestaria</label>
                          <select value={formData.budgetCategory} onChange={e => setFormData({...formData, budgetCategory: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none">
                              <option value="">Seleccionar Categoría...</option>
                              {budgetLines.map(l => <option key={l.category} value={l.category}>{l.category}</option>)}
                          </select>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Notas Adicionales</label>
                          <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-sm outline-none resize-none" rows={2} placeholder="Marca, detalles..." />
                      </div>
                  </div>

                  <button onClick={handleSaveItem} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all">
                      {editingId ? 'Guardar Cambios' : 'Añadir a la Lista'}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};
