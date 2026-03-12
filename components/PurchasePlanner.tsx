import React, { useState, useEffect } from 'react';
import { Supplier, Order, CatalogItem, StockItem, ESCUDO_BASE64, Plan, PlanItem } from '../types';
import { PurchaseHeader } from './purchase/PurchaseHeader';
import { PurchaseOrderPane } from './purchase/PurchaseOrderPane';
import { PurchaseCatalogSidebar } from './purchase/PurchaseCatalogSidebar';
import { PurchaseModals } from './purchase/PurchaseModals';
import { useToast } from '../hooks/useToast';
import { haptic } from '../utils/haptic';



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

export const PurchasePlanner: React.FC<Props> = ({ catalog, onUpdateCatalog, onCreateOrder, suppliers, totalBudget, currentSpent, stock = [] }) => {
    const toast = useToast();
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

    // Mobile View State
    const [mobileTab, setMobileTab] = useState<'ORDER' | 'CATALOG'>('ORDER');
    const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

    // New Plan State
    const [isRenameMode, setIsRenameMode] = useState(false);
    const [renameValue, setRenameValue] = useState('');

    // Catalog Manager State
    const [newCatItem, setNewCatItem] = useState<Omit<CatalogItem, 'id'>>({ name: '', category: 'General', defaultPrice: 1, unit: 'u' });

    // Persistence
    useEffect(() => { localStorage.setItem('merello_purchase_plans', JSON.stringify(plans)); }, [plans]);

    // Derived State
    const activePlan = plans.find(p => p.id === activePlanId) || plans[0];
    const activePlanTotal = activePlan.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const budgetImpact = ((currentSpent + activePlanTotal) / totalBudget) * 100;

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
        setMobileTab('ORDER');
    };

    const handleDeletePlan = (id: string) => {
        if (plans.length === 1) {
            toast.error("Debe haber al menos un borrador activo.");
            return;
        }
        if (confirm("¿Eliminar este borrador definitivamente?")) {
            const newPlans = plans.filter(p => p.id !== id);
            setPlans(newPlans);
            setActivePlanId(newPlans[0].id);
        }
    };

    const updateActivePlan = (updates: Partial<Plan>) => {
        setPlans(plans.map(p => p.id === activePlanId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
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
        haptic.success();
    };

    const updateItemQuantity = (itemId: string, newQty: number) => {
        if (newQty <= 0) {
            updateActivePlan({ items: activePlan.items.filter(i => i.id !== itemId) });
        } else {
            updateActivePlan({ items: activePlan.items.map(i => i.id === itemId ? { ...i, quantity: newQty } : i) });
        }
    };

    const handleAutoFill = () => {
        const needsRestock = stock.filter(s => s.quantity <= s.minStock);

        if (needsRestock.length === 0) {
            toast.success("✅ El inventario está saludable. No hay roturas de stock detectadas.");
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

    const handlePrintOrder = () => {
        // Basic logic for print window
        const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast.error("Permite las ventanas emergentes para imprimir.");

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
          <p><strong>Destino:</strong> ${activePlan.type === 'BAR' ? 'Barra / Venta' : 'Casal / Interno'} (Almacén General)</p>
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

    return (
        <div className="flex flex-col h-[calc(100dvh-100px)] lg:h-[calc(100vh-140px)] gap-4 animate-in fade-in duration-500">

            <PurchaseHeader
                plans={plans}
                activePlanId={activePlanId}
                setActivePlanId={setActivePlanId}
                handleCreatePlan={handleCreatePlan}
                handleDeletePlan={handleDeletePlan}
                budgetImpact={budgetImpact}
                activePlanTotal={activePlanTotal}
                currentSpent={currentSpent}
                totalBudget={totalBudget}
                mobileTab={mobileTab}
                setMobileTab={setMobileTab}
                activePlan={activePlan}
            />

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">

                <PurchaseOrderPane
                    activePlan={activePlan}
                    updateActivePlan={updateActivePlan}
                    mobileTab={mobileTab}
                    isRenameMode={isRenameMode}
                    setIsRenameMode={setIsRenameMode}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    stock={stock}
                    handlePrintOrder={handlePrintOrder}
                    handleShareWhatsapp={handleShareWhatsapp}
                    handleAutoFill={handleAutoFill}
                    updateItemQuantity={updateItemQuantity}
                    setIsCheckoutOpen={setIsCheckoutOpen}
                    activePlanTotal={activePlanTotal}
                />

                <PurchaseCatalogSidebar
                    catalog={catalog}
                    onUpdateCatalog={onUpdateCatalog}
                    onAddItem={handleAddItemToPlan}
                    mobileTab={mobileTab}
                    lastAddedItem={lastAddedItem}
                    onOpenCatalogManager={() => setIsCatalogManagerOpen(true)}
                />

            </div>

            <PurchaseModals
                isCheckoutOpen={isCheckoutOpen}
                setIsCheckoutOpen={setIsCheckoutOpen}
                activePlan={activePlan}
                activePlanTotal={activePlanTotal}
                suppliers={suppliers}
                selectedSupplierId={selectedSupplierId}
                setSelectedSupplierId={setSelectedSupplierId}
                handleFinalize={handleFinalize}
                isCatalogManagerOpen={isCatalogManagerOpen}
                setIsCatalogManagerOpen={setIsCatalogManagerOpen}
                newCatItem={newCatItem}
                setNewCatItem={setNewCatItem}
                handleAddCatalogItem={handleAddCatalogItem}
                catalog={catalog}
                onUpdateCatalog={onUpdateCatalog}
            />
        </div>
    );
};
