
import React, { useState, useEffect } from 'react';
import {
    StockItem, Incident, KioskConfig, BarPrice,
    AppConfig, KioskWorkload, UserRole, Shift
} from '../types';
import { useToast } from '../hooks/useToast';
import {
    LogOut, ShoppingCart,
    AlertTriangle, Snowflake, Wine,
    Package, Check,
    X, Plus, Minus, Ticket,
    RotateCcw, Zap,
    Lock, ShieldAlert, History
} from 'lucide-react';

interface KioskModeProps {
    stock: StockItem[];
    shifts?: Shift[];
    incidents: Incident[];
    config: KioskConfig;
    prices: BarPrice[];
    appConfig?: AppConfig;
    onExit: () => void;
    totalSessionRevenue?: number;
    ticketCounts?: Record<string, number>;
    onCreateIncident: (title: string, priority: 'URGENT' | 'NORMAL', stockItemId?: string, quantity?: number, terminal?: 'VENTA' | 'CASAL') => void;
    onResolveIncident: (id: string, status?: string) => void;
    onUpdateStock: (id: string, quantity: number) => void;
    onUpdateWorkload: (terminal: 'VENTA' | 'CASAL', status: KioskWorkload) => void;
    onTicketSale?: (items: { name: string; quantity: number; price: number }[]) => void;
    initialMode: 'VENTA' | 'CASAL';
    mode?: 'POS' | 'STOCK_ONLY' | 'LOGISTICS';
    userRole: UserRole;
    onMarkAsDelivered?: (incidentId: string) => void;
    onConfirmReceipt?: (incidentId: string) => void;
}

