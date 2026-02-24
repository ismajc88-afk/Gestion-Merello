
import React, { useState, useMemo } from 'react';
import { Supplier, Order, ESCUDO_BASE64 } from '../types';
import { 
  Phone, Package, Search, BarChart3, Building2,
  User, Contact, X, CheckCircle2, Plus, Trash2, Home, Store, DollarSign,
  AlertCircle, Edit, MessageCircle, TrendingUp, PieChart as PieIcon, ArrowRight,
  FileText, Truck, Minus, Printer
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';

interface Props {
  suppliers: Supplier[];
  orders: Order[];
  categories: string[];
  onMarkReceived: (orderId: string, actualCost: number, items?: { name: string; quantity: number }[]) => void;
  onAddSupplier: (s: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

export const SupplierManager: React.FC<Props> = ({ suppliers, orders, categories, onMarkReceived, onAddSupplier, onUpdateSupplier, onDeleteSupplier }) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'DELIVERIES' | 'STATS'>('DIRECTORY');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const initialFormState = { name: '', phone: '', category: categories[0] || 'Otros', contactPerson: '', cif: '' };
  const [formData, setFormData] = useState(initialFormState);
  
  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState<Order | null>(null);
  const [actualCost, setActualCost] = useState('');
  const [receivedItems, setReceivedItems] = useState<{name: string, quantity: number}[]>([]);

  // --- ANALYTICS ---
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED');
    
    const pendingValue = pendingOrders.reduce((acc, o) => acc + o.estimatedCost, 0);
    const totalVolume = orders.reduce((acc, o) => acc + o.estimatedCost, 0);

    const volumeBySupplier = suppliers.map(s => {
        const supOrders = orders.filter(o => o.supplierName === s.name); // Matching by name is risky if edited, ideally ID, but schema uses name currently.
        const value = supOrders.reduce((acc, o) => acc + o.estimatedCost, 0);
        return { name: s.name, value, count: supOrders.length };
    }).sort((a,b) => b.value - a.value).filter(s => s.value > 0);

    const pendingBySupplier = suppliers.map(s => {
        const count = pendingOrders.filter(o => o.supplierName === s.name).length;
        return { id: s.id, count };
    });

    return { totalOrders, pendingOrders, receivedOrders, pendingValue, totalVolume, volumeBySupplier, pendingBySupplier };
  }, [orders, suppliers]);

  // --- HANDLERS ---
  const handleSave = () => {
    if (!formData.name || !formData.phone) return;
    
    if (editingId) {
        onUpdateSupplier(editingId, formData);
    } else {
        onAddSupplier(formData);
    }
    closeModal();
  };

  const openAddModal = () => {
      setFormData(initialFormState);
      setEditingId(null);
      setIsModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
      setFormData({
          name: s.name,
          phone: s.phone,
          category: s.category,
          contactPerson: s.contactPerson || '',
          cif: s.cif || ''
      });
      setEditingId(s.id);
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
  };

  const handleProcessReceipt = () => {
     if (!showReceiptModal) return;
     onMarkReceived(showReceiptModal.id, parseFloat(actualCost) || showReceiptModal.estimatedCost, receivedItems);
     setShowReceiptModal(null);
     setActualCost('');
     setReceivedItems([]);
  };

  const updateQty = (index: number, delta: number) => {
      const newItems = [...receivedItems];
      newItems[index].quantity = Math.max(0, newItems[index].quantity + delta);
      setReceivedItems(newItems);
  };

  const handlePrintReceipt = () => {
    if (!showReceiptModal) return;
    
    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const orderDateStr = new Date(showReceiptModal.date).toLocaleDateString('es-ES');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Permite las ventanas emergentes para imprimir.");

    const itemsRows = receivedItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">${item.name}</td>
        <td style="padding: 12px 0; text-align: center; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: center; color: #64748b;">Verificado</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Albarán de Recepción - ${showReceiptModal.title}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #10b981; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { width: 80px; height: 80px; }
            .title h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: -1px; color: #0f172a; }
            .title p { margin: 5px 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px; }
            .info-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 4px; }
            .info-item span { font-weight: bold; font-size: 16px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #64748b; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
            th.center { text-align: center; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-box { width: 45%; border-top: 1px solid #cbd5e1; padding-top: 10px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">
              <h1>Albarán de Recepción</h1>
              <p>Entrada de Mercancía • ${dateStr}</p>
            </div>
            <div class="logo">
               <img src="${ESCUDO_BASE64}" style="width:100%; height:100%; object-fit:contain;" />
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Proveedor</label>
              <span>${showReceiptModal.supplierName}</span>
            </div>
            <div class="info-item">
              <label>Referencia Pedido</label>
              <span>${showReceiptModal.title}</span>
            </div>
            <div class="info-item">
              <label>Fecha Original Pedido</label>
              <span>${orderDateStr}</span>
            </div>
            <div class="info-item">
              <label>Destino</label>
              <span>${showReceiptModal.orderType === 'BAR' ? 'Barra / Venta' : 'Casal / Interno'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="60%">Producto Revisado</th>
                <th width="20%" class="center">Cant. Recibida</th>
                <th width="20%" class="center">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="signature">
            <div class="sig-box">Firma Transportista</div>
            <div class="sig-box">Firma Receptor (Falla)</div>
          </div>

          <div class="footer">
            Documento generado el ${dateStr} • MerelloPlanner 2026
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* HEADER NAV */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-[28px] border border-slate-200 shadow-sm shrink-0">
         <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {[
               { id: 'DIRECTORY', label: 'Directorio', icon: User },
               { id: 'DELIVERIES', label: 'Entregas', icon: Package, badge: stats.pendingOrders.length },
               { id: 'STATS', label: 'Analítica', icon: BarChart3 }
            ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}>
                  <tab.icon size={14}/> {tab.label}
                  {(tab as any).badge > 0 && <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[9px] min-w-[18px] text-center">{(tab as any).badge}</span>}
               </button>
            ))}
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto px-2">
            {activeTab === 'DIRECTORY' && (
                <div className="relative flex-1 md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar proveedor..." className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all" />
                </div>
            )}
            {activeTab === 'DIRECTORY' && (
                <button onClick={openAddModal} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"><Plus size={20}/></button>
            )}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
         
         {/* --- DIRECTORY TAB --- */}
         {activeTab === 'DIRECTORY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {suppliers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(sup => {
                  const pendingCount = stats.pendingBySupplier.find(p => p.id === sup.id)?.count || 0;
                  
                  return (
                    <div key={sup.id} className="bg-white rounded-[40px] p-8 border-2 border-slate-100 shadow-sm group hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col relative overflow-hidden">
                        {pendingCount > 0 && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
                                <Package size={10}/> {pendingCount} Pendiente{pendingCount > 1 ? 's' : ''}
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Building2 size={24}/></div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg tracking-tight mb-1 truncate max-w-[180px]">{sup.name}</h4>
                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{sup.category}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                                <Phone size={14} className="text-indigo-400"/> {sup.phone}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                                <Contact size={14} className="text-indigo-400"/> {sup.contactPerson || 'Sin contacto'}
                            </p>
                            {sup.cif && (
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                                    <FileText size={14} className="text-indigo-400"/> {sup.cif}
                                </p>
                            )}
                        </div>

                        <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                            <a href={`tel:${sup.phone}`} className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-black text-[9px] uppercase text-center flex items-center justify-center gap-2 transition-colors">
                                <Phone size={14}/> Llamar
                            </a>
                            <a href={`https://wa.me/${sup.phone.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-black text-[9px] uppercase text-center flex items-center justify-center gap-2 transition-colors">
                                <MessageCircle size={14}/> Whatsapp
                            </a>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={()=>openEditModal(sup)} className="flex-1 py-2 text-indigo-300 hover:text-indigo-600 transition-colors text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                                <Edit size={12}/> Editar
                            </button>
                            <button onClick={()=>onDeleteSupplier(sup.id)} className="flex-1 py-2 text-slate-300 hover:text-rose-500 transition-colors text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                                <Trash2 size={12}/> Eliminar
                            </button>
                        </div>
                    </div>
                  );
               })}
               {suppliers.length === 0 && (
                   <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
                       <Building2 size={64} className="mb-4 text-slate-400"/>
                       <p className="font-black uppercase tracking-widest text-slate-400">Directorio Vacío</p>
                   </div>
               )}
            </div>
         )}

         {/* --- DELIVERIES TAB --- */}
         {activeTab === 'DELIVERIES' && (
            <div className="space-y-8">
               
               {/* Summary Cards */}
               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-indigo-600 text-white p-6 rounded-[32px] shadow-lg flex items-center justify-between relative overflow-hidden">
                       <div className="relative z-10">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Pedidos en Curso</p>
                           <h3 className="text-4xl font-black">{stats.pendingOrders.length}</h3>
                       </div>
                       <Package size={64} className="absolute -right-4 -bottom-6 opacity-20 rotate-12"/>
                   </div>
                   <div className="bg-white border-2 border-slate-100 p-6 rounded-[32px] shadow-sm flex items-center justify-between">
                       <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Valor Pendiente</p>
                           <h3 className="text-3xl font-black text-slate-900">{stats.pendingValue.toLocaleString()}€</h3>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-2xl"><DollarSign size={24} className="text-slate-400"/></div>
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stats.pendingOrders.map(order => (
                     <div key={order.id} className={`bg-white rounded-[40px] p-8 border-2 shadow-sm transition-all flex flex-col gap-6 relative group ${order.orderType === 'CASAL' ? 'border-orange-100 hover:border-orange-400' : 'border-indigo-100 hover:border-indigo-400'}`}>
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className={`p-4 rounded-2xl text-white shadow-md ${order.orderType === 'CASAL' ? 'bg-orange-500' : 'bg-indigo-600'}`}>
                                 {order.orderType === 'CASAL' ? <Home size={24}/> : <Store size={24}/>}
                              </div>
                              <div>
                                 <h4 className="font-black text-slate-900 text-xl tracking-tighter uppercase italic">{order.title}</h4>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                     <Truck size={10}/> {order.supplierName}
                                 </p>
                              </div>
                           </div>
                           <span className="text-2xl font-black text-slate-900">{order.estimatedCost.toFixed(2)}€</span>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Contenido</p>
                           <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                 <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-200/50 pb-1 last:border-0 last:pb-0">
                                    <span>{item.name}</span>
                                    <span className="bg-white px-2 py-0.5 rounded-lg shadow-sm border border-slate-100">{item.quantity} u.</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={() => { 
                                    setShowReceiptModal(order); 
                                    setActualCost(order.estimatedCost.toString());
                                    setReceivedItems(order.items.map(i => ({...i})));
                                }}
                                className={`w-full py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${order.orderType === 'CASAL' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                <CheckCircle2 size={18}/> Recepcionar Mercancía
                            </button>
                            <p className="text-[9px] text-center mt-3 font-bold text-slate-300 uppercase tracking-widest">
                                Pedido el {new Date(order.date).toLocaleDateString()}
                            </p>
                        </div>
                     </div>
                  ))}
                  {stats.pendingOrders.length === 0 && (
                     <div className="col-span-full py-40 text-center opacity-30 italic font-black uppercase text-xl flex flex-col items-center">
                         <CheckCircle2 size={64} className="mb-4 text-emerald-500"/>
                         <p>Todo el material recibido</p>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* --- STATS TAB --- */}
         {activeTab === 'STATS' && (
             <div className="space-y-8 animate-in slide-in-from-right-4">
                 
                 <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5"><BarChart3 size={200}/></div>
                     <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                         <div>
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Volumen Total Negociado</p>
                             <h3 className="text-6xl font-black tracking-tighter tabular-nums">{stats.totalVolume.toLocaleString()}€</h3>
                             <p className="text-sm text-slate-400 font-medium mt-2">{stats.totalOrders} Pedidos tramitados hasta la fecha.</p>
                         </div>
                         <div className="flex gap-4">
                             <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recibidos</p>
                                 <p className="text-2xl font-black">{stats.receivedOrders.length}</p>
                             </div>
                             <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">En Curso</p>
                                 <p className="text-2xl font-black text-orange-400 animate-pulse">{stats.pendingOrders.length}</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white p-8 rounded-[48px] border-2 border-slate-100 shadow-sm">
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-6">
                             <TrendingUp size={18} className="text-indigo-600"/> Top Proveedores (Volumen €)
                         </h4>
                         <div className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={stats.volumeBySupplier} layout="vertical" margin={{ left: 20 }}>
                                     <XAxis type="number" hide />
                                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                                     <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                     <Bar dataKey="value" barSize={16} radius={[0, 8, 8, 0]}>
                                        {stats.volumeBySupplier.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                     </Bar>
                                 </BarChart>
                             </ResponsiveContainer>
                         </div>
                     </div>

                     <div className="bg-white p-8 rounded-[48px] border-2 border-slate-100 shadow-sm">
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-6">
                             <PieIcon size={18} className="text-indigo-600"/> Distribución Pedidos
                         </h4>
                         <div className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                     <Pie data={stats.volumeBySupplier} dataKey="count" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {stats.volumeBySupplier.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                     </Pie>
                                     <Tooltip />
                                     <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                                 </PieChart>
                             </ResponsiveContainer>
                         </div>
                     </div>
                 </div>
             </div>
         )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[48px] p-10 w-full max-w-lg shadow-2xl space-y-8 animate-in zoom-in-95 border-4 border-slate-900">
               <div className="flex justify-between items-center">
                  <div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">{editingId ? 'Editar' : 'Nuevo'} Proveedor</h3>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestión de Agenda</p>
                  </div>
                  <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nombre Fiscal / Empresa</label>
                      <input autoFocus value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl font-bold outline-none" placeholder="Ej. Distribuciones García" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Teléfono</label>
                          <input value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl font-bold outline-none" placeholder="+34..." />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Categoría</label>
                          <select value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl font-bold outline-none cursor-pointer">
                             {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Persona de Contacto (Opcional)</label>
                      <input value={formData.contactPerson} onChange={e=>setFormData({...formData, contactPerson:e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl font-bold outline-none" placeholder="Ej. Juan (Comercial)" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">CIF / NIF (Opcional)</label>
                      <input value={formData.cif} onChange={e=>setFormData({...formData, cif:e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl font-bold outline-none" placeholder="B-12345678" />
                  </div>
               </div>

               <button onClick={handleSave} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
                   {editingId ? 'Guardar Cambios' : 'Registrar Proveedor'}
               </button>
            </div>
         </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {showReceiptModal && (
         <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-[48px] p-10 w-full max-w-lg shadow-2xl space-y-8 border-8 border-slate-900">
               <div className="text-center">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Entrada de Género</h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Revisa cantidades y coste final</p>
               </div>
               
               <div className="space-y-6">
                  {/* EDITABLE ITEMS LIST */}
                  <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Revisar Mercancía</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                          {receivedItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                  <span className="text-xs font-bold text-slate-700 truncate flex-1">{item.name}</span>
                                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                      <button onClick={() => updateQty(idx, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-500 hover:text-rose-500 font-black">-</button>
                                      <span className="text-sm font-black w-6 text-center tabular-nums">{item.quantity}</span>
                                      <button onClick={() => updateQty(idx, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-900 text-white rounded-md shadow-sm font-black hover:bg-indigo-600">+</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-slate-100 flex items-center gap-6 group focus-within:border-indigo-500 transition-all">
                     <div className="p-4 bg-indigo-600 text-white rounded-2xl"><DollarSign size={24}/></div>
                     <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Importe Final Pagado</label>
                        <input type="number" step="0.01" autoFocus value={actualCost} onChange={e=>setActualCost(e.target.value)} className="w-full bg-transparent font-black text-4xl outline-none text-slate-900" placeholder={showReceiptModal.estimatedCost.toString()} />
                     </div>
                  </div>
                  
                  {showReceiptModal.orderType === 'CASAL' ? (
                     <div className="bg-orange-50 p-6 rounded-[32px] border-2 border-orange-100 flex items-start gap-4">
                        <AlertCircle className="text-orange-500 shrink-0" size={24}/>
                        <div>
                           <p className="text-xs font-black text-orange-900 uppercase">Impacto Presupuestario</p>
                           <p className="text-[10px] text-orange-700 leading-relaxed font-medium">Este pedido se descontará automáticamente de la caja de la falla y actualizará los informes de gasto.</p>
                        </div>
                     </div>
                  ) : (
                     <div className="bg-indigo-50 p-6 rounded-[32px] border-2 border-indigo-100 flex items-start gap-4">
                        <Store className="text-indigo-500 shrink-0" size={24}/>
                        <div>
                           <p className="text-xs font-black text-indigo-900 uppercase">Inversión Recuperable</p>
                           <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">Este pedido se contabilizará como inversión de Barra y NO restará del presupuesto operativo de la comisión.</p>
                        </div>
                     </div>
                  )}
               </div>
               
               <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                      <button onClick={() => setShowReceiptModal(null)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-3xl transition-colors">Cancelar</button>
                      <button onClick={handleProcessReceipt} className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                         <CheckCircle2 size={18}/> Confirmar Recepción
                      </button>
                  </div>
                  <button onClick={handlePrintReceipt} className="w-full py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                      <Printer size={16}/> Imprimir Albarán de Recepción
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
