
import React, { useState, useMemo } from 'react';
import { useToast } from '../hooks/useToast';
import { ShoppingItem, Transaction, StockItem, UserRole, MealEvent, Ingredient, Order } from '../types';
import {
    Utensils, Users, Plus, ChefHat, ShoppingCart,
    Trash2, Scale, CheckCircle2,
    X, Calendar, PlusCircle, ListChecks, Save, Microscope,
    ChevronRight, ChevronLeft
} from 'lucide-react';

interface Props {
    mealEvents: MealEvent[];
    onUpdateEvents: (events: MealEvent[]) => void;
    onAddList: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
    onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
    onCreateOrder: (order: Omit<Order, 'id'>) => void;
    memberCount: number;
    currentStock?: StockItem[];
    userRole?: UserRole;
}

export const MealPlanner: React.FC<Props> = ({ mealEvents, onUpdateEvents, onAddList, memberCount, userRole }) => {
    const toast = useToast();
    const [pax, setPax] = useState(memberCount || 50);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(mealEvents[0]?.id || null);
    const isReadOnly = userRole === 'FALLERO';

    const [showAddEvent, setShowAddEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: new Date().toISOString().split('T')[0] });

    // Modales de Ingredientes
    const [isIngModalOpen, setIsIngModalOpen] = useState(false);
    const [ingForm, setIngForm] = useState({ name: '', totalQty: '', unit: 'kg', totalPrice: '' });

    // Sorting and Navigation Logic
    const sortedEvents = useMemo(() => [...mealEvents].sort((a, b) => a.date.localeCompare(b.date)), [mealEvents]);
    const activeIndex = sortedEvents.findIndex(e => e.id === selectedEventId);
    const activeEvent = sortedEvents[activeIndex];

    const goToPrev = () => {
        if (activeIndex > 0) setSelectedEventId(sortedEvents[activeIndex - 1].id);
    };
    const goToNext = () => {
        if (activeIndex < sortedEvents.length - 1) setSelectedEventId(sortedEvents[activeIndex + 1].id);
    };

    // --- LÓGICA DE ANÁLISIS VISUAL ---
    const analyzeRation = (qty: number, unit: string, itemName: string) => {
        const u = unit.toLowerCase();
        const n = itemName.toLowerCase();

        let category = 'GENÉRICO';
        let advice = 'Estándar';
        let color = 'bg-slate-100 text-slate-500';
        let border = 'border-slate-200';
        let icon = Scale;

        const rationPerPerson = qty / pax;

        // Lógica simplificada de colores
        if (n.match(/(carne|pollo|cerdo|magro)/) && (u === 'kg' || u === 'kilos')) {
            category = 'PROTEÍNA';
            if (rationPerPerson < 0.250) { advice = 'Poco (<250g)'; color = 'bg-rose-100 text-rose-600'; border = 'border-rose-200'; }
            else if (rationPerPerson > 0.500) { advice = 'Mucho (>500g)'; color = 'bg-amber-100 text-amber-600'; border = 'border-amber-200'; }
            else { advice = 'Óptimo'; color = 'bg-emerald-100 text-emerald-600'; border = 'border-emerald-200'; icon = CheckCircle2; }
        }
        else if (n.match(/(arroz|fideo|pasta)/)) {
            category = 'CEREAL';
            if (rationPerPerson < 0.080) { advice = 'Escaso (<80g)'; color = 'bg-rose-100 text-rose-600'; border = 'border-rose-200'; }
            else if (rationPerPerson > 0.150) { advice = 'Excesivo (>150g)'; color = 'bg-amber-100 text-amber-600'; border = 'border-amber-200'; }
            else { advice = 'Perfecto'; color = 'bg-emerald-100 text-emerald-600'; border = 'border-emerald-200'; icon = CheckCircle2; }
        }

        return { category, advice, color, border, icon };
    };

    const handleSaveIngredient = () => {
        if (!ingForm.name || !ingForm.totalQty || !activeEvent) return;

        const qty = parseFloat(ingForm.totalQty);
        const price = parseFloat(ingForm.totalPrice) || 0;

        const newIng: Ingredient = {
            id: Date.now().toString(),
            name: ingForm.name,
            qtyPerPerson: qty,
            unit: ingForm.unit,
            pricePerUnit: price > 0 ? price / qty : 0,
        };

        const updatedEvent = { ...activeEvent, ingredients: [...activeEvent.ingredients, newIng] };
        onUpdateEvents(mealEvents.map(e => e.id === activeEvent.id ? updatedEvent : e));

        setIngForm({ name: '', totalQty: '', unit: 'kg', totalPrice: '' });
        setIsIngModalOpen(false);
    };

    const handleDeleteIngredient = (id: string) => {
        if (!activeEvent) return;
        if (!confirm("¿Eliminar ingrediente?")) return;
        const updatedIngredients = activeEvent.ingredients.filter(i => i.id !== id);
        onUpdateEvents(mealEvents.map(e => e.id === activeEvent.id ? { ...activeEvent, ingredients: updatedIngredients } : e));
    };

    const handleAddEvent = () => {
        if (!newEvent.title) return;
        const event: MealEvent = {
            id: Date.now().toString(),
            date: newEvent.date,
            type: 'LUNCH',
            name: newEvent.title,
            attendeeIds: [],
            title: newEvent.title,
            ingredients: []
        };
        onUpdateEvents([...mealEvents, event]);
        setSelectedEventId(event.id);
        setShowAddEvent(false);
        setNewEvent({ title: '', date: new Date().toISOString().split('T')[0] });
    };

    const generateShoppingList = () => {
        if (!activeEvent) return;
        activeEvent.ingredients.forEach(ing => {
            onAddList({
                name: `${ing.name} (Para: ${activeEvent.name})`,
                quantity: ing.qtyPerPerson,
                unit: ing.unit,
                location: 'Cocina',
                estimatedCost: ing.pricePerUnit * ing.qtyPerPerson,
                priority: 'HIGH'
            });
        });
        toast.success(`${activeEvent.ingredients.length} ingredientes enviados a la Lista de la Compra`);
    };

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500 pb-24">

            {/* HEADER TÁCTICO */}
            <div className="bg-[#09090b] text-white p-6 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col gap-4 border border-white/5 shrink-0">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none"><ChefHat size={200} /></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-500 text-white rounded-xl shadow-lg">
                                <Utensils size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Cocina & Compras</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Menús <span className="text-orange-500">Falleros</span></h2>
                    </div>
                </div>

                <div className="relative z-10 flex gap-3">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Comensales</p>
                        <div className="flex items-center justify-center gap-2">
                            <Users size={18} className="text-orange-400" />
                            <input
                                type="number"
                                value={pax}
                                onChange={(e) => setPax(parseInt(e.target.value) || 0)}
                                className="bg-transparent font-black text-2xl w-16 outline-none border-b border-white/20 focus:border-orange-500 text-center"
                            />
                        </div>
                    </div>
                    {!isReadOnly && (
                        <button onClick={() => setShowAddEvent(true)} className="bg-white text-slate-900 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl flex flex-col items-center justify-center gap-1 flex-1 active:scale-95">
                            <PlusCircle size={24} /> Nuevo
                        </button>
                    )}
                </div>
            </div>

            {/* NAVEGACIÓN EVENTOS */}
            <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm shrink-0">
                <button onClick={goToPrev} disabled={activeIndex <= 0} className="p-4 bg-slate-100 rounded-2xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all active:scale-95"><ChevronLeft size={24} /></button>

                <div className="text-center flex-1 overflow-hidden">
                    {activeEvent ? (
                        <>
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter truncate">{activeEvent.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                <Calendar size={12} /> {new Date(activeEvent.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                            </p>
                        </>
                    ) : (
                        <p className="text-slate-400 font-bold text-sm">Sin eventos</p>
                    )}
                </div>

                <button onClick={goToNext} disabled={activeIndex >= sortedEvents.length - 1} className="p-4 bg-slate-100 rounded-2xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all active:scale-95"><ChevronRight size={24} /></button>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm flex flex-col overflow-hidden relative min-h-[400px]">

                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><ListChecks size={16} className="text-orange-600" /> Lista Ingredientes</h4>
                    <div className="flex gap-2">
                        <button onClick={() => { setIngForm({ name: '', totalQty: '', unit: 'kg', totalPrice: '' }); setIsIngModalOpen(true); }} className="px-4 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2 active:scale-95">
                            <Plus size={16} /> AÑADIR
                        </button>
                        <button onClick={generateShoppingList} disabled={!activeEvent?.ingredients.length} className="px-3 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-50 active:scale-95">
                            <ShoppingCart size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
                    {activeEvent?.ingredients.map(ing => {
                        const analysis = analyzeRation(ing.qtyPerPerson, ing.unit, ing.name);
                        const AnalysisIcon = analysis.icon;

                        return (
                            <div key={ing.id} className={`p-4 rounded-3xl border-2 bg-white shadow-sm flex flex-col gap-3 relative animate-in fade-in slide-in-from-bottom-2 ${analysis.border}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4 w-full">
                                        {/* ICON BOX */}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${analysis.color}`}>
                                            <AnalysisIcon size={24} />
                                        </div>

                                        {/* TEXT CONTENT */}
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-black text-slate-900 text-lg uppercase italic leading-none truncate">{ing.name}</h5>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-black text-slate-800 tracking-tighter">{ing.qtyPerPerson}</span>
                                                <span className="text-xs font-bold text-slate-400 uppercase">{ing.unit}</span>
                                            </div>
                                        </div>

                                        {/* DELETE */}
                                        <button onClick={() => handleDeleteIngredient(ing.id)} className="p-3 text-slate-300 hover:text-rose-500 bg-slate-50 rounded-xl active:bg-rose-50 self-center"><Trash2 size={20} /></button>
                                    </div>
                                </div>

                                {/* AI FOOTER */}
                                <div className={`py-2 px-3 rounded-xl flex items-center justify-between text-[10px] font-bold ${analysis.color} bg-opacity-20`}>
                                    <div className="flex items-center gap-2">
                                        <Microscope size={12} />
                                        <span>{analysis.category}: {analysis.advice}</span>
                                    </div>
                                    {ing.pricePerUnit > 0 && <span>{(ing.pricePerUnit * ing.qtyPerPerson).toFixed(2)}€ Est.</span>}
                                </div>
                            </div>
                        );
                    })}

                    {(!activeEvent?.ingredients || activeEvent.ingredients.length === 0) && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40 py-12">
                            <ChefHat size={64} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Lista vacía</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL AÑADIR INGREDIENTE - BOTTOM SHEET */}
            {isIngModalOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-end justify-center">
                    <div className="bg-white w-full rounded-t-[40px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t-4 border-slate-900">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Añadir Género</h3>
                            <button onClick={() => setIsIngModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Producto</label>
                                <input autoFocus placeholder="Ej. Arroz" value={ingForm.name} onChange={e => setIngForm({ ...ingForm, name: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl outline-none focus:border-orange-500 transition-colors uppercase" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Cantidad</label>
                                    <input type="number" placeholder="0" value={ingForm.totalQty} onChange={e => setIngForm({ ...ingForm, totalQty: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-3xl outline-none focus:border-orange-500 text-center" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Unidad</label>
                                    <select value={ingForm.unit} onChange={e => setIngForm({ ...ingForm, unit: e.target.value })} className="w-full p-4 h-[72px] bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 uppercase appearance-none">
                                        <option value="kg">KG</option>
                                        <option value="l">LITROS</option>
                                        <option value="u">UNID.</option>
                                        <option value="barras">BARRAS</option>
                                        <option value="paquetes">PACKS</option>
                                    </select>
                                </div>
                            </div>

                            <button onClick={handleSaveIngredient} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-sm tracking-widest hover:bg-orange-600 shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 mt-4">
                                <Save size={20} /> GUARDAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NUEVO EVENTO - BOTTOM SHEET */}
            {showAddEvent && (
                <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-end justify-center">
                    <div className="bg-white w-full rounded-t-[40px] p-8 pb-10 shadow-2xl space-y-6 animate-in slide-in-from-bottom duration-300 border-t-4 border-slate-900">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-center">Nuevo Evento</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Nombre del Evento</label>
                                <input autoFocus placeholder="Ej. Paella Viernes" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg outline-none focus:border-orange-500 uppercase" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Fecha</label>
                                <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-orange-500" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setShowAddEvent(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">Cancelar</button>
                            <button onClick={handleAddEvent} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-orange-600 active:scale-95">Crear</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
