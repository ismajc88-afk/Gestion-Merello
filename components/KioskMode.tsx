
import React, { useState, useEffect, useRef } from 'react';
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
    onConfirmReceipt
}) => {
    // --- STATE ---
    const [workload, setWorkload] = useState<KioskWorkload>('NORMAL');
    const [showRequests, setShowRequests] = useState(false);
    const toast = useToast();

    // --- DEDUP: Evitar peticiones duplicadas (30 segundos) ---
    const lastRequestRef = useRef<{ itemId: string; timestamp: number } | null>(null);
    const isDuplicate = (itemId: string) => {
        const now = Date.now();
        if (lastRequestRef.current && lastRequestRef.current.itemId === itemId && (now - lastRequestRef.current.timestamp) < 30000) {
            return true;
        }
        lastRequestRef.current = { itemId, timestamp: now };
        return false;
    };

    // POS State (Solo para Cajeros)
    const [cart, setCart] = useState<{ name: string, price: number, quantity: number }[]>([]);
    const [mobileTab, setMobileTab] = useState<'PRODUCTS' | 'CART'>('PRODUCTS');
    const [showCounter, setShowCounter] = useState(false);
    const [manualCountMode, setManualCountMode] = useState(false);
    const [correctionMode, setCorrectionMode] = useState(false);
    const [showChangeCalc, setShowChangeCalc] = useState(false);
    const [paidAmount, setPaidAmount] = useState('');
    const [lastSaleTotal, setLastSaleTotal] = useState(0);
    const salesGoal = 500; // Objetivo de ventas €

    // Stock State (Para Camareros/Casal)
    const [restockItem, setRestockItem] = useState<StockItem | null>(null);
    const [restockQty, setRestockQty] = useState(1);
    const [restockUrgency, setRestockUrgency] = useState<'NORMAL' | 'URGENT'>('NORMAL');
    const [justification, setJustification] = useState(''); // Para peticiones que excedan cupo

    // Change Request State (Para Cajeros)
    const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
    const [changeRequestAmount, setChangeRequestAmount] = useState<number | string>('');

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
        setLastSaleTotal(cartTotal);
        onTicketSale?.(cart);
        setCart([]);
        setMobileTab('PRODUCTS');
        setShowChangeCalc(true);
        setPaidAmount('');
    };

    // --- COMBOS/DESCUENTOS ---
    const combos = [
        { items: ['RON', 'COCA-COLA'], comboPrice: 3.5, label: 'Cubata Combo' },
        { items: ['GINEBRA', 'TÓNICA'], comboPrice: 4.0, label: 'GinTonic Combo' },
        { items: ['VODKA', 'NARANJA'], comboPrice: 3.5, label: 'Vodka Naranja Combo' },
    ];
    const appliedCombos = combos.filter(combo => {
        return combo.items.every(itemName =>
            cart.some(c => c.name.toUpperCase().includes(itemName))
        );
    });
    const comboDiscount = appliedCombos.reduce((acc, combo) => {
        const normalPrice = combo.items.reduce((sum, itemName) => {
            const cartItem = cart.find(c => c.name.toUpperCase().includes(itemName));
            return sum + (cartItem?.price || 0);
        }, 0);
        return acc + (normalPrice - combo.comboPrice);
    }, 0);
    const finalTotal = cartTotal - comboDiscount;

    // --- TOP 3 PRODUCTOS ---
    const top3 = Object.entries(ticketCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3);
    const totalSalesEuros = Object.entries(ticketCounts).reduce((acc, [name, count]) => {
        const price = prices.find(p => p.name.toUpperCase() === name.toUpperCase())?.price || 0;
        return acc + (price * (count as number));
    }, 0);

    const handleIceRequest = () => {
        if (isDuplicate('ICE_REQUEST')) {
            toast.warning('Ya has pedido hielo hace menos de 30 segundos');
            return;
        }
        onCreateIncident('Necesitamos Hielo Urgente', 'URGENT', undefined, 1, initialMode);
        alert("❄️ AVISO DE HIELO ENVIADO");
    };

    const handleChangeRequest = (amount: number | string) => {
        if (isDuplicate('CHANGE_REQUEST')) {
            toast.warning('Ya has pedido cambio hace menos de 30 segundos');
            return;
        }
        onCreateIncident(`🚨 NECESITAMOS CAMBIO: ${amount}€`, 'URGENT', undefined, 1, initialMode);
        setShowChangeRequestModal(false);
        setChangeRequestAmount('');
        toast.success(`Aviso de cambio de ${amount}€ enviado a Coordinación`);
    };

    const confirmRestock = () => {
        if (!restockItem) return;
        if (isDuplicate(restockItem.id)) {
            toast.warning(`Ya pediste ${restockItem.name} hace menos de 30 segundos`);
            return;
        }
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
                <div className="px-3 py-2 bg-slate-900 border-b border-white/10 flex justify-between items-center shrink-0 safe-pt">
                    <div className="flex items-center gap-2">
                        <button onClick={onExit} className="p-2.5 bg-white/10 rounded-xl hover:bg-rose-500/20"><LogOut size={18} /></button>
                        <h2 className="font-black text-base md:text-lg uppercase italic tracking-tighter">CAJA / TPV</h2>
                    </div>
                    <div className="flex gap-1.5">
                        <button onClick={() => { setCorrectionMode(!correctionMode); setManualCountMode(false); }} className={`p-2.5 rounded-xl ${correctionMode ? 'bg-rose-500 animate-pulse' : 'bg-white/10'}`}><RotateCcw size={18} /></button>
                        <button onClick={() => setShowCounter(true)} className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl"><Ticket size={18} /></button>
                    </div>
                </div>

                {/* BODY POS */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* GRID PRODUCTOS */}
                    <div className={`flex-1 flex flex-col bg-[#0f172a] ${mobileTab === 'CART' ? 'hidden md:flex' : 'flex'}`}>
                        {/* CONTADOR VENTAS + OBJETIVO */}
                        <div className="bg-emerald-600/20 border-b border-emerald-500/30 px-3 py-1.5 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Ticket size={12} className="text-emerald-400" />
                                    <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wider">Ventas</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-white tabular-nums">
                                        {Object.values(ticketCounts).reduce((a, c) => a + (c as number), 0)} uds
                                    </span>
                                    <span className="text-xs font-black text-emerald-400 tabular-nums">{totalSalesEuros.toLocaleString('es-ES')}€</span>
                                </div>
                            </div>
                            {/* OBJETIVO DE VENTAS */}
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${totalSalesEuros >= salesGoal ? 'bg-emerald-400' : totalSalesEuros >= salesGoal * 0.7 ? 'bg-amber-400' : 'bg-indigo-400'}`} style={{ width: `${Math.min((totalSalesEuros / salesGoal) * 100, 100)}%` }}></div>
                                </div>
                                <span className="text-[8px] font-black text-slate-400 tabular-nums whitespace-nowrap">{Math.round((totalSalesEuros / salesGoal) * 100)}% de {salesGoal}€</span>
                            </div>
                        </div>
                        {/* TOP 3 PRODUCTOS */}
                        {top3.length > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 border-b border-white/5 shrink-0 overflow-x-auto">
                                <span className="text-[8px] font-black text-amber-400 uppercase shrink-0">Top:</span>
                                {top3.map(([name, count], i) => (
                                    <span key={name} className="text-[9px] font-black text-slate-300 whitespace-nowrap">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {name} <span className="text-emerald-400">{count}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                        {manualCountMode && <div className="bg-orange-500 text-black text-center text-xs font-black py-1">MODO CONTEO (NO COBRA)</div>}
                        {correctionMode && <div className="bg-rose-600 text-white text-center text-xs font-black py-1">MODO CORRECCIÓN (RESTAR)</div>}

                        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-2 md:p-4 pb-24 overflow-y-auto">
                            {allItems.map(itemName => {
                                const price = prices.find(p => p.name.toUpperCase() === itemName.toUpperCase())?.price || 0;
                                const qtyInCart = cart.find(i => i.name === itemName)?.quantity || 0;
                                return (
                                    <button key={itemName} onClick={() => handleProductClick(itemName, price)} className={`relative p-2 md:p-4 rounded-2xl md:rounded-3xl flex flex-col items-center justify-between text-center h-28 md:h-44 border-2 active:scale-95 transition-transform ${correctionMode ? 'bg-rose-50 border-rose-500' : 'bg-white border-slate-100'}`}>
                                        {qtyInCart > 0 && <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3 bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center font-black text-xs md:text-sm">{qtyInCart}</div>}
                                        <span className="text-[11px] md:text-base font-black uppercase text-slate-900 mt-2 leading-tight line-clamp-2">{itemName}</span>
                                        <span className="text-lg md:text-2xl font-black text-emerald-500 mb-1">{price}€</span>
                                    </button>
                                );
                            })}
                        </div>
                        {/* FAB CART MOBILE */}
                        <div className="md:hidden absolute bottom-2 left-2 right-2">
                            <button onClick={() => setMobileTab('CART')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2">
                                <ShoppingCart size={18} /> Ticket ({cartCount}) · {finalTotal.toFixed(2)}€
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
                        <div className="p-4 md:p-6 bg-slate-800 border-t border-white/10 safe-pb">
                            {appliedCombos.length > 0 && (
                                <div className="mb-2 space-y-1">
                                    {appliedCombos.map((combo, i) => (
                                        <div key={i} className="flex justify-between items-center bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                                            <span>🎯 {combo.label}</span>
                                            <span>-{(cartTotal - finalTotal).toFixed(2)}€</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-slate-400 font-bold text-[10px] uppercase">Total</span>
                                <div className="text-right">
                                    {comboDiscount > 0 && <span className="text-xs text-slate-500 line-through mr-2">{cartTotal.toFixed(2)}€</span>}
                                    <span className="text-3xl md:text-4xl font-black">{finalTotal.toFixed(2)}€</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setShowChangeRequestModal(true)}
                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 transition-colors border-b-4 border-amber-700 active:translate-y-1 active:border-b-0"
                                >
                                    <AlertTriangle size={18} /> Pedir Cambio
                                </button>
                                <button
                                    onClick={() => setCart([])}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl font-bold uppercase text-xs md:text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <X size={18} /> Cancelar
                                </button>
                            </div>
                            <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl font-black uppercase text-base md:text-lg">Cobrar</button>
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

                {/* MODAL CALCULADORA DE CAMBIO */}
                {showChangeCalc && (
                    <div className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-slate-900 w-full max-w-sm rounded-[32px] p-6 border border-emerald-500/50">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-black text-white">💰 Cambio</h3>
                                <button onClick={() => setShowChangeCalc(false)}><X /></button>
                            </div>
                            <div className="bg-slate-800 rounded-2xl p-4 mb-4 text-center">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Total cobrado</p>
                                <p className="text-3xl font-black text-emerald-400">{lastSaleTotal.toFixed(2)}€</p>
                            </div>
                            <div className="mb-4">
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">El cliente paga con:</p>
                                <input
                                    type="number"
                                    value={paidAmount}
                                    onChange={e => setPaidAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl text-center text-3xl font-black text-white outline-none focus:border-emerald-500"
                                    autoFocus
                                />
                            </div>
                            {paidAmount && Number(paidAmount) >= lastSaleTotal && (
                                <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] text-emerald-300 uppercase font-bold">Devolver</p>
                                    <p className="text-4xl font-black text-emerald-400">{(Number(paidAmount) - lastSaleTotal).toFixed(2)}€</p>
                                </div>
                            )}
                            {paidAmount && Number(paidAmount) < lastSaleTotal && (
                                <div className="bg-rose-500/20 border border-rose-500/50 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] text-rose-300 uppercase font-bold">Falta</p>
                                    <p className="text-4xl font-black text-rose-400">{(lastSaleTotal - Number(paidAmount)).toFixed(2)}€</p>
                                </div>
                            )}
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {[5, 10, 20, 50].map(v => (
                                    <button key={v} onClick={() => setPaidAmount(String(v))} className="py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-black text-white">{v}€</button>
                                ))}
                            </div>
                            <button onClick={() => setShowChangeCalc(false)} className="w-full mt-4 py-4 bg-emerald-500 text-slate-900 rounded-2xl font-black uppercase">Cerrar</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // RENDER: LOGISTICS MODE - KANBAN SIMPLIFICADO (2 COLUMNAS)
    // ----------------------------------------------------------------------
    if (mode === 'LOGISTICS') {
        // Pendientes = todo lo que NO está RESOLVED (incluye DELIVERED antiguos)
        const pendingRequests = incidents.filter(inc => (inc.status === 'OPEN' || inc.status === 'PENDING_DELIVERY' || inc.status === 'PENDING_APPROVAL' || inc.status === 'DELIVERED') && inc.stockItemId);
        const completedToday = incidents.filter(inc => inc.status === 'RESOLVED' && inc.stockItemId && inc.timestamp.startsWith(new Date().toISOString().split('T')[0]));

        const handleResolve = (incidentId: string) => {
            if (confirm('¿Enviado/entregado este pedido?')) {
                onConfirmReceipt?.(incidentId);
                toast.success('✅ Pedido completado');
            }
        };

        const renderCard = (request: typeof incidents[0], done: boolean) => {
            const stockItem = stock.find(s => s.id === request.stockItemId);
            if (!stockItem) return null;
            const isUrgent = request.priority === 'URGENT';

            return (
                <div key={request.id} className={`rounded-2xl p-4 border-2 shadow-sm transition-all ${isUrgent && !done ? 'bg-red-500/10 border-red-500/30 animate-pulse' : done ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' : 'bg-slate-800/50 border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-1.5">
                            {isUrgent && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase rounded-full">🚨 Urgente</span>}
                            <span className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[9px] font-black uppercase rounded-full border border-slate-700">{request.terminal || 'Barra'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(request.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className={`font-black uppercase leading-tight mb-3 ${done ? 'text-emerald-500/60 line-through text-sm' : 'text-white text-lg'}`}>{stockItem.name}</h3>
                    <div className="flex justify-between items-end mb-3 bg-slate-950/50 rounded-xl p-3 border border-white/5">
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Cantidad</p>
                            <span className="text-2xl font-black text-white">{request.quantity || 1}</span>
                            <span className="text-xs font-bold text-slate-500 ml-1">{stockItem.unit}</span>
                        </div>
                        <div className="text-right text-[9px] font-bold text-slate-500">
                            <p>Ubic: <span className="text-slate-300">{stockItem.location}</span></p>
                        </div>
                    </div>
                    {!done && (
                        <button onClick={() => handleResolve(request.id)} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/25">
                            <Check size={18} /> Enviado ✅
                        </button>
                    )}
                    {done && (
                        <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500/70 rounded-xl font-black uppercase text-[10px] text-center flex items-center justify-center gap-2">
                            <Check size={14} /> Hecho
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-slate-950 text-white z-[500] flex flex-col h-[100dvh]">
                <div className="relative p-3 md:p-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center shrink-0 z-10 shadow-2xl safe-pt">
                    <div className="relative flex items-center gap-2 md:gap-4">
                        <button onClick={onExit} className="p-2.5 bg-white/5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-all active:scale-95 border border-white/5 shrink-0"><LogOut size={18} /></button>
                        <div>
                            <h2 className="font-black text-lg md:text-2xl uppercase italic tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">📦 LOGÍSTICA</h2>
                            <p className="text-[9px] md:text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider mt-0.5">Toca "Enviado" cuando entregues</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto md:overflow-y-hidden p-3 md:p-6">
                    <div className="flex flex-col md:flex-row md:grid md:grid-cols-2 gap-3 md:gap-5 h-auto md:h-full">
                        {/* PENDIENTES */}
                        <div className="w-full md:w-auto md:h-full flex flex-col bg-slate-900/40 backdrop-blur-md rounded-2xl md:rounded-[32px] border border-white/5 overflow-hidden shadow-2xl min-h-[200px] md:min-h-0">
                            <div className="p-3 md:p-5 border-b border-white/5 bg-slate-800/50 flex justify-between items-center">
                                <h3 className="font-black uppercase text-sm text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-500/20 rounded-lg"><AlertTriangle size={16} className="text-amber-400" /></div>
                                    Pendientes
                                </h3>
                                <span className="px-3 py-1 bg-amber-500 text-amber-950 font-black text-xs rounded-xl">{pendingRequests.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {pendingRequests.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-6">
                                        <Package size={48} className="text-amber-400/50 mb-4" />
                                        <p className="text-xs font-black uppercase text-slate-300">Todo al día 🎉</p>
                                    </div>
                                ) : pendingRequests.map(req => renderCard(req, false))}
                            </div>
                        </div>

                        {/* COMPLETADOS HOY */}
                        <div className="w-full md:w-auto md:h-full flex flex-col bg-slate-900/40 backdrop-blur-md rounded-2xl md:rounded-[32px] border border-white/5 overflow-hidden shadow-2xl min-h-[200px] md:min-h-0">
                            <div className="p-3 md:p-5 border-b border-white/5 bg-emerald-900/10 flex justify-between items-center">
                                <h3 className="font-black uppercase text-sm text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-500/20 rounded-lg"><Check size={16} className="text-emerald-400" /></div>
                                    Hecho Hoy
                                </h3>
                                <span className="px-3 py-1 bg-emerald-500 text-emerald-950 font-black text-xs rounded-xl">{completedToday.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {completedToday.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-6">
                                        <Check size={48} className="text-emerald-400/50 mb-4" />
                                        <p className="text-xs font-black uppercase text-slate-300">Sin entregas aún</p>
                                    </div>
                                ) : completedToday.map(req => renderCard(req, true))}
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
    // Historial completo de hoy incluyendo resueltas
    const today = new Date().toISOString().split('T')[0];
    const allMyRequestsToday = incidents
        .filter(i => (i.requestedBy === userRole || i.terminal === initialMode) && i.timestamp.startsWith(today))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const itemsToShow = stock.filter(s => s.usageType === initialMode).sort((a, _b) => (a.quantity <= a.minStock ? -1 : 1));

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white z-[500] flex flex-col h-[100dvh]">
            {/* HEADER PREMIUM */}
            <div className="relative p-3 md:p-4 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-white/10 shrink-0 safe-pt shadow-2xl">
                {/* Efecto de brillo en el header */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

                <div className="relative flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <button onClick={onExit} className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl md:rounded-2xl hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/30 active:scale-95 transition-all shrink-0">
                            <LogOut size={18} />
                        </button>
                        <button
                            onClick={() => setShowRequests(!showRequests)}
                            className={`p-2.5 rounded-xl md:rounded-2xl transition-all relative shrink-0 ${showRequests
                                ? 'bg-indigo-500/30 text-indigo-400 border border-indigo-500/50'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/5'
                                }`}
                        >
                            <History size={18} />
                            {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
                        </button>
                        <div className="min-w-0">
                            <h2 className="font-black text-base md:text-2xl uppercase italic tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent truncate">
                                Almacén {initialMode}
                            </h2>
                            <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider md:tracking-widest flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                <span className="hidden sm:inline">Toca para solicitar</span>
                                <span className="sm:hidden">Solicitar</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center shrink-0">
                        {/* BOTÓN DE TICKETS SOLO VISIBLE PARA CAJERO */}
                        {userRole === 'CAJERO' && (
                            <button onClick={() => setShowCounter(true)} className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transition-all">
                                <Ticket size={18} />
                            </button>
                        )}

                        {/* Selector de carga de trabajo mejorado */}
                        <div className="flex bg-slate-950/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-1 md:p-1.5 border border-white/10 shadow-lg">
                            {(['BAJA', 'NORMAL', 'ALTA'] as KioskWorkload[]).map(w => (
                                <button
                                    key={w}
                                    onClick={() => setWorkload(w)}
                                    className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase transition-all ${workload === w
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
            <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-28">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                    {itemsToShow.map(item => {
                        const isLow = item.quantity <= item.minStock;
                        const limit = item.dailyLimit || 0;
                        const todayUsage = limit > 0 ? getTodayUsage(item.id) : 0;
                        const remaining = Math.max(0, limit - todayUsage);
                        const stockPercent = item.minStock > 0 ? Math.min((item.quantity / (item.minStock * 2)) * 100, 100) : 100;

                        // Emoji según categoría para distinguir visualmente
                        const catEmoji = item.category?.includes('BEBIDA') ? '🍺'
                            : item.category?.includes('LICOR') ? '🥃'
                                : item.category?.includes('REFRESCO') ? '🥤'
                                    : item.category?.includes('VINO') ? '🍷'
                                        : item.category?.includes('SUMINISTRO') ? '🧻'
                                            : item.category?.includes('COMIDA') ? '🍖'
                                                : item.category?.includes('HIELO') ? '🧊'
                                                    : item.category?.includes('VASO') ? '🥤'
                                                        : '📦';

                        return (
                            <button
                                key={item.id}
                                onClick={() => { setRestockItem(item); setRestockQty(1); }}
                                className={`group relative rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300
                                      hover:-translate-y-1 hover:shadow-2xl active:scale-95
                                      ${isLow
                                        ? 'bg-gradient-to-br from-amber-500/10 to-red-500/10 border-2 border-amber-500/50 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30'
                                        : 'bg-white/[0.04] border-2 border-white/10 hover:border-indigo-500/40 hover:shadow-indigo-500/20'
                                    }`}
                            >
                                {/* Glow effect */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isLow ? 'bg-gradient-to-t from-amber-500/10 to-transparent' : 'bg-gradient-to-t from-indigo-500/10 to-transparent'}`}></div>

                                {/* Content */}
                                <div className="relative z-10 p-3 md:p-4 flex flex-col h-[150px] md:h-[180px]">
                                    {/* Top row: photo/emoji + badge */}
                                    <div className="flex justify-between items-start mb-2">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-lg group-hover:scale-110 transition-transform" onError={(e) => { const el = e.currentTarget; el.style.display = 'none'; }} />
                                        ) : null}
                                        <span className={`text-3xl drop-shadow-lg group-hover:scale-110 transition-transform ${item.imageUrl ? 'hidden' : ''}`}>{catEmoji}</span>
                                        {isLow && (
                                            <span className="px-2 py-0.5 bg-amber-500 text-[9px] font-black uppercase rounded-full text-amber-950 animate-pulse shadow-lg">⚠ Bajo</span>
                                        )}
                                        {limit > 0 && !isLow && (
                                            <span className="px-2 py-0.5 bg-slate-700/80 text-[9px] font-black uppercase rounded-full text-slate-300 border border-white/10">{remaining}/{limit}</span>
                                        )}
                                    </div>

                                    {/* Product name */}
                                    <h4 className="font-black text-sm uppercase text-white leading-snug line-clamp-2 mb-auto tracking-tight">
                                        {item.name}
                                    </h4>

                                    {/* Bottom: stock bar + number */}
                                    <div className="mt-3 space-y-2">
                                        {/* Stock progress bar */}
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${isLow ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'}`}
                                                style={{ width: `${stockPercent}%` }}
                                            ></div>
                                        </div>

                                        {/* Stock number */}
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">Stock</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xl font-black tabular-nums ${isLow ? 'text-amber-400' : 'text-white'}`}>{item.quantity}</span>
                                                <span className="text-[10px] font-bold text-slate-500">{item.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* BOTTOM BAR PREMIUM */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 z-40 shadow-2xl safe-pb">
                <button
                    onClick={handleIceRequest}
                    className="w-full py-4 md:py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl md:rounded-[24px] text-white flex items-center justify-center gap-2 md:gap-3 
                          shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.6)]
                          active:scale-98 transition-all group relative overflow-hidden"
                >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <Snowflake size={22} className="animate-spin-slow relative z-10" />
                    <span className="font-black text-sm md:text-lg uppercase tracking-wider relative z-10">Pedir Hielo</span>
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
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase">Mis Peticiones</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Historial hoy · {allMyRequestsToday.length} solicitudes</p>
                            </div>
                            <button onClick={() => setShowRequests(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X /></button>
                        </div>

                        {/* SEMÁFORO RESUMEN */}
                        <div className="flex gap-2 mb-4 shrink-0">
                            <div className="flex-1 bg-rose-500/20 border border-rose-500/30 rounded-xl p-2 text-center">
                                <p className="text-[9px] font-bold text-rose-300">🔴 Pendiente</p>
                                <p className="text-lg font-black text-white">{allMyRequestsToday.filter(i => i.status === 'OPEN' || i.status === 'PENDING_APPROVAL').length}</p>
                            </div>
                            <div className="flex-1 bg-amber-500/20 border border-amber-500/30 rounded-xl p-2 text-center">
                                <p className="text-[9px] font-bold text-amber-300">🟡 En camino</p>
                                <p className="text-lg font-black text-white">{allMyRequestsToday.filter(i => i.status === 'DELIVERED').length}</p>
                            </div>
                            <div className="flex-1 bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-2 text-center">
                                <p className="text-[9px] font-bold text-emerald-300">🟢 Hecho</p>
                                <p className="text-lg font-black text-white">{allMyRequestsToday.filter(i => i.status === 'RESOLVED' || i.status === 'ARCHIVED').length}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {allMyRequestsToday.length === 0 ? (
                                <div className="py-10 text-center text-slate-500 font-bold uppercase text-xs opacity-50 flex flex-col items-center gap-3">
                                    <History size={48} />
                                    No tienes peticiones hoy
                                </div>
                            ) : (
                                allMyRequestsToday.map(req => {
                                    const stockItem = stock.find(s => s.id === req.stockItemId);
                                    if (!stockItem) return null;

                                    const isDelivered = req.status === 'DELIVERED';
                                    const isPendingApproval = req.status === 'PENDING_APPROVAL';
                                    const isResolved = req.status === 'RESOLVED' || req.status === 'ARCHIVED';
                                    const isOpen = req.status === 'OPEN';
                                    const statusIcon = isResolved ? '✅' : isDelivered ? '🟡' : isPendingApproval ? '🟠' : '🔴';
                                    const statusLabel = isResolved ? 'Recibido' : isDelivered ? 'Listo para recoger' : isPendingApproval ? 'Esperando Aprobación' : 'Pendiente';
                                    const time = new Date(req.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div key={req.id} className={`p-4 rounded-2xl border ${isResolved
                                            ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                                            : isDelivered
                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                : isPendingApproval
                                                    ? 'bg-orange-500/10 border-orange-500/30'
                                                    : 'bg-slate-800/50 border-slate-700/50'
                                            }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{statusIcon}</span>
                                                    <h4 className="font-black text-white uppercase">{stockItem.name}</h4>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isResolved ? 'bg-emerald-800 text-emerald-300' : isDelivered ? 'bg-emerald-500 text-slate-900' :
                                                    isPendingApproval ? 'bg-orange-500 text-slate-900 animate-pulse' :
                                                        'bg-blue-500 text-white'
                                                    }`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs text-slate-400">
                                                    <p>Cantidad: <span className="text-white font-bold">{req.quantity} {stockItem.unit}</span></p>
                                                    <p className="text-[10px]">📍 {time} · {req.justification ? 'Autorización Especial' : 'Reposición Normal'}</p>
                                                </div>
                                                {isDelivered && !isResolved && (
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
            {/* MODAL PEDIR CAMBIO/SUELTO */}
            {showChangeRequestModal && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white p-6 md:p-8 rounded-[40px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 border-4 border-amber-500">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-amber-300 transform -rotate-6">
                                <AlertTriangle size={32} className="text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Necesitamos Cambio</h3>
                            <p className="text-slate-500 text-sm mt-1">¿Cuánto suelto necesitas en caja?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {[20, 50, 100, 200].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setChangeRequestAmount(amt)}
                                    className={`py-4 rounded-xl font-black text-xl border-2 transition-all ${changeRequestAmount === amt
                                        ? 'bg-amber-500 border-amber-600 text-slate-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-400'
                                        }`}
                                >
                                    {amt}€
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Otra cantidad (€)</label>
                            <input
                                type="number"
                                placeholder="Escribe cantidad..."
                                value={changeRequestAmount}
                                onChange={e => setChangeRequestAmount(Number(e.target.value) || '')}
                                className="w-full bg-slate-50 p-4 border-2 border-slate-200 rounded-xl font-black text-center text-xl outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowChangeRequestModal(false)}
                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold uppercase text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleChangeRequest(changeRequestAmount)}
                                disabled={!changeRequestAmount}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-black uppercase text-sm disabled:opacity-50 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1"
                            >
                                Enviar Aviso
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