export const KioskMode: React.FC<KioskModeProps> = ({
    stock,
    incidents,
    config,
    prices,
    onExit,
    ticketCounts = {},
    onCreateIncident,
    onUpdateWorkload,
    onTicketSale,
    initialMode,
    mode = 'POS',
    userRole,
    onMarkAsDelivered,
    onConfirmReceipt
}) => {
    // --- STATE ---
    const [workload, setWorkload] = useState<KioskWorkload>('NORMAL');
    const [showRequests, setShowRequests] = useState(false);
    const toast = useToast();

    // POS State (Solo para Cajeros)
    const [cart, setCart] = useState<{ name: string, price: number, quantity: number }[]>([]);
    const [mobileTab, setMobileTab] = useState<'PRODUCTS' | 'CART'>('PRODUCTS');
    const [showCounter, setShowCounter] = useState(false);
    const [manualCountMode, setManualCountMode] = useState(false);
    const [correctionMode, setCorrectionMode] = useState(false);

    // Stock State (Para Camareros/Casal)
    const [restockItem, setRestockItem] = useState<StockItem | null>(null);
    const [restockQty, setRestockQty] = useState(1);
    const [restockUrgency, setRestockUrgency] = useState<'NORMAL' | 'URGENT'>('NORMAL');
    const [justification, setJustification] = useState(''); // Para peticiones que excedan cupo

    // --- EFECTOS ---
    useEffect(() => {
        onUpdateWorkload(initialMode, workload);
    }, [workload, initialMode]);

    // --- HELPERS ---
    const getTodayUsage = (itemId: string) => {
        const today = new Date().toISOString().split('T')[0];
        // Solo contar incidencias RESUELTAS (confirmadas) para el cupo diario
        // Las pendientes de aprobación, en proceso o entregadas NO deben contar como cupo consumido
        return incidents
            .filter(inc => inc.stockItemId === itemId && inc.timestamp.startsWith(today) && inc.status === 'RESOLVED')
            .reduce((acc, inc) => acc + (inc.quantity || 1), 0);
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // --- HANDLERS POS ---
    const handleProductClick = (name: string, price: number) => {
        if (correctionMode) {
            const itemInCart = cart.find(i => i.name === name);
            if (itemInCart) updateCartQty(name, -1);
            return;
        }
        if (manualCountMode) {
            onTicketSale?.([{ name, price: 0, quantity: 1 }]);
            return;
        }
        setCart(prev => {
            const existing = prev.find(i => i.name === name);
            if (existing) return prev.map(i => i.name === name ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { name, price, quantity: 1 }];
        });
    };

    const updateCartQty = (name: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.name === name) return { ...i, quantity: i.quantity + delta };
            return i;
        }).filter(i => i.quantity > 0));
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        onTicketSale?.(cart);
        setCart([]);
        setMobileTab('PRODUCTS');
    };

    // --- HANDLERS STOCK ---
    const handleIceRequest = () => {
        onCreateIncident('Necesitamos Hielo Urgente', 'URGENT', undefined, 1, initialMode);
        alert("❄️ AVISO DE HIELO ENVIADO");
    };

    const confirmRestock = () => {
        if (!restockItem) return;
        onCreateIncident(`Reposición: ${restockItem.name}`, restockUrgency, restockItem.id, restockQty, initialMode);
        setRestockItem(null);
        setJustification('');
    };

    const requestSpecialAuthorization = () => {
        if (!restockItem || !justification.trim()) {
            toast.warning('Debe proporcionar una justificación para la solicitud especial');
            return;
        }
        // Crear incidencia con flag de autorización requerida
        onCreateIncident(
            `🔓 APROBACIÓN REQUERIDA: ${restockItem.name} (${restockQty} ${restockItem.unit}) - ${justification}`,
            restockUrgency,
            restockItem.id,
            restockQty,
            initialMode
        );
        toast.success(`Solicitud enviada al Presidente/Admin\n📦 ${restockItem.name}: ${restockQty} ${restockItem.unit}`);
        setRestockItem(null);
        setJustification('');
    };

    // ----------------------------------------------------------------------
    // RENDER: CAJERO (TPV)
    // ----------------------------------------------------------------------
    if (mode === 'POS') {
        const allItems = [...config.alcoholItems, ...config.mixerItems, ...config.cupItems];

        return (
            <div className="fixed inset-0 bg-[#0f172a] text-white z-[500] flex flex-col h-[100dvh]">
                {/* HEADER POS */}
                <div className="p-3 bg-slate-900 border-b border-white/10 flex justify-between items-center shrink-0 safe-pt">
                    <div className="flex items-center gap-3">
                        <button onClick={onExit} className="p-3 bg-white/10 rounded-2xl hover:bg-rose-500/20"><LogOut size={20} /></button>
                        <h2 className="font-black text-lg uppercase italic tracking-tighter">CAJA / TPV</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setCorrectionMode(!correctionMode); setManualCountMode(false); }} className={`p-3 rounded-xl ${correctionMode ? 'bg-rose-500 animate-pulse' : 'bg-white/10'}`}><RotateCcw size={20} /></button>
                        <button onClick={() => setShowCounter(true)} className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl"><Ticket size={20} /></button>
                    </div>
                </div>

                {/* BODY POS */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* GRID PRODUCTOS */}
                    <div className={`flex-1 flex flex-col bg-[#0f172a] ${mobileTab === 'CART' ? 'hidden md:flex' : 'flex'}`}>
                        {manualCountMode && <div className="bg-orange-500 text-black text-center text-xs font-black py-1">MODO CONTEO (NO COBRA)</div>}
                        {correctionMode && <div className="bg-rose-600 text-white text-center text-xs font-black py-1">MODO CORRECCIÓN (RESTAR)</div>}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 pb-32 overflow-y-auto">
                            {allItems.map(itemName => {
                                const price = prices.find(p => p.name.toUpperCase() === itemName.toUpperCase())?.price || 0;
                                const qtyInCart = cart.find(i => i.name === itemName)?.quantity || 0;
                                return (
                                    <button key={itemName} onClick={() => handleProductClick(itemName, price)} className={`relative p-4 rounded-[32px] flex flex-col items-center justify-between text-center h-48 border-2 ${correctionMode ? 'bg-rose-50 border-rose-500' : 'bg-white border-slate-100'}`}>
                                        {qtyInCart > 0 && <div className="absolute top-3 right-3 bg-indigo-600 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black">{qtyInCart}</div>}
                                        <span className="text-base font-black uppercase text-slate-900 mt-4 leading-tight">{itemName}</span>
                                        <span className="text-2xl font-black text-emerald-500 mb-2">{price}€</span>
                                    </button>
                                );
                            })}
                        </div>
                        {/* FAB CART MOBILE */}
                        <div className="md:hidden absolute bottom-4 left-4 right-4">
                            <button onClick={() => setMobileTab('CART')} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-2">
                                <ShoppingCart size={20} /> Ver Ticket ({cartCount})
                            </button>
                        </div>
                    </div>

                    {/* SIDEBAR CART */}
                    <div className={`w-full md:w-96 bg-slate-900 flex-col border-l border-white/10 ${mobileTab === 'PRODUCTS' ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800">
                            <h3 className="font-black uppercase italic">Ticket Actual</h3>
                            <button onClick={() => setMobileTab('PRODUCTS')} className="md:hidden"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {cart.map((item, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
                                    <div><p className="font-bold">{item.name}</p><p className="text-xs opacity-60">{item.price}€</p></div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateCartQty(item.name, -1)} className="w-8 h-8 bg-white/10 rounded-lg">-</button>
                                        <span className="font-black">{item.quantity}</span>
                                        <button onClick={() => updateCartQty(item.name, 1)} className="w-8 h-8 bg-white/10 rounded-lg">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-800 border-t border-white/10 safe-pb">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-slate-400 font-bold text-xs uppercase">Total</span>
                                <span className="text-4xl font-black">{cartTotal.toFixed(2)}€</span>
                            </div>
                            <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-5 bg-emerald-500 text-slate-900 rounded-2xl font-black uppercase text-lg">Cobrar</button>
                        </div>
                    </div>
                </div>

                {/* MODAL CONTADORES (POS) */}
                {showCounter && (
                    <div className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-slate-900 w-full max-w-md rounded-[32px] p-6 border border-indigo-500/50">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-black text-white">Contadores</h3>
                                <button onClick={() => setShowCounter(false)}><X /></button>
                            </div>
                            <div className="bg-indigo-900/30 p-4 rounded-2xl mb-4 flex justify-between items-center">
                                <span>Modo Invitación / Conteo</span>
                                <button onClick={() => setManualCountMode(!manualCountMode)} className={`w-12 h-6 rounded-full ${manualCountMode ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${manualCountMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {Object.entries(ticketCounts).map(([name, count]) => (
                                    <div key={name} className="flex justify-between p-3 bg-white/5 rounded-xl">
                                        <span>{name}</span>
                                        <span className="font-black text-emerald-400">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // RENDER: LOGISTICS MODE - KANBAN BOARD
    // ----------------------------------------------------------------------
    if (mode === 'LOGISTICS') {
        const pendingRequests = incidents.filter(inc => (inc.status === 'OPEN' || inc.status === 'PENDING_DELIVERY' || inc.status === 'PENDING_APPROVAL') && inc.stockItemId);
        const deliveredRequests = incidents.filter(inc => inc.status === 'DELIVERED' && inc.stockItemId);
        const completedToday = incidents.filter(inc => inc.status === 'RESOLVED' && inc.stockItemId && inc.timestamp.startsWith(new Date().toISOString().split('T')[0]));

        const handleMarkAsDelivered = (incidentId: string) => {
            if (confirm('¿Confirmar que has entregado este pedido?')) {
                onMarkAsDelivered?.(incidentId);
                toast.success('Pedido marcado como entregado');
            }
        };

        const renderKanbanCard = (request: typeof incidents[0], isDelivered: boolean = false, isCompleted: boolean = false) => {
            const stockItem = stock.find(s => s.id === request.stockItemId);
            if (!stockItem) return null;
            const isUrgent = request.priority === 'URGENT';
            const isSpecialAuth = request.title.includes('🔓 APROBACIÓN REQUERIDA');

            return (
                <div key={request.id} className={`rounded-2xl p-4 border-2 shadow-sm relative transition-all hover:scale-[1.02] ${isUrgent ? 'bg-red-500/10 border-red-500/30 shadow-red-500/10' : isSpecialAuth ? 'bg-orange-500/10 border-orange-500/30' : isDelivered ? 'bg-blue-500/10 border-blue-500/20 opacity-90' : isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap gap-1.5 mb-1">
                            {isUrgent && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase rounded-full animate-pulse shadow-lg shadow-red-500/20">🚨 Urgente</span>}
                            {isSpecialAuth && <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase rounded-full">🔓 Aut.</span>}
                            <span className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[9px] font-black uppercase rounded-full border border-slate-700">{request.terminal || 'Barra'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-950/50 px-2 py-1 rounded-lg">
                            {new Date(isDelivered ? (request.deliveredAt || request.timestamp) : isCompleted ? (request.confirmedAt || request.timestamp) : request.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <h3 className={`font-black uppercase leading-tight mb-4 ${isCompleted ? 'text-emerald-500/60 line-through' : 'text-white'} ${isCompleted ? 'text-sm' : 'text-lg'}`}>
                        {stockItem.name}
                    </h3>

                    <div className="flex justify-between items-end mb-4 bg-slate-950/50 rounded-xl p-3 border border-white/5">
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">A entregar</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white leading-none">{request.quantity || 1}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase">{stockItem.unit}</span>
                            </div>
                        </div>
                        <div className="text-right border-l border-white/10 pl-3">
                            <p className="text-[9px] font-bold text-slate-500 uppercase">Stock: <span className={`font-black ${stockItem.quantity <= stockItem.minStock ? 'text-amber-400' : 'text-slate-300'}`}>{stockItem.quantity}</span></p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Ubic: <span className="text-slate-300">{stockItem.location}</span></p>
                        </div>
                    </div>

                    {!isDelivered && !isCompleted && (
                        <button onClick={() => handleMarkAsDelivered(request.id)} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/25">
                            <Check size={18} /> Marcar Entregado
                        </button>
                    )}
                    {isDelivered && !isCompleted && (
                        <div className="w-full py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl font-black uppercase text-[10px] text-center flex items-center justify-center gap-2">
                            <RotateCcw size={14} className="animate-spin-slow" /> Esperando conf. barra
                        </div>
                    )}
                    {isCompleted && (
                        <div className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500/70 rounded-xl font-black uppercase text-[10px] text-center flex items-center justify-center gap-2">
                            <Check size={14} /> Confirmado {request.confirmedBy || request.terminal}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-slate-950 text-white z-[500] flex flex-col h-[100dvh]">
                <div className="relative p-4 md:p-5 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center shrink-0 z-10 shadow-2xl safe-pt">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-500/5 to-purple-600/10 pointer-events-none"></div>
                    <div className="relative flex items-center gap-4">
                        <button onClick={onExit} className="p-3.5 bg-white/5 rounded-2xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all active:scale-95 border border-white/5"><LogOut size={22} /></button>
                        <div>
                            <h2 className="font-black text-2xl md:text-3xl uppercase italic tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent drop-shadow-lg">
                                📦 LOGÍSTICA
                            </h2>
                            <p className="text-[10px] md:text-xs text-indigo-400/80 font-bold uppercase tracking-[0.2em] mt-0.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span> Panel Kanban
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none"></div>

                    <div className="relative flex gap-5 md:gap-8 h-full min-w-max md:min-w-0 md:grid md:grid-cols-3">

                        {/* COLUMNA PENDIENTES */}
                        <div className="w-[320px] md:w-auto h-full flex flex-col bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="p-5 border-b border-white/5 bg-slate-800/50 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"></div>
                                <h3 className="relative font-black uppercase text-sm text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-500/20 rounded-lg"><AlertTriangle size={16} className="text-amber-400" /></div>
                                    1. Pendientes
                                </h3>
                                <span className="relative px-3 py-1 bg-amber-500 text-amber-950 font-black text-xs rounded-xl drop-shadow-md">{pendingRequests.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {pendingRequests.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-6">
                                        <div className="p-6 bg-white/5 rounded-full mb-4"><Package size={48} className="text-amber-400/50" /></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-300">Todo al día</p>
                                    </div>
                                ) : pendingRequests.map(req => renderKanbanCard(req, false, false))}
                            </div>
                        </div>

                        {/* COLUMNA EN CAMINO */}
                        <div className="w-[320px] md:w-auto h-full flex flex-col bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="p-5 border-b border-white/5 bg-blue-900/20 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"></div>
                                <h3 className="relative font-black uppercase text-sm text-white flex items-center gap-2">
                                    <div className="animate-spin-slow p-1.5 bg-blue-500/20 rounded-lg"><RotateCcw size={16} className="text-blue-400" /></div>
                                    2. En Camino
                                </h3>
                                <span className="relative px-3 py-1 bg-blue-500 text-blue-950 font-black text-xs rounded-xl drop-shadow-md">{deliveredRequests.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {deliveredRequests.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-6">
                                        <div className="p-6 bg-white/5 rounded-full mb-4"><RotateCcw size={48} className="text-blue-400/50" /></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-300">Nada en tránsito</p>
                                    </div>
                                ) : deliveredRequests.map(req => renderKanbanCard(req, true, false))}
                            </div>
                        </div>

                        {/* COLUMNA COMPLETADOS */}
                        <div className="w-[320px] md:w-auto h-full flex flex-col bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="p-5 border-b border-white/5 bg-emerald-900/10 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
                                <h3 className="relative font-black uppercase text-sm text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-500/20 rounded-lg"><Check size={16} className="text-emerald-400" /></div>
                                    3. Entregados Hoy
                                </h3>
                                <span className="relative px-3 py-1 bg-emerald-500 text-emerald-950 font-black text-xs rounded-xl drop-shadow-md">{completedToday.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {completedToday.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-6">
                                        <div className="p-6 bg-white/5 rounded-full mb-4"><Check size={48} className="text-emerald-400/50" /></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-300">Aún no hay entregas</p>
                                    </div>
                                ) : completedToday.map(req => renderKanbanCard(req, false, true))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // RENDER: STOCK ONLY (CAMARERO / CASAL) - DISEÑO PREMIUM
    // ----------------------------------------------------------------------
    const myRequests = incidents.filter(i => (i.requestedBy === userRole || i.terminal === initialMode) && i.status !== 'RESOLVED' && i.status !== 'ARCHIVED');
    const pendingCount = myRequests.filter(i => i.status === 'DELIVERED').length;

    const itemsToShow = stock.filter(s => s.usageType === initialMode).sort((a, _b) => (a.quantity <= a.minStock ? -1 : 1));

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white z-[500] flex flex-col h-[100dvh]">
            {/* HEADER PREMIUM */}
            <div className="relative p-4 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-white/10 shrink-0 safe-pt shadow-2xl">
                {/* Efecto de brillo en el header */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

                <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onExit} className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/30 active:scale-95 transition-all">
                            <LogOut size={22} />
                        </button>
                        <button
                            onClick={() => setShowRequests(!showRequests)}
                            className={`p-3 rounded-2xl transition-all relative ${showRequests
                                ? 'bg-indigo-500/30 text-indigo-400 border border-indigo-500/50'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/5'
                                }`}
                        >
                            <History size={22} />
                            {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
                        </button>
                        <div>
                            <h2 className="font-black text-xl md:text-2xl uppercase italic tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                                Almacén {initialMode}
                            </h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Toca para solicitar reposición
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 items-center">
                        {/* BOTÓN DE TICKETS SOLO VISIBLE PARA CAJERO */}
                        {userRole === 'CAJERO' && (
                            <button onClick={() => setShowCounter(true)} className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transition-all">
                                <Ticket size={22} />
                            </button>
                        )}

                        {/* Selector de carga de trabajo mejorado */}
                        <div className="flex bg-slate-950/50 backdrop-blur-sm rounded-2xl p-1.5 border border-white/10 shadow-lg">
                            {(['BAJA', 'NORMAL', 'ALTA'] as KioskWorkload[]).map(w => (
                                <button
                                    key={w}
                                    onClick={() => setWorkload(w)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${workload === w
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* GRID STOCK PREMIUM */}
            <div className="flex-1 overflow-y-auto p-6 pb-32">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {itemsToShow.map(item => {
                        const isLow = item.quantity <= item.minStock;
                        const limit = item.dailyLimit || 0;
                        const todayUsage = limit > 0 ? getTodayUsage(item.id) : 0;
                        const remaining = Math.max(0, limit - todayUsage);

                        // Gradientes únicos según el estado
                        const cardGradient = isLow
                            ? 'from-amber-500/20 via-orange-500/20 to-red-500/20'
                            : 'from-slate-800/50 via-slate-700/50 to-slate-800/50';

                        const borderColor = isLow
                            ? 'border-amber-500/40'
                            : 'border-slate-600/30 hover:border-blue-500/50';

                        return (
                            <button
                                key={item.id}
                                onClick={() => { setRestockItem(item); setRestockQty(1); }}
                                className={`group relative p-5 rounded-[24px] bg-gradient-to-br ${cardGradient} backdrop-blur-md border-2 ${borderColor}
                                      flex flex-col min-h-[240px] cursor-pointer transition-all duration-300
                                      hover:scale-105 hover:shadow-2xl ${isLow ? 'hover:shadow-amber-500/30' : 'hover:shadow-blue-500/20'}
                                      active:scale-95 overflow-hidden`}
                            >
                                {/* Efecto de brillo al hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px]"></div>

                                {/* Partículas decorativas */}
                                <div className="absolute top-3 right-3 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>

                                {/* Header con icono y badge */}
                                <div className="relative z-10 flex justify-between items-start mb-3">
                                    <div className={`p-2.5 rounded-xl backdrop-blur-sm shadow-lg ${isLow
                                        ? 'bg-amber-500/20 text-amber-300 shadow-amber-500/20'
                                        : 'bg-blue-500/20 text-blue-300 shadow-blue-500/20'
                                        }`}>
                                        {item.category.includes('BEBIDA') ? <Wine size={20} /> : <Package size={20} />}
                                    </div>
                                    {isLow && (
                                        <div className="flex items-center gap-1 bg-amber-500/90 text-amber-950 px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                                            <AlertTriangle size={12} />
                                            <span className="text-[10px] font-black uppercase">Bajo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Nombre del producto */}
                                <h4 className="relative z-10 font-black text-base uppercase text-white leading-tight mb-4 line-clamp-2 drop-shadow-lg min-h-[2.5rem]">
                                    {item.name}
                                </h4>

                                {/* Información inferior */}
                                <div className="relative z-10 mt-auto space-y-2.5">
                                    {limit > 0 ? (
                                        <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cupo Diario</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-black text-white drop-shadow-lg">{remaining}</span>
                                                <span className="text-xs text-slate-500">/ {limit}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-2.5 py-2 rounded-xl border border-emerald-500/30">
                                            <Zap size={14} className="text-emerald-400" />
                                            <span className="text-[10px] font-black uppercase text-emerald-300">Barra Libre</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center bg-slate-950/50 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Stock</span>
                                        <span className={`text-xl font-black drop-shadow-lg ${isLow ? 'text-amber-400' : 'text-white'
                                            }`}>
                                            {item.quantity}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* BOTTOM BAR PREMIUM */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 z-40 shadow-2xl safe-pb">
                <button
                    onClick={handleIceRequest}
                    className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-[24px] text-white flex items-center justify-center gap-3 
                          shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.6)]
                          active:scale-98 transition-all group relative overflow-hidden"
                >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <Snowflake size={28} className="animate-spin-slow relative z-10" />
                    <span className="font-black text-lg uppercase tracking-wider relative z-10">Pedir Hielo Urgente</span>
                </button>
            </div>

            {/* MODAL REPOSICION */}
            {restockItem && (() => {
                const limit = restockItem.dailyLimit || 0;
                const todayUsage = limit > 0 ? getTodayUsage(restockItem.id) : 0;
                const remaining = Math.max(0, limit - todayUsage);
                const isOverQuota = limit > 0 && restockQty > remaining;

                return (
                    <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-sm rounded-[32px] p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div><p className="text-[10px] font-black text-indigo-400 uppercase">Solicitar a Logística</p><h3 className="text-2xl font-black text-white uppercase">{restockItem.name}</h3></div>
                                <button onClick={() => setRestockItem(null)} className="p-2 bg-slate-800 rounded-full text-slate-400"><X /></button>
                            </div>

                            {/* INFORMACIÓN DEL PRODUCTO */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {/* Stock Actual */}
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Stock Actual</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-2xl font-black ${restockItem.quantity <= restockItem.minStock ? 'text-amber-400' : 'text-white'}`}>
                                            {restockItem.quantity}
                                        </span>
                                        <span className="text-xs text-slate-500">{restockItem.unit}</span>
                                    </div>
                                </div>

                                {/* Cupo Diario o Barra Libre */}
                                {limit > 0 ? (
                                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cupo Hoy</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-emerald-400">
                                                {remaining}
                                            </span>
                                            <span className="text-xs text-slate-500">/ {limit}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 backdrop-blur-sm rounded-xl p-3 border border-emerald-700/50 flex flex-col items-center justify-center">
                                        <Zap size={16} className="text-emerald-400 mb-1" />
                                        <span className="text-[10px] font-black uppercase text-emerald-300">Barra Libre</span>
                                    </div>
                                )}
                            </div>

                            {/* BLOQUEO SI EXCEDE CUPO */}
                            {isOverQuota && (
                                <div className="mb-4 bg-rose-500/10 border-2 border-rose-500/40 rounded-xl p-4 animate-pulse">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Lock size={18} className="text-rose-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-black text-rose-400 uppercase">Cupo Diario Excedido</p>
                                            <p className="text-[10px] text-rose-300/80 leading-tight mt-1">
                                                Solo puedes pedir hasta <span className="font-black">{remaining} {restockItem.unit}</span> con el cupo restante de hoy.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-rose-500/20">
                                        <p className="text-[9px] text-rose-200/60 leading-tight flex items-start gap-1.5">
                                            <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                                            <span>Para solicitar más cantidad, contacta con el <span className="font-black">Presidente</span> o <span className="font-black">Administrador</span> para ampliar el cupo.</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* SELECTOR DE CANTIDAD */}
                            <div className={`bg-slate-800/50 p-4 rounded-2xl mb-6 text-center border-2 transition-all ${isOverQuota ? 'border-rose-500/50 opacity-60' : 'border-transparent'
                                }`}>
                                <div className="flex items-center justify-center gap-6">
                                    <button
                                        onClick={() => setRestockQty(Math.max(1, restockQty - 1))}
                                        className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                                    >
                                        <Minus />
                                    </button>
                                    <span className={`text-4xl font-black transition-colors ${isOverQuota ? 'text-rose-400' : 'text-white'
                                        }`}>{restockQty}</span>
                                    <button
                                        onClick={() => setRestockQty(restockQty + 1)}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${isOverQuota ? 'bg-rose-600' : 'bg-indigo-600'
                                            }`}
                                    >
                                        <Plus />
                                    </button>
                                </div>
                                <p className="text-xs font-bold text-slate-500 mt-2 uppercase">{restockItem.unit} a pedir</p>
                                {isOverQuota && (
                                    <p className="text-[9px] font-black text-rose-400 mt-2 uppercase">Excede límite diario</p>
                                )}
                            </div>

                            {/* URGENCIA */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setRestockUrgency('NORMAL')}
                                    disabled={isOverQuota}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-opacity ${restockUrgency === 'NORMAL' ? 'bg-slate-700 border-slate-500' : 'border-transparent text-slate-500'
                                        } ${isOverQuota ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    Normal
                                </button>
                                <button
                                    onClick={() => setRestockUrgency('URGENT')}
                                    disabled={isOverQuota}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-opacity ${restockUrgency === 'URGENT' ? 'bg-rose-900/50 border-rose-500 text-rose-400' : 'border-transparent text-slate-500'
                                        } ${isOverQuota ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    Urgente
                                </button>
                            </div>

                            {/* CAMPO DE JUSTIFICACIÓN SI EXCEDE CUPO */}
                            {isOverQuota && (
                                <div className="mb-4 bg-slate-800/50 rounded-xl p-4 border-2 border-indigo-500/30">
                                    <label className="text-xs font-black text-indigo-400 uppercase mb-2 block flex items-center gap-2">
                                        <ShieldAlert size={14} />
                                        Justificación para Autorización Especial
                                    </label>
                                    <textarea
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        placeholder="Explica por qué necesitas esta cantidad (ej: evento especial, fin de semana, reposición para varios días...)"
                                        className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm outline-none focus:border-indigo-500 resize-none"
                                        rows={3}
                                    />
                                    <p className="text-[9px] text-slate-500 mt-2">
                                        Esta solicitud será enviada al Presidente o Administrador para su aprobación.
                                    </p>
                                </div>
                            )}

                            {/* BOTONES DE CONFIRMACIÓN */}
                            {isOverQuota ? (
                                <button
                                    onClick={requestSpecialAuthorization}
                                    className={`w-full py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all ${justification.trim()
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                        }`}
                                    disabled={!justification.trim()}
                                >
                                    <ShieldAlert size={20} />
                                    Solicitar Autorización Especial
                                </button>
                            ) : (
                                <button
                                    onClick={confirmRestock}
                                    className="w-full py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 transition-all"
                                >
                                    <Check size={20} />
                                    Confirmar Pedido
                                </button>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* MODAL CONTADORES (STOCK MODE) */}
            {showCounter && (
                <div className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-md rounded-[32px] p-6 border border-indigo-500/50">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-black text-white">Tickets Vendidos</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Cola de preparación</p>
                            </div>
                            <button onClick={() => setShowCounter(false)}><X /></button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                            {Object.entries(ticketCounts).length > 0 ? Object.entries(ticketCounts).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([name, count]) => (
                                <div key={name} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="font-bold text-white uppercase text-sm">{name}</span>
                                    <span className="text-2xl font-black text-emerald-400 tabular-nums">{count}</span>
                                </div>
                            )) : (
                                <div className="py-10 text-center text-slate-500 font-bold uppercase text-xs">Sin ventas registradas hoy</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL MIS PETICIONES */}
            {showRequests && (
                <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-md rounded-[32px] p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase">Mis Peticiones</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Historial de solicitudes</p>
                            </div>
                            <button onClick={() => setShowRequests(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {myRequests.length === 0 ? (
                                <div className="py-10 text-center text-slate-500 font-bold uppercase text-xs opacity-50 flex flex-col items-center gap-3">
                                    <History size={48} />
                                    No tienes peticiones activas
                                </div>
                            ) : (
                                myRequests.map(req => {
                                    const stockItem = stock.find(s => s.id === req.stockItemId);
                                    if (!stockItem) return null;

                                    const isDelivered = req.status === 'DELIVERED';
                                    const isPendingApproval = req.status === 'PENDING_APPROVAL';

                                    return (
                                        <div key={req.id} className={`p-4 rounded-2xl border ${isDelivered
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : isPendingApproval
                                                ? 'bg-orange-500/10 border-orange-500/30'
                                                : 'bg-slate-800/50 border-slate-700/50'
                                            }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-white uppercase">{stockItem.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isDelivered ? 'bg-emerald-500 text-slate-900' :
                                                    isPendingApproval ? 'bg-orange-500 text-slate-900 animate-pulse' :
                                                        'bg-blue-500 text-white'
                                                    }`}>
                                                    {isDelivered ? 'Listo' : isPendingApproval ? 'Esperando Aprobación' : 'En Proceso'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs text-slate-400">
                                                    <p>Cantidad: <span className="text-white font-bold">{req.quantity} {stockItem.unit}</span></p>
                                                    <p>{req.justification ? 'Autorización Especial' : 'Reposición Normal'}</p>
                                                </div>
                                                {isDelivered && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('¿Confirmas que has recibido este pedido? Se descontará del stock.')) {
                                                                onConfirmReceipt?.(req.id);
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        <Check size={14} />
                                                        Confirmar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
