
import React, { useState, useMemo, useEffect } from 'react';
import { AppData, Transaction, TransactionType, BarSession, StockItem, BarConsumption } from '../types';
import { 
  Plus, Beer, Calculator, History, Trash2, Save, X, ChevronRight, TrendingUp, TrendingDown,
  Coins, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Gauge, UserPlus, Zap, PackageOpen, Layers,
  Receipt, Users2, ShoppingCart, Percent, FileText, Printer, Award, BarChart3, Scale, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, Box, ShieldCheck, Siren, Snowflake, Crown, Flame, Wine,
  PieChart as PieIcon, Ticket, RefreshCw, AlertTriangle, Scale as BalanceIcon, Grip
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie, ComposedChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';

interface Props {
  data: AppData;
  onUpdateSessions: (sessions: BarSession[]) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onUpdateStock: (id: string, newQuantity: number) => void;
}

export const BarProfitManager: React.FC<Props> = ({ data, onUpdateSessions, onAddTransaction, onUpdateStock }) => {
  const [showNewSession, setShowNewSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showGlobalReport, setShowGlobalReport] = useState(false);
  
  // VIEW MODE
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const [sessionName, setSessionName] = useState('');
  const [revenue, setRevenue] = useState<string>('');
  const [staffExpenses, setStaffExpenses] = useState<string>('0');
  const [otherExpenses, setOtherExpenses] = useState<string>('0');
  const [selectedStockId, setSelectedStockId] = useState('');
  const [consumeQty, setConsumeQty] = useState<string>('1');

  // Physical Count State (Recuento de Urna)
  const [physicalTicketCounts, setPhysicalTicketCounts] = useState<Record<string, number>>({});

  const sessions = data.barSessions || [];
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Sync state when active session changes
  useEffect(() => {
      if (activeSession) {
          // Initialize physical counts with 0 or stored values if we were saving progress
          setPhysicalTicketCounts({});
      }
  }, [activeSessionId]); 

  // --- LOGICA DE AUDITORÍA 360 (CAJA vs BARRA vs URNA) ---
  const audit360 = useMemo(() => {
      if (!activeSession) return [];
      
      // Obtener lista única de productos (unión de vendidos y servidos)
      const soldMap = activeSession.ticketCounts || {};
      const servedMap = activeSession.dispensedCounts || {};
      const allKeys = Array.from(new Set([...Object.keys(soldMap), ...Object.keys(servedMap)]));

      return allKeys.map(productName => {
          const sold = soldMap[productName] || 0;     // Lo que dice el TPV (Cajero)
          const served = servedMap[productName] || 0; // Lo que dice la Barra (Camarero)
          const physical = physicalTicketCounts[productName] || 0; // Lo que cuenta el admin (Urna)

          const diffSystem = sold - served; // Positivo: Se cobró mas de lo que se sirvió (Tickets pendientes?). Negativo: Se sirvió gratis/sin ticket.
          const diffPhysical = physical - sold; // Coincidencia con dinero real

          return {
              name: productName,
              sold,
              served,
              physical,
              diffSystem,
              diffPhysical,
              status: diffSystem === 0 ? 'OK' : diffSystem > 0 ? 'PENDING' : 'LEAK'
          };
      });
  }, [activeSession, physicalTicketCounts]);


  // --- CÁLCULOS HISTÓRICOS ---
  const closedSessions = useMemo(() => sessions.filter(s => s.isClosed), [sessions]);
  
  const totalRevenue = closedSessions.reduce((acc, s) => acc + s.revenue, 0);
  const totalBottleCost = closedSessions.reduce((acc, s) => acc + s.consumptions.reduce((sum, c) => sum + (c.quantity * c.costAtMoment), 0), 0);
  const totalOpsExpenses = closedSessions.reduce((acc, s) => acc + (s.staffExpenses || 0) + (s.otherExpenses || 0), 0);
  const netProfit = totalRevenue - totalBottleCost - totalOpsExpenses;
  const globalMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Eficiencia por Euro Invertido
  const efficiencyRatio = totalBottleCost > 0 ? (totalRevenue / totalBottleCost).toFixed(2) : '0';

  // --- ANALYTICS AVANZADO ---
  const advancedStats = useMemo(() => {
      const allConsumptions = closedSessions.flatMap(s => s.consumptions);
      
      const productPerformance: Record<string, { qty: number, cost: number, name: string }> = {};
      allConsumptions.forEach(c => {
          if (!productPerformance[c.name]) productPerformance[c.name] = { qty: 0, cost: 0, name: c.name };
          productPerformance[c.name].qty += c.quantity;
          productPerformance[c.name].cost += (c.quantity * c.costAtMoment);
      });

      const topProducts = Object.values(productPerformance)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

      const catBreakdown: Record<string, number> = {};
      allConsumptions.forEach(c => {
          const stockItem = data.stock.find(s => s.id === c.stockItemId) || data.stock.find(s => s.name === c.name);
          const cat = stockItem?.category || 'OTROS';
          if (!catBreakdown[cat]) catBreakdown[cat] = 0;
          catBreakdown[cat] += c.quantity;
      });

      const pieData = Object.entries(catBreakdown).map(([name, value]) => ({ name, value }));

      let runningRevenue = 0;
      let runningProfit = 0;
      const evolutionData = closedSessions.map(s => {
          const sCost = s.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0) + (s.staffExpenses || 0) + (s.otherExpenses || 0);
          const sProfit = s.revenue - sCost;
          runningRevenue += s.revenue;
          runningProfit += sProfit;
          return {
              name: new Date(s.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
              revenue: s.revenue,
              profit: sProfit,
              accumulated: runningProfit
          };
      });

      const totalTickets: Record<string, number> = {};
      closedSessions.forEach(s => {
          if (s.ticketCounts) {
              Object.entries(s.ticketCounts).forEach(([type, count]) => {
                  if (!totalTickets[type]) totalTickets[type] = 0;
                  totalTickets[type] += (count as number);
              });
          }
      });

      return { topProducts, pieData, evolutionData, totalTickets };
  }, [closedSessions, data.stock]);

  // --- LOGIC PARA SESIÓN ACTIVA ---
  const currentRevenueNum = parseFloat(revenue) || (activeSession?.revenue || 0);
  const currentStaffNum = parseFloat(staffExpenses) || (activeSession?.staffExpenses || 0);
  const currentOtherNum = parseFloat(otherExpenses) || (activeSession?.otherExpenses || 0);
  const currentBottleCost = activeSession?.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0) || 0;
  const currentTotalCost = currentBottleCost + currentStaffNum + currentOtherNum;
  const currentNetProfit = currentRevenueNum - currentTotalCost;
  const currentMargin = currentRevenueNum > 0 ? (currentNetProfit / currentRevenueNum) * 100 : 0;

  // --- HISTORICAL DETAIL LOGIC ---
  const historySession = sessions.find(s => s.id === selectedHistoryId);
  const historyIncidents = useMemo(() => {
      if (!historySession) return [];
      
      const sessionDate = new Date(historySession.date);
      const start = new Date(sessionDate);
      start.setHours(12, 0, 0, 0);
      const end = new Date(sessionDate);
      end.setDate(end.getDate() + 1);
      end.setHours(10, 0, 0, 0);

      return (data.incidents || []).filter(inc => {
          const t = new Date(inc.timestamp);
          return t >= start && t <= end;
      });
  }, [historySession, data.incidents]);

  const historyMetrics = useMemo(() => {
      if (!historySession) return null;
      const bottleCost = historySession.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0);
      const opsCost = (historySession.staffExpenses || 0) + (historySession.otherExpenses || 0);
      const profit = historySession.revenue - bottleCost - opsCost;
      
      const iceRequests = historyIncidents.filter(i => i.title.toLowerCase().includes('hielo')).length;
      const glassBreak = historyIncidents.filter(i => i.title.toLowerCase().includes('vaso') || i.title.toLowerCase().includes('rotura')).length;
      const changeRequests = historyIncidents.filter(i => i.title.toLowerCase().includes('cambio')).length;
      const urgentCount = historyIncidents.filter(i => i.priority === 'URGENT').length;

      return { bottleCost, opsCost, profit, iceRequests, glassBreak, changeRequests, urgentCount };
  }, [historySession, historyIncidents]);


  const handleCreateSession = () => {
     if (!sessionName) return;
     const newS: BarSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        revenue: 0,
        consumptions: [],
        staffExpenses: 0,
        otherExpenses: 0,
        isClosed: false,
        notes: sessionName,
        ticketCounts: {},
        dispensedCounts: {}
     };
     onUpdateSessions([...sessions, newS]);
     setSessionName('');
     setShowNewSession(false);
     setActiveSessionId(newS.id);
     setRevenue('0'); setStaffExpenses('0'); setOtherExpenses('0');
     setPhysicalTicketCounts({});
  };

  const handleAddConsumption = () => {
     if (!activeSessionId || !selectedStockId) return;
     const stockItem = data.stock.find(i => i.id === selectedStockId);
     if (!stockItem) return;
     const consumption: BarConsumption = {
        stockItemId: stockItem.id,
        name: stockItem.name,
        quantity: parseFloat(consumeQty) || 1,
        costAtMoment: stockItem.costPerUnit
     };
     onUpdateSessions(sessions.map(s => s.id === activeSessionId ? { ...s, consumptions: [...s.consumptions, consumption] } : s));
     setSelectedStockId('');
     setConsumeQty('1');
  };

  const handleUpdatePhysicalCount = (name: string, val: number) => {
      setPhysicalTicketCounts(prev => ({ ...prev, [name]: Math.max(0, val) }));
  };

  const handleSaveState = () => {
      if(!activeSessionId) return;
      onUpdateSessions(sessions.map(ss => ss.id === activeSessionId ? { 
          ...ss, 
          revenue: currentRevenueNum, 
          staffExpenses: currentStaffNum, 
          otherExpenses: currentOtherNum
      } : ss));
  };

  const handleCloseSession = () => {
     if (!activeSessionId || !activeSession) return;
     if (!confirm(`¿CONFIRMAR CIERRE DE DÍA?\n\n- Se reiniciarán los contadores de cajeros y camareros.\n- Se guardará la auditoría actual.\n- Se descuenta el stock consumido.`)) return;
     
     activeSession.consumptions.forEach(c => {
        const itemInStock = data.stock.find(i => i.id === c.stockItemId);
        if (itemInStock) onUpdateStock(itemInStock.id, Math.max(0, itemInStock.quantity - c.quantity));
     });

     onAddTransaction({
        description: `Liquidación Barra: ${activeSession.notes}`,
        amount: currentNetProfit,
        type: TransactionType.INCOME,
        category: 'Venta Barra',
        date: new Date().toISOString(),
        isBarInvestment: true
     });

     // Al cerrar, guardamos el estado final para el histórico
     onUpdateSessions(sessions.map(s => s.id === activeSessionId ? { 
        ...s, 
        revenue: currentRevenueNum, 
        staffExpenses: currentStaffNum, 
        otherExpenses: currentOtherNum, 
        isClosed: true,
        // Guardamos la auditoría física en las notas o en un campo futuro si existiera
        notes: `${s.notes} [Cierre: ${new Date().toLocaleTimeString()}]`
     } : s));
     setActiveSessionId(null);
  };

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500 w-full pb-32">
       
       {/* SECCIÓN 1: KPI DE AUDITORÍA GLOBAL */}
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-300 transition-all">
             <div className="space-y-4">
                <div className="flex justify-between items-start">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retorno de Inversión (x)</p>
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Scale size={18}/></div>
                </div>
                <div>
                   <h4 className="text-4xl md:text-5xl font-black text-slate-900 tabular-nums">{efficiencyRatio}<span className="text-xl text-slate-400 ml-1">x</span></h4>
                   <p className="text-[9px] md:text-[10px] text-slate-500 font-bold mt-1 italic">Cada 1€ genera {efficiencyRatio}€.</p>
                </div>
             </div>
             <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                   <span>Margen Global</span>
                   <span className="text-emerald-600">{globalMargin.toFixed(1)}%</span>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 bg-[#09090b] text-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
             <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Beer size={200} className="md:w-[280px] md:h-[280px]" /></div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                   <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                   <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Consolidado Tesorería Barra</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Beneficio Neto Real</p>
                      <h3 className="text-5xl md:text-7xl font-black text-emerald-400 tracking-tighter tabular-nums">{netProfit.toLocaleString()}€</h3>
                   </div>
                   <div className="flex flex-col gap-1 border-l border-white/10 pl-6 pb-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase">Caja Bruta: <span className="text-white">{totalRevenue.toLocaleString()}€</span></p>
                      <p className="text-[9px] font-black text-slate-500 uppercase">Inversión Género: <span className="text-rose-400">{totalBottleCost.toLocaleString()}€</span></p>
                   </div>
                </div>
             </div>
             <div className="mt-6 md:mt-8 pt-6 border-t border-white/5 relative z-10 flex gap-2 md:gap-4 flex-wrap">
                <button onClick={() => setShowGlobalReport(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border border-white/10">
                   <BarChart3 size={16}/> Reporte Completo
                </button>
                <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 md:px-6 py-3 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40">
                   <Printer size={16}/> PDF
                </button>
             </div>
          </div>

          <div className="bg-white p-5 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-100 shadow-sm flex flex-col justify-between">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Género en Barra</p>
                <div className="flex items-baseline gap-2">
                   <h4 className="text-4xl font-black text-slate-900 tabular-nums">
                      {data.stock.filter(i => i.usageType === 'VENTA').length}
                   </h4>
                   <span className="text-xs font-bold text-slate-400 uppercase">Referencias</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Artículos vinculados al control de costes de esta terminal.</p>
             </div>
             <button onClick={() => setActiveSessionId(null)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[9px] tracking-widest border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                <Box size={14}/> Ver Inventario Venta
             </button>
          </div>
       </div>

       {/* SECCIÓN 2: LISTADO DE SESIONES Y GESTIÓN ACTIVA */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
             
             {/* TAB NAVIGATION */}
             <div className="flex justify-between items-center px-2 md:px-4 mb-2">
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                    <button 
                        onClick={() => setViewMode('ACTIVE')} 
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all text-center ${viewMode === 'ACTIVE' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Activas
                    </button>
                    <button 
                        onClick={() => setViewMode('HISTORY')} 
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all text-center ${viewMode === 'HISTORY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Histórico
                    </button>
                </div>
                {viewMode === 'ACTIVE' && (
                    <button onClick={() => setShowNewSession(true)} className="hidden md:flex px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] items-center gap-2 hover:bg-indigo-600 shadow-xl transition-all">
                        <Plus size={16}/> Abrir Nueva Caja
                    </button>
                )}
             </div>
             
             {/* MOBILE ADD BUTTON */}
             {viewMode === 'ACTIVE' && (
                 <button onClick={() => setShowNewSession(true)} className="md:hidden w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2">
                     <Plus size={16}/> Abrir Nueva Caja
                 </button>
             )}

             {/* MODAL CREAR SESION */}
             {showNewSession && (
                <div className="bg-indigo-50 border-2 border-indigo-100 p-6 md:p-8 rounded-[32px] md:rounded-[40px] animate-in zoom-in-95 duration-300">
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Referencia de la Sesión (ej: Noche Orquesta)</p>
                   <div className="flex flex-col md:flex-row gap-3">
                      <input autoFocus value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Identificador del turno..." className="flex-1 p-4 md:p-5 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-300" />
                      <div className="flex gap-3">
                          <button onClick={handleCreateSession} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 md:px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Abrir</button>
                          <button onClick={() => setShowNewSession(false)} className="bg-white text-slate-400 px-5 py-4 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={24}/></button>
                      </div>
                   </div>
                </div>
             )}

             {/* CONTENT AREA */}
             <div className="space-y-4">
                
                {/* ACTIVE VIEW */}
                {viewMode === 'ACTIVE' && (
                    <>
                        {sessions.filter(s => !s.isClosed).length === 0 ? (
                            <div className="py-20 text-center opacity-30 border-4 border-dashed border-slate-100 rounded-[48px]">
                                <Calculator size={64} className="mx-auto mb-4"/>
                                <p className="font-black uppercase tracking-widest text-xs">No hay barras abiertas ahora mismo</p>
                            </div>
                        ) : (
                            sessions.filter(s => !s.isClosed).map(s => {
                                const isActive = activeSessionId === s.id;
                                const sessionBottleCost = s.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0);
                                const sessionOpsCost = (s.staffExpenses || 0) + (s.otherExpenses || 0);
                                const sessionNet = s.revenue - sessionBottleCost - sessionOpsCost;
                                const sessionMargin = s.revenue > 0 ? (sessionNet / s.revenue) * 100 : 0;

                                return (
                                    <div key={s.id} className={`p-5 md:p-8 rounded-[32px] md:rounded-[48px] border-2 transition-all relative ${isActive ? 'bg-white border-indigo-500 shadow-2xl scale-[1.01] z-10' : 'bg-white border-slate-100 hover:border-indigo-200 cursor-pointer'}`} onClick={() => setActiveSessionId(s.id)}>
                                        {/* SESSION CARD HEADER (Shared Layout) */}
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all bg-indigo-50 text-indigo-600">
                                                    <Activity size={24} className="animate-pulse md:w-8 md:h-8"/>
                                                </div>
                                                <div className="flex-1 md:flex-auto">
                                                    <h4 className="font-black text-slate-900 text-lg md:text-2xl tracking-tighter mb-1 uppercase italic truncate max-w-[200px] md:max-w-none">{s.notes}</h4>
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</span>
                                                        <span className="text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-700">Abierta</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Metrics preview */}
                                            <div className="grid grid-cols-3 gap-2 md:gap-6 flex-1 w-full md:w-auto px-2 md:px-6 border-t md:border-t-0 md:border-x border-slate-50 pt-4 md:pt-0">
                                                <div className="text-center">
                                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Caja Bruta</p>
                                                    <p className="text-lg md:text-xl font-black text-slate-800 tabular-nums">{s.revenue}€</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Coste Género</p>
                                                    <p className="text-lg md:text-xl font-black text-rose-500 tabular-nums">{sessionBottleCost.toFixed(0)}€</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Beneficio Neto</p>
                                                    <p className={`text-lg md:text-xl font-black tabular-nums ${sessionNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{sessionNet.toFixed(0)}€</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* ACTIVE SESSION CONTROLS */}
                                        {isActive && (
                                            <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t-2 border-slate-50 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-top-4" onClick={e => e.stopPropagation()}>
                                                
                                                {/* INPUTS DE DINERO */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                                    <div className="bg-slate-50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 border-transparent focus-within:border-indigo-500 transition-all space-y-2 md:space-y-4">
                                                        <label className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Wallet size={12}/> Recaudado</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} className="w-full bg-transparent font-black text-4xl md:text-5xl outline-none tabular-nums" placeholder="0" />
                                                            <span className="text-2xl md:text-3xl font-black text-slate-300">€</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-rose-50/30 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 border-transparent focus-within:border-rose-500 transition-all space-y-2 md:space-y-4">
                                                        <label className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Users2 size={12}/> Pagos Staff</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" value={staffExpenses} onChange={e => setStaffExpenses(e.target.value)} className="w-full bg-transparent font-black text-4xl md:text-5xl outline-none tabular-nums text-rose-600" placeholder="0" />
                                                            <span className="text-2xl md:text-3xl font-black text-rose-200">€</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-amber-50/30 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 border-transparent focus-within:border-amber-500 transition-all space-y-2 md:space-y-4">
                                                        <label className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Receipt size={12}/> Otros Gastos</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" value={otherExpenses} onChange={e => setOtherExpenses(e.target.value)} className="w-full bg-transparent font-black text-4xl md:text-5xl outline-none tabular-nums text-amber-600" placeholder="0" />
                                                            <span className="text-2xl md:text-3xl font-black text-amber-200">€</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AUDITORÍA 360: VENDIDO VS SERVIDO VS URNA */}
                                                <div className="bg-white border-2 border-indigo-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-50 pb-4 gap-4">
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2"><RefreshCw size={16}/> Auditoría Cruzada (360º)</h5>
                                                            <p className="text-[9px] text-slate-400 font-bold mt-1">Comparativa automática entre TPV (Cajero) y Barra (Camarero)</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                                <span className="text-[8px] font-black uppercase text-slate-500">Vendido</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                                <span className="text-[8px] font-black uppercase text-slate-500">Servido</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* TABLA COMPARATIVA */}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                                    <th className="py-2 pl-2">Producto</th>
                                                                    <th className="py-2 text-center text-indigo-400">Vendido (Caja)</th>
                                                                    <th className="py-2 text-center text-emerald-500">Servido (Barra)</th>
                                                                    <th className="py-2 text-center text-amber-500">Urna (Físico)</th>
                                                                    <th className="py-2 text-right pr-2">Desviación (Sistema)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="text-xs font-bold text-slate-700">
                                                                {audit360.map((row, idx) => (
                                                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                                        <td className="py-3 pl-2 font-black uppercase">{row.name}</td>
                                                                        <td className="py-3 text-center text-indigo-700">{row.sold}</td>
                                                                        <td className="py-3 text-center text-emerald-700">{row.served}</td>
                                                                        <td className="py-3 text-center">
                                                                            <input 
                                                                                type="number" 
                                                                                min="0"
                                                                                placeholder="0"
                                                                                value={physicalTicketCounts[row.name] || ''}
                                                                                onChange={(e) => handleUpdatePhysicalCount(row.name, parseInt(e.target.value) || 0)}
                                                                                className="w-12 text-center bg-slate-100 border border-slate-200 rounded-lg py-1 outline-none focus:border-amber-400 font-bold"
                                                                            />
                                                                        </td>
                                                                        <td className="py-3 text-right pr-2">
                                                                            <span className={`px-2 py-1 rounded-md ${row.status === 'OK' ? 'bg-emerald-100 text-emerald-700' : row.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                                {row.diffSystem > 0 ? `+${row.diffSystem} (Falta Servir)` : row.diffSystem < 0 ? `${row.diffSystem} (Servido de más)` : 'Exacto'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {audit360.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan={5} className="py-8 text-center text-slate-400 italic font-medium">Sin actividad registrada en esta sesión</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                                    <div className="space-y-4 md:space-y-6">
                                                        <div className="flex justify-between items-end">
                                                            <h5 className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><PackageOpen size={16} className="text-indigo-600"/> Consumo Manual (Stock)</h5>
                                                            <span className="text-[9px] font-bold text-slate-400">Descuenta del stock Venta</span>
                                                        </div>
                                                        <div className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-[32px] border-2 border-slate-100 shadow-sm">
                                                            <select value={selectedStockId} onChange={e => setSelectedStockId(e.target.value)} className="flex-[3] p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm appearance-none border border-transparent focus:border-indigo-100 uppercase">
                                                                <option value="">Seleccionar botella/pack...</option>
                                                                {data.stock.filter(i => i.usageType === 'VENTA' && i.quantity > 0).map(i => (
                                                                    <option key={i.id} value={i.id}>{i.name} (Coste: {i.costPerUnit}€)</option>
                                                                ))}
                                                            </select>
                                                            <div className="flex gap-2">
                                                                <input type="number" value={consumeQty} onChange={e => setConsumeQty(e.target.value)} className="w-24 p-4 bg-slate-50 rounded-2xl font-black text-center text-xl outline-none" />
                                                                <button onClick={handleAddConsumption} className="flex-1 md:flex-none px-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all">Añadir</button>
                                                            </div>
                                                        </div>

                                                        <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-100 min-h-[150px] md:min-h-[200px]">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">Detalle de género vaciado</p>
                                                            <div className="space-y-2">
                                                                {s.consumptions.map((c, i) => (
                                                                    <div key={i} className="flex justify-between items-center p-3 md:p-4 bg-white rounded-2xl border border-slate-100 group">
                                                                        <div>
                                                                            <span className="text-xs md:text-sm font-black text-slate-800 uppercase">{c.name}</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[8px] md:text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Cant: {c.quantity}</span>
                                                                                <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">Reposición: {c.costAtMoment}€/u</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 md:gap-4">
                                                                            <span className="font-bold text-rose-500 text-xs md:text-sm">-{(c.quantity * c.costAtMoment).toFixed(2)}€</span>
                                                                            <button onClick={() => { const nc = [...s.consumptions]; nc.splice(i,1); onUpdateSessions(sessions.map(ss => ss.id === activeSessionId ? {...ss, consumptions: nc} : ss)); }} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {s.consumptions.length === 0 && <p className="text-center py-8 text-slate-300 italic text-xs">Sin consumos registrados...</p>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex-1 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-center gap-2">
                                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest relative z-10">Resultado Preliminar</p>
                                                            <h3 className="text-6xl font-black tracking-tighter tabular-nums relative z-10">{currentNetProfit.toFixed(0)}€</h3>
                                                            <p className={`text-xs font-bold uppercase tracking-widest relative z-10 ${sessionMargin > 40 ? 'text-emerald-400' : 'text-amber-400'}`}>Margen: {sessionMargin.toFixed(1)}%</p>
                                                            <Percent size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12"/>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button onClick={handleSaveState} className="flex-1 py-5 rounded-3xl bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex flex-col items-center gap-1">
                                                                <Save size={20}/> Guardar Estado
                                                            </button>
                                                            <button onClick={handleCloseSession} className="flex-[1.5] py-5 rounded-3xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex flex-col items-center gap-1">
                                                                <ShieldCheck size={20}/> Cerrar y Auditar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </>
                )}

                {/* HISTORY VIEW */}
                {viewMode === 'HISTORY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {closedSessions.slice().reverse().map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => setSelectedHistoryId(s.id)}
                                className={`p-6 rounded-[32px] border-2 text-left transition-all ${selectedHistoryId === s.id ? 'bg-white border-indigo-500 shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg uppercase italic">{s.notes}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-2 bg-slate-100 rounded-xl text-slate-400"><History size={18}/></div>
                                </div>
                                <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Beneficio</p>
                                        <p className="text-xl font-black text-emerald-600 tabular-nums">
                                            {(s.revenue - s.consumptions.reduce((a,c)=>a+(c.quantity*c.costAtMoment),0) - (s.staffExpenses||0) - (s.otherExpenses||0)).toFixed(0)}€
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Caja</p>
                                        <p className="text-lg font-black text-slate-800 tabular-nums">{s.revenue}€</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {closedSessions.length === 0 && (
                            <div className="col-span-full py-20 text-center opacity-30">
                                <History size={48} className="mx-auto mb-4 text-slate-400"/>
                                <p className="font-black uppercase tracking-widest text-slate-400">Sin historial disponible</p>
                            </div>
                        )}
                    </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             {/* HISTORY DETAIL SIDEBAR */}
             {viewMode === 'HISTORY' && historyMetrics ? (
                 <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-lg sticky top-6 animate-in slide-in-from-right-4">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-xl font-black text-slate-900 uppercase italic">Auditoría Sesión</h3>
                         <button onClick={() => setSelectedHistoryId(null)} className="p-2 bg-slate-100 rounded-full"><X size={16}/></button>
                     </div>
                     
                     <div className="space-y-6">
                         <div className="bg-slate-900 p-6 rounded-[32px] text-white text-center">
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Resultado Neto</p>
                             <h4 className="text-5xl font-black tabular-nums">{historyMetrics.profit.toFixed(2)}€</h4>
                         </div>

                         <div className="space-y-3">
                             <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="text-xs font-black text-slate-500 uppercase">Ingresos</span>
                                 <span className="font-black text-emerald-600">+{historySession?.revenue}€</span>
                             </div>
                             <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="text-xs font-black text-slate-500 uppercase">Coste Bebida</span>
                                 <span className="font-black text-rose-500">-{historyMetrics.bottleCost.toFixed(2)}€</span>
                             </div>
                             <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <span className="text-xs font-black text-slate-500 uppercase">Personal/Otros</span>
                                 <span className="font-black text-rose-500">-{historyMetrics.opsCost}€</span>
                             </div>
                         </div>

                         {/* VISOR HISTÓRICO DE TICKETS (NUEVO) */}
                         {historySession?.ticketCounts && Object.keys(historySession.ticketCounts).length > 0 && (
                             <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Ticket size={14}/> Registro de Tickets (Arqueo)
                                </h4>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-40 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-2">
                                        {Object.entries(historySession.ticketCounts).map(([name, count]) => (
                                            <div key={name} className="flex justify-between items-center text-xs border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                                                <span className="font-bold text-slate-700 uppercase">{name}</span>
                                                <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                         )}

                         <div className="pt-6 border-t border-slate-100">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Incidencias Registradas</h4>
                             <div className="grid grid-cols-2 gap-3">
                                 <div className="p-3 bg-cyan-50 text-cyan-700 rounded-xl text-center">
                                     <Snowflake size={20} className="mx-auto mb-1"/>
                                     <span className="block text-xl font-black">{historyMetrics.iceRequests}</span>
                                     <span className="text-[9px] font-bold uppercase">Hielo</span>
                                 </div>
                                 <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-center">
                                     <Trash2 size={20} className="mx-auto mb-1"/>
                                     <span className="block text-xl font-black">{historyMetrics.glassBreak}</span>
                                     <span className="text-[9px] font-bold uppercase">Roturas</span>
                                 </div>
                                 <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-center">
                                     <Coins size={20} className="mx-auto mb-1"/>
                                     <span className="block text-xl font-black">{historyMetrics.changeRequests}</span>
                                     <span className="text-[9px] font-bold uppercase">Cambio</span>
                                 </div>
                                 <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-center">
                                     <Siren size={20} className="mx-auto mb-1"/>
                                     <span className="block text-xl font-black">{historyMetrics.urgentCount}</span>
                                     <span className="text-[9px] font-bold uppercase">Urgencias</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             ) : (
                 <div className="space-y-6">
                     <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm">
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-6">
                             <Crown size={18} className="text-amber-500"/> Top Ventas (Volumen)
                         </h4>
                         <div className="space-y-4">
                             {advancedStats.topProducts.map((p, i) => (
                                 <div key={p.name} className="flex items-center gap-4">
                                     <span className="font-black text-slate-300 text-lg w-4">#{i+1}</span>
                                     <div className="flex-1">
                                         <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                             <span className="text-slate-700 truncate max-w-[120px]">{p.name}</span>
                                             <span className="text-slate-900">{p.qty}u</span>
                                         </div>
                                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                             <div className="h-full bg-indigo-500" style={{ width: `${(p.qty / advancedStats.topProducts[0].qty) * 100}%` }}></div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                             {advancedStats.topProducts.length === 0 && <p className="text-center text-slate-300 text-xs py-4">Sin datos de ventas</p>}
                         </div>
                     </div>

                     <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                         <div className="relative z-10">
                             <h4 className="text-sm font-black uppercase tracking-widest mb-4">Mix de Producto</h4>
                             <div className="h-40 w-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                     <PieChart>
                                         <Pie data={advancedStats.pieData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                             {advancedStats.pieData.map((entry, index) => (
                                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                             ))}
                                         </Pie>
                                         <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#000'}} itemStyle={{color: '#000', fontWeight: 'bold', fontSize: '10px'}}/>
                                         <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '700', textTransform: 'uppercase'}}/>
                                     </PieChart>
                                 </ResponsiveContainer>
                             </div>
                         </div>
                     </div>
                 </div>
             )}
          </div>
       </div>

       {/* GLOBAL REPORT MODAL */}
       {showGlobalReport && (
           <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8 animate-in slide-in-from-bottom-10">
               <div className="max-w-5xl mx-auto bg-white min-h-screen rounded-[48px] shadow-2xl overflow-hidden relative">
                   <button onClick={() => setShowGlobalReport(false)} className="absolute top-8 right-8 p-4 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-full transition-all z-50"><X size={24}/></button>
                   
                   <div className="p-12 md:p-20 bg-slate-900 text-white relative overflow-hidden">
                       <div className="relative z-10">
                           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-widest mb-6">
                               <Award size={14} className="text-yellow-400"/> Informe de Rendimiento
                           </div>
                           <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">Barra<br/><span className="text-indigo-500">Analytics</span></h2>
                       </div>
                       <Beer size={400} className="absolute -right-20 -bottom-20 opacity-5 rotate-12 text-white"/>
                   </div>

                   <div className="p-12 md:p-20 space-y-20">
                       
                       <section>
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-4"><TrendingUp className="text-indigo-600"/> Evolución Financiera</h3>
                           <div className="h-80 w-full bg-slate-50 rounded-[40px] p-8 border border-slate-100">
                               <ResponsiveContainer width="100%" height="100%">
                                   <ComposedChart data={advancedStats.evolutionData}>
                                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                                       <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false}/>
                                       <YAxis hide/>
                                       <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}/>
                                       <Bar dataKey="revenue" fill="#cbd5e1" barSize={20} radius={[10, 10, 10, 10]} name="Ingresos"/>
                                       <Line type="monotone" dataKey="accumulated" stroke="#4f46e5" strokeWidth={4} dot={{r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} name="Beneficio Acumulado"/>
                                   </ComposedChart>
                               </ResponsiveContainer>
                           </div>
                       </section>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <section>
                               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-4"><Crown className="text-amber-500"/> Top Productos</h3>
                               <div className="space-y-4">
                                   {advancedStats.topProducts.map((p, i) => (
                                       <div key={p.name} className="flex items-center gap-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white ${i===0?'bg-amber-400':i===1?'bg-slate-400':'bg-orange-700'}`}>#{i+1}</div>
                                           <div className="flex-1">
                                               <h4 className="font-black text-slate-800 uppercase">{p.name}</h4>
                                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.qty} Unidades Vendidas</p>
                                           </div>
                                           <div className="text-right">
                                               <p className="font-black text-slate-900">{p.cost.toFixed(0)}€</p>
                                               <p className="text-[9px] font-bold text-slate-400 uppercase">Coste</p>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </section>

                           <section>
                               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-4"><PieIcon className="text-emerald-500"/> Ticket Medio</h3>
                               <div className="bg-slate-900 text-white p-10 rounded-[40px] relative overflow-hidden">
                                   <div className="relative z-10">
                                       <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Valor Medio por Sesión</p>
                                       <h4 className="text-7xl font-black tracking-tighter">{(totalRevenue / (closedSessions.length || 1)).toFixed(0)}€</h4>
                                       <p className="text-sm font-medium text-slate-400 mt-4 max-w-xs">Promedio de facturación por turno de barra cerrado hasta la fecha.</p>
                                   </div>
                                   <div className="absolute right-0 bottom-0 p-8 opacity-10"><Wallet size={180}/></div>
                               </div>
                           </section>
                       </div>

                   </div>
               </div>
           </div>
       )}

    </div>
  );
};
