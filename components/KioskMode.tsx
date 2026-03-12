
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
    RotateCcw, Zap, ZapOff,
    ShieldAlert, History
} from 'lucide-react';
import { useScreenWakeLock } from '../hooks/useScreenWakeLock';

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
    const { isLocked, toggleLock } = useScreenWakeLock();

    // POS State (Solo para Cajeros)
    const [cart, setCart] = useState<{ name: string, price: number, quantity: number }[]>([]);
    const [mobileTab, setMobileTab] = useState<'PRODUCTS' | 'CART'>('PRODUCTS');
    const [showCounter, setShowCounter] = useState(false);
    const [manualCountMode, setManualCountMode] = useState(false);
    const [correctionMode, setCorrectionMode] = useState(false);

    // Stock State (Para Camareros/Casal)
    const [restockItem, setRestockItem] = useState<StockItem | null>(null);
    const [restockQty, setRestockQty] = useState(1);
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
        onCreateIncident(`Reposición: ${restockItem.name}`, 'NORMAL', restockItem.id, restockQty, initialMode);
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
            'NORMAL',
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
                <div className="px-3 py-2 sm:p-4 bg-slate-900/50 backdrop-blur-md border-b-4 border-indigo-500/50 flex justify-between items-center shrink-0 safe-pt relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-rose-500/5"></div>
                    <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                        <button 
                            onClick={onExit} 
                            className="p-2.5 sm:p-3 bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 rounded-xl sm:rounded-2xl hover:bg-rose-500/40 transition-all active:scale-90"
                        >
                            <LogOut size={20} />
                        </button>
                        <div>
                            <h2 className="font-black text-lg sm:text-2xl uppercase italic tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">CAJA / TPV</h2>
                            <p className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest -mt-0.5">Terminal de Venta</p>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 relative z-10">
                        <button 
                            onClick={toggleLock} 
                            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${isLocked ? 'bg-amber-500 border-amber-400 text-slate-900' : 'bg-white/5 border-white/10 text-slate-400'}`}
                        >
                            {isLocked ? <Zap size={18} fill="currentColor" /> : <ZapOff size={18} />}
                        </button>
                        <button 
                            onClick={() => { setCorrectionMode(!correctionMode); setManualCountMode(false); }} 
                            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${correctionMode ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-white/5 border-white/10 text-slate-400'}`}
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button 
                            onClick={() => setShowCounter(true)} 
                            className="p-2.5 sm:p-4 bg-indigo-600 border-2 border-indigo-400 text-white rounded-xl sm:rounded-2xl hover:bg-indigo-500 transition-all active:scale-95"
                        >
                            <Ticket size={18} />
                        </button>
                    </div>
                </div>

                {/* BODY POS */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* GRID PRODUCTOS */}
                    <div className={`flex-1 flex flex-col bg-[#0f172a] ${mobileTab === 'CART' ? 'hidden md:flex' : 'flex'}`}>
                        {manualCountMode && <div className="bg-orange-500 text-black text-center text-xs font-black py-1">MODO CONTEO (NO COBRA)</div>}
                        {correctionMode && <div className="bg-rose-600 text-white text-center text-xs font-black py-1">MODO CORRECCIÓN (RESTAR)</div>}

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 pb-32 overflow-y-auto custom-scrollbar">
                            {allItems.map(itemName => {
                                const price = prices.find(p => p.name.toUpperCase() === itemName.toUpperCase())?.price || 0;
                                const qtyInCart = cart.find(i => i.name === itemName)?.quantity || 0;
                                return (
                                    <button 
                                        key={itemName} 
                                        onClick={() => handleProductClick(itemName, price)} 
                                        className={`group relative p-6 rounded-[32px] flex flex-col items-center justify-center text-center h-52 border-2 transition-all duration-300 active:scale-95 ${
                                            correctionMode 
                                                ? 'bg-rose-950/20 border-rose-500/50 hover:bg-rose-500/20' 
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50'
                                        }`}
                                    >
                                        {/* Background Glow Effect */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl rounded-[32px] ${
                                            correctionMode ? 'bg-rose-500/10' : 'bg-indigo-500/10'
                                        }`}></div>

                                        {qtyInCart > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 border-indigo-400 animate-in zoom-in">
                                                {qtyInCart}
                                            </div>
                                        )}
                                        
                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                            <span className="text-lg font-black uppercase text-white leading-tight drop-shadow-md group-hover:scale-105 transition-transform">
                                                {itemName}
                                            </span>
                                            <div className={`h-1 w-8 rounded-full mb-1 transition-all group-hover:w-12 ${
                                                correctionMode ? 'bg-rose-500' : 'bg-indigo-500'
                                            }`}></div>
                                            <span className={`text-3xl font-black ${
                                                correctionMode ? 'text-rose-400' : 'text-emerald-400'
                                            }`}>
                                                {price}€
                                            </span>
                                        </div>
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
                    <div className={`w-full md:w-96 bg-slate-900 flex-col border-l-4 border-indigo-500/50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] ${mobileTab === 'PRODUCTS' ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/80 backdrop-blur-md">
                            <div>
                                <h3 className="font-black text-xl uppercase italic tracking-tighter text-white">Ticket Actual</h3>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest -mt-1">{cartCount} Artículos</p>
                            </div>
                            <button onClick={() => setMobileTab('PRODUCTS')} className="md:hidden p-2 bg-white/5 rounded-xl"><X /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <ShoppingCart size={64} className="mb-4" />
                                    <p className="font-black uppercase text-sm">Ticket Vacío</p>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex justify-between items-center group hover:bg-white/10 transition-all">
                                        <div className="flex-1">
                                            <p className="font-black text-white uppercase leading-tight">{item.name}</p>
                                            <p className="text-sm font-bold text-emerald-400 leading-none mt-1">{item.price}€</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-950/50 p-1 rounded-xl border border-white/5">
                                            <button 
                                                onClick={() => updateCartQty(item.name, -1)} 
                                                className="w-10 h-10 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white rounded-lg transition-all active:scale-90 font-black"
                                            >
                                                -
                                            </button>
                                            <span className="font-black text-xl w-6 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateCartQty(item.name, 1)} 
                                                className="w-10 h-10 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 text-white rounded-lg transition-all active:scale-90 font-black"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 bg-slate-800/80 backdrop-blur-xl border-t-2 border-white/10 safe-pb">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Total Bruto</span>
                                    <div className="h-1 w-12 bg-emerald-500 rounded-full mt-1"></div>
                                </div>
                                <span className="text-5xl font-black text-white tracking-tighter tabular-nums">{cartTotal.toFixed(2)}€</span>
                            </div>
                            <button 
                                onClick={handleCheckout} 
                                disabled={cart.length === 0} 
                                className={`w-full py-6 rounded-3xl font-black uppercase text-xl tracking-widest transition-all duration-500 relative overflow-hidden group/btn ${
                                    cart.length === 0 
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-2 border-transparent' 
                                        : 'bg-emerald-500 text-slate-900 border-2 border-emerald-400 shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95'
                                }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Check size={28} strokeWidth={4} /> Cobrar
                                </span>
                                {cart.length > 0 && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                )}
                            </button>
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
    // RENDER: LOGISTICS MODE - GESTIÓN DE PETICIONES
    // ----------------------------------------------------------------------
    if (mode === 'LOGISTICS') {
        const pendingRequests = incidents.filter(inc =>
            inc.status === 'OPEN' && inc.stockItemId
        );

        const handleMarkAsDelivered = (incidentId: string) => {
            if (confirm('¿Confirmar que has entregado este pedido?')) {
                onMarkAsDelivered?.(incidentId);
                toast.success('Pedido marcado como entregado');
            }
        };

        return (
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white z-[500] flex flex-col h-[100dvh]">
                {/* HEADER LOGÍSTICA */}
                <div className="relative p-6 bg-slate-900/80 backdrop-blur-2xl border-b-4 border-blue-500/50 shrink-0 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)]"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-4">
                             <h2 className="text-3xl font-black uppercase tracking-tighter bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                                📦 Centro Logístico
                            </h2>
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">
                                Live Monitor
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={toggleLock} className={`p-4 rounded-2xl border-2 transition-all duration-300 ${isLocked ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}>
                                {isLocked ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
                            </button>
                            <button
                                onClick={onExit}
                                className="p-4 bg-rose-500/20 hover:bg-rose-500/40 border-2 border-rose-500/50 rounded-2xl text-rose-400 transition-all active:scale-90"
                            >
                                <LogOut size={24} />
                            </button>
                        </div>
                    </div>

                    {/* CONTADOR DE PENDIENTES */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-blue-500/10 rounded-2xl p-4 border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] group hover:bg-blue-500/20 transition-all">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Peticiones en Espera</p>
                            <div className="flex items-end gap-2">
                                <p className="text-5xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{pendingRequests.length}</p>
                                <span className="mb-2 text-blue-400 font-bold uppercase text-xs">Unidades</span>
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 rounded-2xl p-4 border-2 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] group hover:bg-emerald-500/20 transition-all">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Entregas Completadas</p>
                            <div className="flex items-end gap-2">
                                <p className="text-5xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    {incidents.filter(inc => 
                                        inc.status === 'RESOLVED' && 
                                        inc.timestamp.startsWith(new Date().toISOString().split('T')[0])
                                    ).length}
                                </p>
                                <span className="mb-2 text-emerald-400 font-bold uppercase text-xs">Hoy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LISTA DE PETICIONES */}
                <div className="flex-1 overflow-y-auto p-4 pb-32">
                    {pendingRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                            <Package size={64} className="text-blue-300 mb-4" />
                            <p className="font-black uppercase text-sm text-slate-400">No hay peticiones pendientes</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map(request => {
                                const stockItem = stock.find(s => s.id === request.stockItemId);
                                if (!stockItem) return null;

                                const isUrgent = request.priority === 'URGENT';
                                const isSpecialAuth = request.title.includes('🔓 APROBACIÓN REQUERIDA');

                                return (
                                    <div 
                                        key={request.id} 
                                        className={`rounded-[32px] p-6 border-2 transition-all duration-300 relative overflow-hidden group ${
                                            isUrgent 
                                                ? 'bg-rose-950/30 border-rose-500 shadow-[0_10px_30px_rgba(225,29,72,0.2)]' 
                                                : isSpecialAuth 
                                                    ? 'bg-orange-950/30 border-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.2)]' 
                                                    : 'bg-white/5 border-white/10 hover:border-blue-500/50'
                                        }`}
                                    >
                                        {/* Status Glow */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -mr-16 -mt-16 transition-opacity group-hover:opacity-40 ${
                                            isUrgent ? 'bg-rose-500' : isSpecialAuth ? 'bg-orange-500' : 'bg-blue-500'
                                        }`}></div>

                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {isUrgent && (
                                                        <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black uppercase rounded-full animate-pulse shadow-lg shadow-rose-500/50">
                                                            🚨 Emergencia
                                                        </span>
                                                    )}
                                                    {isSpecialAuth && (
                                                        <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-orange-500/50">
                                                            🔓 Autorización
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                                                        request.terminal === 'VENTA' ? 'text-indigo-400' : 'text-rose-400'
                                                    }`}>
                                                        {request.terminal || 'General'}
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-2xl uppercase text-white leading-none tracking-tighter mb-1">
                                                    {stockItem.name}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    {new Date(request.timestamp).toLocaleTimeString('es-ES', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })} • {stockItem.location}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <p className="text-5xl font-black text-white tabular-nums leading-none tracking-tighter italic">
                                                        {request.quantity || 1}
                                                    </p>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                                                        {stockItem.unit}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button 
                                            onClick={() => handleMarkAsDelivered(request.id)}
                                            className="w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                        >
                                            <Check size={24} strokeWidth={4} />
                                            Entregar Pedido
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // RENDER: STOCK ONLY (CAMARERO / CASAL) - DISEÑO PREMIUM
    // ----------------------------------------------------------------------
    const myRequests = incidents.filter(i => (i.requestedBy === userRole || i.terminal === initialMode) && i.status !== 'RESOLVED' && i.status !== 'ARCHIVED');
    const pendingCount = myRequests.filter(i => i.status === 'DELIVERED').length;

    const itemsToShow = stock.sort((a, _b) => (a.quantity <= a.minStock ? -1 : 1));

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white z-[500] flex flex-col h-[100dvh]">
            {/* HEADER PREMIUM */}
            <div className="relative px-4 py-3 bg-slate-900/80 backdrop-blur-2xl border-b-4 border-slate-700/50 shrink-0 safe-pt shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                {/* Fila 1: título + botones de acción */}
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2 min-w-0">
                        <button onClick={onExit} className="shrink-0 p-3 bg-rose-500/20 border-2 border-rose-500/50 rounded-xl text-rose-400 hover:bg-rose-500/40 transition-all active:scale-95">
                            <LogOut size={20} />
                        </button>
                        <button onClick={toggleLock} className={`shrink-0 p-3 rounded-xl border-2 transition-all duration-300 ${isLocked ? 'bg-amber-500 border-amber-400 text-slate-900' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                            {isLocked ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
                        </button>
                        <button
                            onClick={() => setShowRequests(!showRequests)}
                            className={`shrink-0 p-3 rounded-xl border-2 transition-all relative ${showRequests
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-white/5 border-white/10 text-slate-400'
                                }`}
                        >
                            <History size={20} />
                            {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
                        </button>
                        {userRole === 'CAJERO' && (
                            <button onClick={() => setShowCounter(true)} className="shrink-0 p-3 bg-indigo-600 border-2 border-indigo-400 text-white rounded-xl active:scale-95 transition-all">
                                <Ticket size={20} />
                            </button>
                        )}
                        <div className="ml-1 min-w-0">
                            <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white via-slate-300 to-white bg-clip-text text-transparent truncate">
                                Almacén {initialMode}
                            </h2>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
                                Reposición
                            </p>
                        </div>
                    </div>

                    {/* Selector Carga - compacto */}
                    <div className="flex bg-slate-950/50 backdrop-blur-sm rounded-xl p-1 border-2 border-white/10 shadow-inner shrink-0 ml-2">
                        {(['BAJA', 'NORMAL', 'ALTA'] as KioskWorkload[]).map(w => (
                            <button
                                key={w}
                                onClick={() => setWorkload(w)}
                                className={`px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-all duration-300 ${workload === w
                                    ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* GRID STOCK PREMIUM */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-36 custom-scrollbar relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                    {itemsToShow.map(item => {
                        const isLow = item.quantity <= item.minStock;
                        const limit = initialMode === 'CASAL' ? (item.dailyLimit || 0) : 0;
                        const todayUsage = limit > 0 ? getTodayUsage(item.id) : 0;
                        const remaining = Math.max(0, limit - todayUsage);

                        return (
                            <button
                                key={item.id}
                                onClick={() => { setRestockItem(item); setRestockQty(1); }}
                                className={`group relative p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border-4 transition-all duration-300 active:scale-95 flex flex-col min-h-[180px] sm:min-h-[260px] overflow-hidden ${
                                    isLow 
                                        ? 'bg-rose-950/20 border-rose-500 shadow-[0_10px_0_0_rgba(225,29,72,0.4)] hover:translate-y-[-4px] hover:shadow-[0_14px_0_0_rgba(225,29,72,0.4)]' 
                                        : 'bg-white/5 border-white/10 hover:border-indigo-500 hover:translate-y-[-4px] hover:shadow-[0_10px_0_0_rgba(79,70,229,0.4)]'
                                }`}
                            >
                                {/* Status Glow */}
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 transition-opacity group-hover:opacity-30 ${
                                    isLow ? 'bg-rose-500' : 'bg-indigo-500'
                                }`}></div>

                                <div className="relative z-10 flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl border-2 ${
                                        isLow ? 'bg-rose-500/20 border-rose-400 text-rose-400' : 'bg-indigo-500/20 border-indigo-400 text-indigo-400'
                                    }`}>
                                        {item.category.includes('BEBIDA') ? <Wine size={24} /> : <Package size={24} />}
                                    </div>
                                    {isLow && (
                                        <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-rose-500/40">
                                            Bajo
                                        </div>
                                    )}
                                </div>

                                <h4 className="relative z-10 font-black text-xl uppercase text-white leading-none tracking-tighter mb-4 line-clamp-2 drop-shadow-md text-left">
                                    {item.name}
                                </h4>

                                <div className="relative z-10 mt-auto space-y-3">
                                    {limit > 0 ? (
                                        <div className="bg-slate-950/50 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cupo Hoy</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-2xl font-black ${remaining === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{remaining}</span>
                                                <span className="text-xs font-bold text-slate-600">/ {limit}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                                            <Zap size={14} className="text-emerald-400" />
                                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Sin Límite</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center bg-slate-950/40 rounded-2xl p-3 border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Stock</span>
                                        <span className={`text-2xl font-black tabular-nums ${isLow ? 'text-rose-400' : 'text-white'}`}>
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
            <div className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-4 bg-slate-950/90 backdrop-blur-3xl border-t-2 border-white/10 z-40 shadow-2xl safe-pb">
                <button
                    onClick={handleIceRequest}
                    className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-[28px] border-2 border-cyan-400 text-white flex items-center justify-center gap-3 
                          shadow-[0_15px_40px_rgba(6,182,212,0.3)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.5)]
                          active:scale-95 transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Snowflake size={26} className="animate-spin-slow relative z-10 drop-shadow-lg" />
                    <span className="font-black text-base sm:text-2xl uppercase tracking-tighter relative z-10 italic">Solicitar Hielo Urgente</span>
                </button>
            </div>

            {/* MODAL REPOSICION PREMIUM */}
            {restockItem && (() => {
                const limit = restockItem.dailyLimit || 0;
                const todayUsage = limit > 0 ? getTodayUsage(restockItem.id) : 0;
                const remaining = Math.max(0, limit - todayUsage);
                const isOverQuota = limit > 0 && restockQty > remaining;

                return (
                    <div className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-slate-900 border-4 border-indigo-500/50 w-full max-w-sm rounded-[40px] p-8 shadow-[0_0_50px_rgba(79,70,229,0.3)] relative overflow-hidden">
                            {/* Accent Glow */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse"></div>
                            
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Solicitud de Material</p>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{restockItem.name}</h3>
                                </div>
                                <button onClick={() => setRestockItem(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* INFORMACIÓN DEL PRODUCTO */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 rounded-3xl p-4 border-2 border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estado Stock</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-3xl font-black ${restockItem.quantity <= restockItem.minStock ? 'text-rose-400' : 'text-white'}`}>
                                            {restockItem.quantity}
                                        </span>
                                        <span className="text-xs font-bold text-slate-600 uppercase">{restockItem.unit}</span>
                                    </div>
                                </div>

                                {limit > 0 ? (
                                    <div className="bg-white/5 rounded-3xl p-4 border-2 border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cupo Restante</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-3xl font-black ${remaining === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {remaining}
                                            </span>
                                            <span className="text-xs font-bold text-slate-600">/ {limit}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-500/10 rounded-3xl p-4 border-2 border-emerald-500/20 flex flex-col items-center justify-center">
                                        <Zap size={20} className="text-emerald-400 mb-1" />
                                        <span className="text-[10px] font-black uppercase text-emerald-400">Sin Límite</span>
                                    </div>
                                )}
                            </div>

                            {/* BLOQUEO SI EXCEDE CUPO */}
                            {isOverQuota && (
                                <div className="mb-6 bg-rose-500/10 border-4 border-rose-500/30 rounded-3xl p-5 shadow-[0_10px_30px_rgba(225,29,72,0.2)]">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-rose-500 rounded-xl p-2 text-white shadow-lg shadow-rose-500/40">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-rose-400 uppercase leading-none mb-1">Exceso de Cupo</p>
                                            <p className="text-[10px] text-rose-300 font-bold leading-tight">
                                                Requiere justificación especial para superar el límite de <span className="text-white">{limit} {restockItem.unit}</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SELECTOR DE CANTIDAD */}
                            <div className={`bg-slate-950/50 p-6 rounded-[32px] mb-8 border-4 transition-all duration-300 ${
                                isOverQuota ? 'border-rose-500/40' : 'border-indigo-500/20'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setRestockQty(Math.max(1, restockQty - 1))}
                                        className="w-14 h-14 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center text-white transition-all active:scale-90"
                                    >
                                        <Minus size={24} strokeWidth={3} />
                                    </button>
                                    <div className="text-center">
                                        <span className={`text-5xl font-black italic tracking-tighter ${isOverQuota ? 'text-rose-400' : 'text-white'}`}>
                                            {restockQty}
                                        </span>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{restockItem.unit}</p>
                                    </div>
                                    <button
                                        onClick={() => setRestockQty(restockQty + 1)}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all active:scale-90 shadow-lg ${
                                            isOverQuota ? 'bg-rose-600 shadow-rose-500/20' : 'bg-indigo-600 shadow-indigo-500/20'
                                        }`}
                                    >
                                        <Plus size={24} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            {/* JUSTIFICACIÓN */}
                            {isOverQuota && (
                                <div className="mb-8 animate-in slide-in-from-bottom-4">
                                     <textarea
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        placeholder="¿Por qué necesitas más cantidad?"
                                        className="w-full p-5 bg-slate-950 border-4 border-white/5 rounded-[24px] text-white text-sm outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700 resize-none"
                                        rows={3}
                                    />
                                    <p className="text-[9px] font-bold text-indigo-400/60 mt-2 uppercase text-center">Será revisado por un administrador</p>
                                </div>
                            )}

                            {/* BOTÓN FINAL */}
                            <button
                                onClick={isOverQuota ? requestSpecialAuthorization : confirmRestock}
                                disabled={isOverQuota && !justification.trim()}
                                className={`w-full py-6 rounded-[24px] font-black uppercase text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${
                                    isOverQuota 
                                        ? (justification.trim() ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed')
                                        : 'bg-indigo-600 text-white shadow-indigo-500/30'
                                }`}
                            >
                                {isOverQuota ? <ShieldAlert size={24} /> : <Check size={24} strokeWidth={4} />}
                                {isOverQuota ? 'Solicitar Autorización' : 'Confirmar Pedido'}
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* MODAL CONTADORES (STOCK MODE) PREMIUM */}
            {showCounter && (
                <div className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-sm rounded-[40px] p-8 border-4 border-indigo-500/50 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Tickets Vendidos</h3>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Live Preparation Queue</p>
                            </div>
                            <button onClick={() => setShowCounter(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {Object.entries(ticketCounts).length > 0 ? Object.entries(ticketCounts).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([name, count]) => (
                                <div key={name} className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border-2 border-white/5 group hover:border-indigo-500/30 transition-all">
                                    <span className="font-black text-white uppercase text-sm tracking-tight">{name}</span>
                                    <div className="bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/30">
                                        <span className="text-3xl font-black text-indigo-400 tabular-nums">{count}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-slate-600 font-black uppercase text-xs tracking-widest opacity-50">Sin ventas hoy</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL MIS PETICIONES PREMIUM */}
            {showRequests && (
                <div className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border-4 border-indigo-500/50 w-full max-w-md rounded-[40px] p-8 max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Historial Live</h3>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Seguimiento de Reposición</p>
                            </div>
                            <button onClick={() => setShowRequests(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {myRequests.length === 0 ? (
                                <div className="py-20 text-center text-slate-600 font-black uppercase text-xs tracking-widest opacity-50 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                        <History size={40} className="text-slate-600" />
                                    </div>
                                    Bandeja de Entrada Vacía
                                </div>
                            ) : (
                                myRequests.map(req => {
                                    const stockItem = stock.find(s => s.id === req.stockItemId);
                                    if (!stockItem) return null;

                                    const isDelivered = req.status === 'DELIVERED';
                                    const isPendingApproval = req.status === 'PENDING_APPROVAL';

                                    return (
                                        <div key={req.id} className={`p-6 rounded-[32px] border-2 transition-all relative overflow-hidden ${
                                            isDelivered
                                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                                : isPendingApproval
                                                    ? 'bg-orange-500/10 border-orange-500/40 animate-pulse'
                                                    : 'bg-white/5 border-white/10'
                                            }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-black text-xl text-white uppercase tracking-tighter italic">{stockItem.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                                    isDelivered ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/20' :
                                                    isPendingApproval ? 'bg-orange-500 text-slate-900 shadow-orange-500/20' :
                                                    'bg-indigo-500 text-white shadow-indigo-500/20'
                                                }`}>
                                                    {isDelivered ? 'Listos' : isPendingApproval ? 'Bajo Revisión' : 'En Cola'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-3xl font-black text-white tabular-nums leading-none italic">{req.quantity} <span className="text-[10px] not-italic text-slate-500 uppercase">{stockItem.unit}</span></p>
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{req.justification ? '⚡ Autorización Especial' : '📦 Reposición Estándar'}</p>
                                                </div>
                                                {isDelivered && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('¿Confirmas que has recibido este pedido?')) {
                                                                onConfirmReceipt?.(req.id);
                                                            }
                                                        }}
                                                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        <Check size={18} strokeWidth={3} />
                                                        Recibido
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
