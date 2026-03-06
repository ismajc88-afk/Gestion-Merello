
import React, { useState, useMemo, useEffect } from 'react';
import { Supplier, Order, CatalogItem, StockItem, ESCUDO_BASE64 } from '../types';
import {
    ShoppingCart, Plus, Package, Truck, Trash2, Search,
    Beer, Wine, Utensils, Wand2, X, AlertCircle, ChevronRight,
    GlassWater, Layers, FileText, BarChart3, PieChart as PieIcon,
    ArrowRight, Download, Save, Copy, Wallet, TrendingDown,
    CalendarDays, Users, Calculator, Activity, PartyPopper, Cookie, Coffee,
    Lock, Unlock, Edit3, Check, PenTool, Box, Tag, DollarSign, Home, Store,
    Settings, Ruler, Sparkles, RefreshCcw, PlusCircle, AlertTriangle, FileInput,
    ClipboardList, Archive, Printer, MessageCircle, Share2, List, Grid, ChevronDown,
    Camera, ScanLine, Loader2
} from 'lucide-react';
import { scanInvoiceToOrder } from '../services/geminiService';

interface PlanItem {
    id: string;
    catalogId: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    unit: string;
}

interface Plan {
    id: string;
    name: string;
    type: 'CASAL' | 'BAR';
    items: PlanItem[];
    status: 'DRAFT' | 'READY';
    updatedAt: string;
}

interface Props {
    catalog: CatalogItem[];
    onUpdateCatalog: (newCatalog: CatalogItem[]) => void;
    onCreateOrder: (order: Omit<Order, 'id'>) => void;
    suppliers: Supplier[];
    attendeesCount: number;
    totalBudget: number;
    currentSpent: number;
    stock?: StockItem[];
}

