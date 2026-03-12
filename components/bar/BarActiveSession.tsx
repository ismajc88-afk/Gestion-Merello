import React, { useState, useMemo } from 'react';
import {
    Wallet, Users2, Receipt, RefreshCw, PackageOpen, Trash2, Save, ShieldCheck, Percent, Zap, ZapOff
} from 'lucide-react';
import { AppData, BarSession, BarConsumption, TransactionType } from '../../types';
import { useScreenWakeLock } from '../../hooks/useScreenWakeLock';
import { haptic } from '../../utils/haptic';

interface Props {
    session: BarSession;
    data: AppData;
    onUpdateSession: (updatedSession: BarSession) => void;
    onCloseSession: () => void;
    onUpdateStock: (id: string, qty: number) => void;
    onAddTransaction: (t: any) => void;
}

export const BarActiveSession: React.FC<Props> = ({
    session, data, onUpdateSession, onCloseSession, onUpdateStock, onAddTransaction
}) => {
    const [revenue, setRevenue] = useState(session.revenue.toString());
    const [staffExpenses, setStaffExpenses] = useState((session.staffExpenses || 0).toString());
    const [otherExpenses, setOtherExpenses] = useState((session.otherExpenses || 0).toString());
    const [physicalTicketCounts, setPhysicalTicketCounts] = useState<Record<string, number>>({});

    const [selectedStockId, setSelectedStockId] = useState('');
    const [consumeQty, setConsumeQty] = useState('1');
    const { isLocked, toggleLock } = useScreenWakeLock();

    // Derived state
    const currentRevenueNum = parseFloat(revenue) || 0;
    const currentStaffNum = parseFloat(staffExpenses) || 0;
    const currentOtherNum = parseFloat(otherExpenses) || 0;
    const currentBottleCost = session.consumptions.reduce((acc, c) => acc + (c.quantity * c.costAtMoment), 0);
    const currentTotalCost = currentBottleCost + currentStaffNum + currentOtherNum;
    const currentNetProfit = currentRevenueNum - currentTotalCost;
    const currentMargin = currentRevenueNum > 0 ? (currentNetProfit / currentRevenueNum) * 100 : 0;

    // Audit 360 Logic
    const audit360 = useMemo(() => {
        const soldMap = session.ticketCounts || {};
        const servedMap = session.dispensedCounts || {};
        const allKeys = Array.from(new Set([...Object.keys(soldMap), ...Object.keys(servedMap)]));

        return allKeys.map(productName => {
            const sold = soldMap[productName] || 0;
            const served = servedMap[productName] || 0;
            const physical = physicalTicketCounts[productName] || 0;

            const diffSystem = sold - served;

            return {
                name: productName,
                sold,
                served,
                physical,
                diffSystem,
                status: diffSystem === 0 ? 'OK' : diffSystem > 0 ? 'PENDING' : 'LEAK'
            };
        });
    }, [session, physicalTicketCounts]);

    const handleUpdatePhysicalCount = (name: string, val: number) => {
        setPhysicalTicketCounts(prev => ({ ...prev, [name]: Math.max(0, val) }));
    };

    const handleAddConsumption = () => {
        if (!selectedStockId) return;
        const stockItem = data.stock.find(i => i.id === selectedStockId);
        if (!stockItem) return;
        const consumption: BarConsumption = {
            stockItemId: stockItem.id,
            name: stockItem.name,
            quantity: parseFloat(consumeQty) || 1,
            costAtMoment: stockItem.costPerUnit
        };
        onUpdateSession({ ...session, consumptions: [...session.consumptions, consumption] });
        haptic.success();
        setSelectedStockId('');
        setConsumeQty('1');
    };

    const handleSaveState = () => {
        haptic.medium();
        onUpdateSession({
            ...session,
            revenue: currentRevenueNum,
            staffExpenses: currentStaffNum,
            otherExpenses: currentOtherNum
        });
    };

    const handleClose = () => {
        if (!confirm(`¿CONFIRMAR CIERRE DE DÍA?\n\n- Se reiniciarán los contadores.\n- Se guardará la auditoría.`)) return;

        session.consumptions.forEach(c => {
            const itemInStock = data.stock.find(i => i.id === c.stockItemId);
            if (itemInStock) onUpdateStock(itemInStock.id, Math.max(0, itemInStock.quantity - c.quantity));
        });

        onAddTransaction({
            description: `Liquidación Barra: ${session.notes}`,
            amount: currentNetProfit,
            type: TransactionType.INCOME,
            category: 'Venta Barra',
            date: new Date().toISOString(),
            isBarInvestment: true
        });

        onUpdateSession({
            ...session,
            revenue: currentRevenueNum,
            staffExpenses: currentStaffNum,
            otherExpenses: currentOtherNum,
            isClosed: true,
            notes: `${session.notes} [Cierre: ${new Date().toLocaleTimeString()}]`
        });
        onCloseSession();
    };

    return (
        <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t-2 border-slate-50 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-top-4" onClick={e => e.stopPropagation()}>

            {/* UTILITIES / KIOSK MODE */}
            <div className="flex justify-end">
                <button
                    onClick={toggleLock}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLocked ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-200 animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    {isLocked ? <Zap size={14} fill="currentColor" /> : <ZapOff size={14} />}
                    {isLocked ? 'Pantalla Siempre Encendida' : 'Modo Ahorro (Normal)'}
                </button>
            </div>

            {/* INPUTS DE DINERO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-slate-50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 border-transparent focus-within:border-indigo-500 transition-all space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Wallet size={12} /> Recaudado</label>
                    <div className="flex items-center gap-2">
                        <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} className="w-full bg-transparent font-black text-4xl md:text-5xl outline-none tabular-nums" placeholder="0" />
                        <span className="text-2xl md:text-3xl font-black text-slate-300">€</span>
                    </div>
                </div>
                <div className="bg-rose-50/30 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 border-transparent focus-within:border-rose-500 transition-all space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Users2 size={12} /> Pagos Staff</label>
                    <div className="flex items-center gap-2">
                        <input type="number" value={staffExpenses} onChange={e => setStaffExpenses(e.target.value)} className="w-full bg-transparent font-black text-4xl md:text-5xl outline-none tabular-nums text-rose-600" placeholder="0" />
                        <span className="text-2xl md:text-3xl font-black text-rose-200">€</span>
                    </div>
                </div>
                <div className="bg-amber-50/30 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 border-transparent focus-within:border-amber-500 transition-all space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Receipt size={12} /> Otros Gastos</label>
                    <div className="flex items-center gap-2">
                        <input type="number" value={otherExpenses} onChange={e => setOtherExpenses(e.target.value)} className="w-full bg-transparent font-black text-4xl md:text-5xl outline-none tabular-nums text-amber-600" placeholder="0" />
                        <span className="text-2xl md:text-3xl font-black text-amber-200">€</span>
                    </div>
                </div>
            </div>

            {/* AUDITORÍA 360 */}
            <div className="bg-white border-2 border-indigo-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-50 pb-4 gap-4">
                    <div>
                        <h5 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2"><RefreshCw size={16} /> Auditoría Cruzada (360º)</h5>
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
                        <h5 className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><PackageOpen size={16} className="text-indigo-600" /> Consumo Manual (Stock)</h5>
                        <span className="text-[9px] font-bold text-slate-400">Descuenta del stock Venta</span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-[32px] border-2 border-slate-100 shadow-sm">
                        <select value={selectedStockId} onChange={e => setSelectedStockId(e.target.value)} className="flex-[3] p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm appearance-none border border-transparent focus:border-indigo-100 uppercase">
                            <option value="">Seleccionar botella/pack...</option>
                            {data.stock.filter(i => i.quantity > 0).map(i => (
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
                            {session.consumptions.map((c, i) => (
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
                                        <button onClick={() => { const nc = [...session.consumptions]; nc.splice(i, 1); onUpdateSession({ ...session, consumptions: nc }); }} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {session.consumptions.length === 0 && <p className="text-center py-8 text-slate-300 italic text-xs">Sin consumos registrados...</p>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex-1 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-center gap-2">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest relative z-10">Resultado Preliminar</p>
                        <h3 className="text-6xl font-black tracking-tighter tabular-nums relative z-10">{currentNetProfit.toFixed(0)}€</h3>
                        <p className={`text-xs font-bold uppercase tracking-widest relative z-10 ${currentMargin > 40 ? 'text-emerald-400' : 'text-amber-400'}`}>Margen: {currentMargin.toFixed(1)}%</p>
                        <Percent size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSaveState} className="flex-1 py-5 rounded-3xl bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex flex-col items-center gap-1">
                            <Save size={20} /> Guardar Estado
                        </button>
                        <button onClick={handleClose} className="flex-[1.5] py-5 rounded-3xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex flex-col items-center gap-1">
                            <ShieldCheck size={20} /> Cerrar y Auditar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