export const PurchasePlanner: React.FC<Props> = ({ catalog, onUpdateCatalog, onCreateOrder, suppliers, attendeesCount, totalBudget, currentSpent, stock = [] }) => {
    // --- STATE MANAGEMENT ---
    const [plans, setPlans] = useState<Plan[]>(() => {
        try {
            const saved = localStorage.getItem('merello_purchase_plans');
            return saved ? JSON.parse(saved) : [{ id: 'p1', name: 'Borrador #1', type: 'BAR', items: [], status: 'DRAFT', updatedAt: new Date().toISOString() }];
        } catch (e) {
            return [{ id: 'p1', name: 'Borrador #1', type: 'BAR', items: [], status: 'DRAFT', updatedAt: new Date().toISOString() }];
        }
    });
    const [activePlanId, setActivePlanId] = useState<string>(() => plans[0]?.id || 'p1');
    const [isCatalogManagerOpen, setIsCatalogManagerOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    // Mobile View State
    const [mobileTab, setMobileTab] = useState<'ORDER' | 'CATALOG'>('ORDER');
    const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

    // New Plan State
    const [isRenameMode, setIsRenameMode] = useState(false);
    const [renameValue, setRenameValue] = useState('');

    // Catalog Manager State
    const [newCatItem, setNewCatItem] = useState<Omit<CatalogItem, 'id'>>({ name: '', category: 'General', defaultPrice: 1, unit: 'u' });

    // AI Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanPreview, setScanPreview] = useState<string | null>(null);

    // Persistence
    useEffect(() => { localStorage.setItem('merello_purchase_plans', JSON.stringify(plans)); }, [plans]);

    // Derived State
    const activePlan = plans.find(p => p.id === activePlanId) || plans[0];
    const activePlanTotal = activePlan.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const uniqueCategories = Array.from(new Set(((catalog as CatalogItem[]) || []).map(c => c.category)));

    // --- LOGIC ---

    const handleCreatePlan = () => {
        const newPlan: Plan = {
            id: Date.now().toString(),
            name: `Nuevo Pedido ${plans.length + 1}`,
            type: 'BAR',
            items: [],
            status: 'DRAFT',
            updatedAt: new Date().toISOString()
        };
        setPlans([...plans, newPlan]);
        setActivePlanId(newPlan.id);
        setMobileTab('ORDER'); // Switch to order view on new plan
    };

    const handleDeletePlan = (id: string) => {
        if (plans.length === 1) {
            alert("Debe haber al menos un borrador activo.");
            return;
        }
        if (confirm("¿Eliminar este borrador definitivamente?")) {
            const newPlans = plans.filter(p => p.id !== id);
            setPlans(newPlans);
            setActivePlanId(newPlans[0].id);
        }
    };

    const handleAddItemToPlan = (item: CatalogItem) => {
        const existing = activePlan.items.find(pi => pi.catalogId === item.id);
        if (existing) {
            updateItemQuantity(existing.id, existing.quantity + 1);
        } else {
            const newItem: PlanItem = {
                id: Math.random().toString(),
                catalogId: item.id,
                name: item.name,
                category: item.category,
                quantity: 1,
                unitPrice: item.defaultPrice,
                unit: item.unit
            };
            updateActivePlan({ items: [...activePlan.items, newItem] });
        }

        // Feedback visual
        setLastAddedItem(item.id);
        setTimeout(() => setLastAddedItem(null), 1000);

        // Haptic
        if ("vibrate" in navigator) navigator.vibrate(10);
    };

    const updateItemQuantity = (itemId: string, newQty: number) => {
        if (newQty <= 0) {
            updateActivePlan({ items: activePlan.items.filter(i => i.id !== itemId) });
        } else {
            updateActivePlan({ items: activePlan.items.map(i => i.id === itemId ? { ...i, quantity: newQty } : i) });
        }
    };

    const updateActivePlan = (updates: Partial<Plan>) => {
        setPlans(plans.map(p => p.id === activePlanId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    };

    const handleAutoFill = () => {
        // Logic: Find items in stock below minStock matching the plan type
        const usageType = activePlan.type === 'BAR' ? 'VENTA' : 'CASAL';
        const needsRestock = stock.filter(s => s.usageType === usageType && s.quantity <= s.minStock);

        if (needsRestock.length === 0) {
            alert("✅ El inventario está saludable. No hay roturas de stock detectadas para este tipo de almacén.");
            return;
        }

        const newItems: PlanItem[] = [];
        needsRestock.forEach(stockItem => {
            if (activePlan.items.some(i => i.name.toUpperCase() === stockItem.name.toUpperCase())) return;

            const catMatch = (catalog as CatalogItem[]).find(c => c.name.toUpperCase() === stockItem.name.toUpperCase());

            newItems.push({
                id: Math.random().toString(),
                catalogId: catMatch?.id || 'auto',
                name: stockItem.name,
                category: stockItem.category,
                quantity: Math.max(10, stockItem.minStock * 2),
                unitPrice: stockItem.costPerUnit || catMatch?.defaultPrice || 0,
                unit: stockItem.unit
            });
        });

        if (newItems.length > 0) {
            updateActivePlan({ items: [...activePlan.items, ...newItems] });
        }
    };

    const handleFinalize = () => {
        if (!selectedSupplierId) return;
        const supplier = suppliers.find(s => s.id === selectedSupplierId);

        onCreateOrder({
            title: activePlan.name,
            supplierName: supplier?.name || 'Proveedor General',
            estimatedCost: activePlanTotal,
            status: 'PENDING',
            items: activePlan.items.map(i => ({ name: i.name, quantity: i.quantity })),
            date: new Date().toISOString(),
            orderType: activePlan.type
        });

        handleDeletePlan(activePlan.id);
        setIsCheckoutOpen(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset the input value so the same file can be selected again if needed
        e.target.value = '';

        // Limitar tamaño de imagen para Gemini + PWA (resize client-side básico vía Canvas)
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                setScanPreview(base64);

                setIsScanning(true);
                const itemsStr = await scanInvoiceToOrder(base64, 'image/jpeg');
                setIsScanning(false);
                setScanPreview(null);
                setIsScannerOpen(false);

                if (!itemsStr || !itemsStr.length) {
                    alert("⚠️ No se pudieron extraer productos de la imagen.");
                    return;
                }

                // Autocompletar borrador de pedido detectando si están en catálogo
                const newItems: PlanItem[] = [];
                itemsStr.forEach((mapped: any) => {
                    const catMatch = (catalog as CatalogItem[]).find(c =>
                        c.name.toLowerCase().includes(mapped.name.toLowerCase()) ||
                        mapped.name.toLowerCase().includes(c.name.toLowerCase())
                    );

                    newItems.push({
                        id: Math.random().toString(),
                        catalogId: catMatch?.id || 'scan-temp',
                        name: catMatch?.name || mapped.name.toUpperCase(),
                        category: catMatch?.category || 'Sin Clasificar',
                        quantity: mapped.quantity || 1,
                        unitPrice: mapped.defaultPrice || catMatch?.defaultPrice || 0,
                        unit: catMatch?.unit || 'u'
                    });
                });

                if (newItems.length > 0) {
                    updateActivePlan({ items: [...activePlan.items, ...newItems] });
                    setTimeout(() => alert(`✨ ¡Escáner Mágico completado!\nSe añadieron ${newItems.length} componentes al borrador automatizados con IA.`), 100);
                }
            };
            img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // --- EXPORT TOOLS ---
    const handlePrintOrder = () => {
        // ... (Keep existing print logic)
        const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("Permite las ventanas emergentes para imprimir.");

        const itemsRows = activePlan.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">${item.name}</td>
        <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: center;">${item.unit}</td>
        <td style="padding: 12px 0; text-align: center;">${item.category}</td>
      </tr>
    `).join('');

        printWindow.document.write(`
      <html>
        <head>
          <title>Orden de Pedido - ${activePlan.name}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { width: 80px; height: 80px; }
            .title h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: -1px; }
            .title p { margin: 5px 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #64748b; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
            th.center { text-align: center; }
            .total { text-align: right; margin-top: 40px; font-size: 24px; font-weight: bold; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">
              <h1>Orden de Compra</h1>
              <p>${activePlan.name} • ${dateStr}</p>
            </div>
            <div class="logo"><img src="${ESCUDO_BASE64}" style="width:100%; height:100%; object-fit:contain;" /></div>
          </div>
          <p><strong>Destino:</strong> ${activePlan.type === 'BAR' ? 'Barra / Venta' : 'Casal / Interno'}</p>
          <table>
            <thead><tr><th width="50%">Producto</th><th width="15%" class="center">Cant.</th><th width="15%" class="center">Unidad</th><th width="20%" class="center">Categoría</th></tr></thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div class="total">Total Estimado: ${activePlanTotal.toFixed(2)}€</div>
          <div class="footer">Generado con MerelloPlanner 2026 • Documento Interno</div>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const handleShareWhatsapp = () => {
        const header = `📋 *PEDIDO MERELLO - ${activePlan.name}*\n📅 ${new Date().toLocaleDateString()}\n\n`;
        const body = activePlan.items.map(i => `- ${i.quantity} ${i.unit} x *${i.name}*`).join('\n');
        const footer = `\n\n💰 Valor Est.: ${activePlanTotal.toFixed(2)}€`;
        window.open(`https://wa.me/?text=${encodeURIComponent(header + body + footer)}`, '_blank');
    };

    const handleAddCatalogItem = () => {
        if (!newCatItem.name) return;
        onUpdateCatalog([...catalog, { ...newCatItem, id: `cat-${Date.now()}` }]);
        setNewCatItem({ name: '', category: 'General', defaultPrice: 1, unit: 'u' });
    };

    const groupedItems = useMemo((): Record<string, PlanItem[]> => {
        const groups: Record<string, PlanItem[]> = {};
        activePlan.items.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [activePlan.items]);

    const budgetImpact = ((currentSpent + activePlanTotal) / totalBudget) * 100;
    const filteredCatalog: CatalogItem[] = ((catalog as CatalogItem[]) || [])
        .filter(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(i => filterCategory === 'ALL' || i.category === filterCategory);

    return (
        <div className="flex flex-col h-[calc(100dvh-100px)] lg:h-[calc(100vh-140px)] gap-4 animate-in fade-in duration-500">

            {/* 1. DESKTOP HEADER (Full Featured) */}
            <div className="hidden lg:flex flex-row gap-6 shrink-0">
                <div className="flex-1 bg-white p-2 rounded-[28px] border border-slate-200 shadow-sm flex items-center overflow-hidden">
                    <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar px-2">
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setActivePlanId(plan.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all min-w-[160px] border ${activePlanId === plan.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${plan.type === 'BAR' ? 'bg-indigo-500' : 'bg-orange-500'}`}></div>
                                <div className="text-left overflow-hidden">
                                    <p className="text-xs font-black uppercase truncate max-w-[100px]">{plan.name}</p>
                                    <p className="text-[9px] font-bold opacity-60 uppercase">{plan.items.length} Refs</p>
                                </div>
                            </button>
                        ))}
                        <button onClick={handleCreatePlan} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><PlusCircle /></button>
                    </div>
                </div>

                <div className="bg-white px-6 py-4 rounded-[28px] border border-slate-200 shadow-sm flex flex-col justify-center min-w-[280px]">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto Presupuestario</span>
                        <span className={`text-lg font-black ${budgetImpact > 100 ? 'text-rose-500' : 'text-slate-800'}`}>{activePlanTotal.toFixed(2)}€</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-slate-300" style={{ width: `${Math.min((currentSpent / totalBudget) * 100, 100)}%` }}></div>
                        <div className="h-full bg-indigo-500 striped-bar" style={{ width: `${Math.min((activePlanTotal / totalBudget) * 100, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-400">
                        <span>Gastado</span>
                        <span className="text-indigo-500">+ Este Pedido</span>
                    </div>
                </div>
            </div>

            {/* 2. MOBILE HEADER (Compact) */}
            <div className="lg:hidden bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="relative flex-1">
                        <select
                            value={activePlanId}
                            onChange={(e) => setActivePlanId(e.target.value)}
                            className="appearance-none bg-slate-100 text-slate-900 font-black text-sm uppercase py-3 pl-4 pr-10 rounded-xl outline-none w-full truncate border-r-8 border-transparent"
                        >
                            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            <option value="NEW">+ Nuevo Borrador</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <button onClick={() => handleDeletePlan(activePlanId)} className="ml-2 p-3 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-xl"><Trash2 size={18} /></button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setMobileTab('ORDER')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'ORDER' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                        <List size={14} /> Pedido ({activePlan.items.length})
                    </button>
                    <button onClick={() => setMobileTab('CATALOG')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'CATALOG' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                        <Grid size={14} /> Catálogo
                    </button>
                </div>

                <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimado</span>
                    <span className="text-sm font-black text-slate-900">{activePlanTotal.toFixed(2)}€</span>
                </div>

                <button onClick={() => setIsScannerOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md shadow-indigo-500/30 active:scale-95 transition-transform">
                    <ScanLine size={16} /> Escanear Factura con IA
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">

                {/* 3. ORDER EDITOR PANE */}
                <div className={`flex-1 bg-white rounded-[32px] lg:rounded-[40px] border-2 border-slate-100 shadow-xl flex flex-col overflow-hidden relative ${mobileTab === 'CATALOG' ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Toolbar */}
                    <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                            {isRenameMode ? (
                                <input
                                    autoFocus
                                    className="text-xl md:text-2xl font-black text-slate-900 bg-transparent outline-none border-b-2 border-indigo-500 w-full md:w-64"
                                    value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onBlur={() => { updateActivePlan({ name: renameValue || activePlan.name }); setIsRenameMode(false); }}
                                    onKeyDown={e => e.key === 'Enter' && setIsRenameMode(false)}
                                />
                            ) : (
                                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setRenameValue(activePlan.name); setIsRenameMode(true); }}>
                                    <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter truncate max-w-[180px] md:max-w-none">{activePlan.name}</h2>
                                    <Edit3 size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors hidden md:block" />
                                </div>
                            )}

                            <div className="flex bg-slate-200 p-1 rounded-xl shrink-0 scale-90 md:scale-100 origin-right">
                                <button onClick={() => updateActivePlan({ type: 'BAR' })} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${activePlan.type === 'BAR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Barra</button>
                                <button onClick={() => updateActivePlan({ type: 'CASAL' })} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${activePlan.type === 'CASAL' ? 'bg-orange-50 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Casal</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto no-scrollbar hidden md:flex">
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-2 shrink-0">
                                <button onClick={handlePrintOrder} disabled={activePlan.items.length === 0} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"><Printer size={18} /></button>
                                <div className="w-px h-6 bg-slate-100 mx-1"></div>
                                <button onClick={handleShareWhatsapp} disabled={activePlan.items.length === 0} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"><MessageCircle size={18} /></button>
                            </div>

                            <button onClick={handleAutoFill} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all font-bold text-[10px] uppercase tracking-widest shrink-0 shadow-sm">
                                <Sparkles size={14} /> <span className="hidden xl:inline">Auto-Stock</span>
                            </button>

                            <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest shrink-0 shadow-md shadow-indigo-500/30">
                                <ScanLine size={14} /> <span className="hidden xl:inline">Escáner IA</span>
                            </button>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 custom-scrollbar">
                        {Object.keys(groupedItems).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-4">
                                <ClipboardList size={64} />
                                <p className="font-black uppercase tracking-widest text-sm text-center">Hoja de pedido vacía<br /><span className="text-[10px] font-medium">Añade productos del catálogo</span></p>
                            </div>
                        ) : (
                            (Object.entries(groupedItems) as [string, PlanItem[]][]).map(([cat, items]) => (
                                <div key={cat} className="space-y-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 bg-white py-2 z-10 flex items-center gap-2 border-b border-slate-100">
                                        <Tag size={12} /> {cat}
                                    </h3>
                                    {items.map(item => {
                                        const stockItem = stock.find(s => s.name.toUpperCase() === item.name.toUpperCase());
                                        const stockAlert = stockItem && stockItem.quantity <= stockItem.minStock;

                                        return (
                                            <div key={item.id} className="group flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all gap-2">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`p-2 rounded-xl shrink-0 ${stockAlert ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                                                        {stockAlert ? <AlertCircle size={16} /> : <Package size={16} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 text-xs md:text-sm leading-tight truncate">{item.name}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 truncate">
                                                            {stockItem ? `Stock: ${stockItem.quantity} ${stockItem.unit}` : 'Sin stock registrado'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-0.5">
                                                        <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 font-bold transition-colors">-</button>
                                                        <input
                                                            type="number"
                                                            className="w-10 text-center font-black text-slate-900 outline-none text-sm bg-transparent"
                                                            value={item.quantity}
                                                            onChange={e => updateItemQuantity(item.id, parseFloat(e.target.value) || 0)}
                                                        />
                                                        <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 font-bold transition-colors">+</button>
                                                    </div>
                                                    <div className="text-right w-14 hidden md:block">
                                                        <p className="font-black text-slate-900 text-xs">{(item.quantity * item.unitPrice).toFixed(2)}€</p>
                                                    </div>
                                                    <button onClick={() => updateItemQuantity(item.id, 0)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                        <div className="flex items-center gap-3 w-full md:w-auto hidden md:flex">
                            <div className="p-3 bg-slate-900 text-white rounded-xl shrink-0"><DollarSign size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimado</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{activePlanTotal.toFixed(2)}€</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            disabled={activePlan.items.length === 0}
                            className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            Emitir Pedido <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* 4. CATALOG SIDEBAR (PICKER) */}
                <div className={`w-full lg:w-96 bg-slate-900 rounded-[32px] lg:rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/5 ${mobileTab === 'ORDER' ? 'hidden lg:flex' : 'flex flex-1'}`}>
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
                                    onClick={() => handleAddItemToPlan(item)}
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
                        <button onClick={() => setIsCatalogManagerOpen(true)} className="w-full py-3 bg-white/5 text-slate-400 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                            <Settings size={12} /> Administrar Catálogo
                        </button>
                    </div>
                </div>

            </div>

            {/* --- MODALS --- */}

            {/* 1. CHECKOUT MODAL */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[48px] p-8 md:p-10 w-full max-w-lg shadow-2xl border-8 border-slate-900 space-y-6 md:space-y-8 max-h-[90vh] overflow-y-auto">
                        <div className="text-center">
                            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-2">Confirmar Envío</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">El pedido pasará a estado "Pendiente de Recepción"</p>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                <span>Referencias Totales</span>
                                <span>{activePlan.items.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                <span>Unidades Totales</span>
                                <span>{activePlan.items.reduce((a, b) => a + b.quantity, 0)}</span>
                            </div>
                            <div className="w-full h-px bg-slate-200 my-2"></div>
                            <div className="flex justify-between items-center text-xl font-black text-slate-900">
                                <span>Coste Estimado</span>
                                <span>{activePlanTotal.toFixed(2)}€</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Proveedor Asignado</label>
                            <select
                                value={selectedSupplierId}
                                onChange={e => setSelectedSupplierId(e.target.value)}
                                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-colors text-sm"
                            >
                                <option value="">Seleccionar Proveedor...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200">Volver</button>
                            <button
                                onClick={handleFinalize}
                                disabled={!selectedSupplierId}
                                className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Check size={16} /> Finalizar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. CATALOG MANAGER (Simplificado visualmente) */}
            {isCatalogManagerOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[48px] w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden border-8 border-slate-900">
                        <div className="p-6 md:p-8 border-b bg-slate-50 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Maestro de Productos</h3>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Base de datos de artículos</p>
                            </div>
                            <button onClick={() => setIsCatalogManagerOpen(false)} className="p-3 md:p-4 bg-white rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X size={24} /></button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* ADD FORM */}
                            <div className="w-full md:w-80 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 overflow-y-auto shrink-0">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2"><PlusCircle size={14} /> Alta Rápida</h4>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nombre</label>
                                        <input value={newCatItem.name} onChange={e => setNewCatItem({ ...newCatItem, name: e.target.value })} placeholder="Ej. Ron Barceló" className="w-full p-3 bg-white border rounded-xl font-bold text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Precio x Defecto</label>
                                        <div className="relative">
                                            <input type="number" step="0.01" value={newCatItem.defaultPrice} onChange={e => setNewCatItem({ ...newCatItem, defaultPrice: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-white border rounded-xl font-black text-lg outline-none focus:border-indigo-500" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-slate-300">€</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Unidad</label>
                                            <select
                                                value={newCatItem.unit}
                                                onChange={e => setNewCatItem({ ...newCatItem, unit: e.target.value })}
                                                className="w-full p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                                            >
                                                <option value="u">Unidades</option>
                                                <option value="kg">Kilos</option>
                                                <option value="L">Litros</option>
                                                <option value="cajas">Cajas</option>
                                                <option value="packs">Packs</option>
                                                <option value="botellas">Botellas</option>
                                                <option value="barriles">Barriles</option>
                                                <option value="latas">Latas</option>
                                                <option value="bolsas">Bolsas</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Categoría</label>
                                            <input value={newCatItem.category} onChange={e => setNewCatItem({ ...newCatItem, category: e.target.value })} placeholder="Bebida" className="w-full p-3 bg-white border rounded-xl font-bold text-xs outline-none focus:border-indigo-500" />
                                        </div>
                                    </div>
                                    <button onClick={handleAddCatalogItem} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg mt-4 hover:bg-indigo-700 transition-all">Guardar</button>
                                </div>
                            </div>

                            {/* LIST */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(catalog as CatalogItem[]).map(item => (
                                        <div key={item.id} className="p-4 border rounded-2xl flex justify-between items-center group hover:border-indigo-300 transition-all">
                                            <div>
                                                <p className="font-black text-slate-800 text-sm italic uppercase">{item.name}</p>
                                                <div className="flex gap-2 items-center mt-1">
                                                    <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">{item.category}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{item.unit} • {item.defaultPrice}€</span>
                                                </div>
                                            </div>
                                            <button onClick={() => onUpdateCatalog(catalog.filter(i => i.id !== item.id))} className="p-3 text-slate-200 hover:text-rose-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. AI SCANNER MODAL */}
            {isScannerOpen && (
                <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center border-4 border-indigo-500 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 w-full flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl mb-6 shadow-indigo-500/30 animate-bounce-slow">
                                <Sparkles size={40} />
                            </div>

                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
                                {isScanning ? 'Mágia en Proceso...' : 'Escáner Mágico'}
                            </h3>

                            {!isScanning && (
                                <p className="text-slate-500 text-xs font-bold leading-relaxed px-4 mb-8">
                                    Apunta la cámara a una lista de la compra o albarán físico. Gemini extraerá las cantidades por ti automáticamente.
                                </p>
                            )}

                            {scanPreview && (
                                <div className="w-full aspect-[4/5] bg-slate-100 rounded-3xl mb-8 overflow-hidden border-2 border-indigo-100 relative shadow-inner">
                                    <img src={scanPreview} className="w-full h-full object-cover opacity-50 sepia-[0.3]" />
                                    <div className="absolute inset-0 bg-indigo-900/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                        <Loader2 className="animate-spin text-white mb-4" size={48} />
                                        <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-md text-white font-black uppercase text-[10px] tracking-widest border border-white/30">
                                            Extrayendo Productos...
                                        </div>
                                    </div>

                                    {/* Sonar Scan Animation */}
                                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400 shadow-[0_0_20px_5px_rgba(52,211,153,0.5)] animate-scan-line"></div>
                                </div>
                            )}

                            {!isScanning && (
                                <div className="w-full space-y-3">
                                    {/* Opción 1: Cámara */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleFileSelect}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 relative z-10 pointer-events-none">
                                            <Camera size={20} /> 📸 Hacer Foto
                                        </button>
                                    </div>
                                    {/* Opción 2: Galería */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        <button className="w-full py-5 bg-white text-indigo-600 border-2 border-indigo-200 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 relative z-10 pointer-events-none">
                                            <FileInput size={20} /> 🖼️ Elegir de Galería
                                        </button>
                                    </div>
                                    <button onClick={() => setIsScannerOpen(false)} className="w-full py-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors">
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .striped-bar { background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent); background-size: 1rem 1rem; }
      `}</style>
        </div>
    );
};
