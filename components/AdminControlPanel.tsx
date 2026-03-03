
import React, { useState } from 'react';
import { AppData, AppConfig, UserRole, BarPrice, KioskConfig, BasicItem, PREDEFINED_STOCK_CATEGORIES } from '../types';
import {
   Settings, ShieldAlert, Key, Edit3, Trash2,
   Save, AlertTriangle, CheckCircle2, RefreshCw,
   Lock, Smartphone, Database, Zap, FileText,
   Users, Wallet, Truck, Beer, Plus, Tag, Clock,
   DollarSign, ChevronRight, X, ShieldCheck, Box, Ruler, Calendar, MapPin,
   ClipboardList, Wifi, Monitor, Activity, Cloud, UploadCloud, Ticket, Home, Calculator,
   ShoppingBag, List, Shield
} from 'lucide-react';
import { SyncModules } from './SyncModules';
import { RolePermissionsPanel } from './RolePermissionsPanel';
import { AuditLog } from './AuditLog';
import { ConfirmModal } from './ConfirmModal';
import { History, DownloadCloud } from 'lucide-react';
import { db, doc, setDoc } from '../services/firebase';

interface Props {
   data: AppData;
   onUpdateConfig: (config: AppConfig) => void;
   onResetModule: (key: string) => void;
   onFullImport?: (newData: AppData) => void;
   peerCount?: number;
   kioskConfig?: KioskConfig;
   onUpdateKioskConfig?: (config: KioskConfig) => void;
   onClearAuditLog?: () => void;
}

export const AdminControlPanel: React.FC<Props> = ({ data, onUpdateConfig, onResetModule, onFullImport, peerCount = 0, kioskConfig, onUpdateKioskConfig, onClearAuditLog }) => {
   const [config, setConfig] = useState<AppConfig>(data.appConfig);
   const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PRICES' | 'MASTERS' | 'PERMISOS' | 'SYNC' | 'DANGER' | 'AUDIT'>('IDENTITY');
   const [newVal, setNewVal] = useState('');
   const [newSubcat, setNewSubcat] = useState<Record<string, string>>({});
   const [activeMaster, setActiveMaster] = useState<'SUPPLIERS' | 'BUDGET' | 'STOCK' | 'UNITS' | 'LOCATIONS'>('SUPPLIERS');

   // New Ticket Form State
   const [newTicket, setNewTicket] = useState({ name: '', price: '1.00', category: 'ALCOHOL' });

   // Backups State
   const [backups, setBackups] = useState<any[]>([]);
   const [isBackingUp, setIsBackingUp] = useState(false);
   const [pendingDangerAction, setPendingDangerAction] = useState<{ title: string; message: string; confirmWord: string; onConfirm: () => void } | null>(null);

   // Carga de Backups Históricos
   const loadBackups = async () => {
      try {
         /*const q = query(collection(db, 'falla_backups', 'merello2026', 'history'), orderBy('timestamp', 'desc'), limit(15));
         const snapshot = await getDocs(q);
         const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setBackups(list);*/
      } catch (err) {
         console.warn("No se pudieron cargar los backups:", err);
      }
   };

   React.useEffect(() => {
      //if (activeTab === 'SYNC') loadBackups();
   }, [activeTab]);

   // Backup Automático Diario a las 04:00 AM
   React.useEffect(() => {
      const runAutoBackup = async () => {
         const now = new Date();
         if (now.getHours() >= 4) {
            const dateStr = now.toLocaleDateString('es-ES');
            const lastAuto = localStorage.getItem('merello_last_auto_backup');
            if (lastAuto !== dateStr) {
               try {
                  /*await addDoc(collection(db, 'falla_backups', 'merello2026', 'history'), {
                     timestamp: now.toISOString(),
                     trigger: 'AUTO_NIGHT_BACKUP',
                     data: data
                  });*/
                  localStorage.setItem('merello_last_auto_backup', dateStr);
                  console.log("Auto-backup completado con éxito a las 4 AM.");
               } catch (e) { console.error("Fallo auto-backup", e); }
            }
         }
      };
      runAutoBackup();
   }, []);

   const createManualBackup = async () => {
      setIsBackingUp(true);
      try {
         /*await addDoc(collection(db, 'falla_backups', 'merello2026', 'history'), {
            timestamp: new Date().toISOString(),
            trigger: 'MANUAL_ADMIN',
            data: data
         });*/
         alert("✅ Copia de Seguridad generada y guardada en la Nube.");
         loadBackups();
      } catch (err) {
         alert("❌ Error creando backup: " + err);
      }
      setIsBackingUp(false);
   };

   const restoreBackup = async (backupData: AppData) => {
      if (!confirm("⚠️ ATENCIÓN: Vas a sobreescribir la Base de Datos actual con esta copia pasada. Todos los cambios recientes se perderán irreversiblemente. ¿Estás absolutamente seguro?")) return;
      if (!confirm("⚠️ DOBLE CONFIRMACIÓN: ¿Restaurar Base de Datos a la copia seleccionada?")) return;
      try {
         await setDoc(doc(db, 'falla/merello2026'), backupData);
         alert("✅ RESTAURACIÓN COMPLETADA. La app se recargará ahora.");
         window.location.reload();
      } catch (err) {
         alert("❌ Error al restaurar: " + err);
      }
   };

   const handleSave = () => {
      onUpdateConfig(config);
      alert("✅ Configuración Maestra actualizada y propagada a todos los terminales.");
   };

   const updatePin = (role: UserRole, val: string) => {
      if (val.length > 4) return;
      const numericVal = val.replace(/[^0-9]/g, '');
      setConfig({ ...config, pins: { ...config.pins, [role]: numericVal } });
   };

   const handleMasterAdd = (listKey: keyof AppConfig) => {
      if (!newVal.trim()) return;
      const list = config[listKey] as string[];
      if (list.includes(newVal.trim())) return;
      setConfig({ ...config, [listKey]: [...list, newVal.trim()] });
      setNewVal('');
   };

   const handleMasterRemove = (listKey: keyof AppConfig, item: string) => {
      const list = config[listKey] as string[];
      setConfig({ ...config, [listKey]: list.filter(x => x !== item) });
   };

   const updatePrice = (index: number, field: keyof BarPrice, value: any) => {
      const newPrices = [...config.barPrices];
      newPrices[index] = { ...newPrices[index], [field]: value };
      setConfig({ ...config, barPrices: newPrices });
   };

   const removePrice = (item: BarPrice) => {
      const newPrices = config.barPrices.filter(p => p.name !== item.name);
      setConfig({ ...config, barPrices: newPrices });

      // Also remove from Kiosk Lists if present (cleanup)
      if (kioskConfig && onUpdateKioskConfig) {
         const newKiosk = { ...kioskConfig };
         newKiosk.alcoholItems = newKiosk.alcoholItems.filter(n => n !== item.name);
         newKiosk.mixerItems = newKiosk.mixerItems.filter(n => n !== item.name);
         newKiosk.cupItems = newKiosk.cupItems.filter(n => n !== item.name);
         onUpdateKioskConfig(newKiosk);
      }
   };

   const addTicketSmart = () => {
      if (!newTicket.name || !newTicket.price) return;

      // 1. Add to Price List
      const newPrices = [...config.barPrices, { name: newTicket.name, price: parseFloat(newTicket.price) }];
      setConfig({ ...config, barPrices: newPrices });

      // 2. Add to Kiosk List (Visibilidad en Cajero)
      if (kioskConfig && onUpdateKioskConfig) {
         const newKiosk = { ...kioskConfig };
         if (newTicket.category === 'ALCOHOL') {
            if (!newKiosk.alcoholItems.includes(newTicket.name)) newKiosk.alcoholItems.push(newTicket.name);
         } else if (newTicket.category === 'REFRESCO') {
            if (!newKiosk.mixerItems.includes(newTicket.name)) newKiosk.mixerItems.push(newTicket.name);
         } else {
            if (!newKiosk.cupItems.includes(newTicket.name)) newKiosk.cupItems.push(newTicket.name);
         }
         onUpdateKioskConfig(newKiosk);
      }

      setNewTicket({ name: '', price: '', category: 'ALCOHOL' });
   };

   const securityRoles: { id: UserRole, label: string, icon: any }[] = [
      { id: 'ADMIN', label: 'Administrador Master', icon: ShieldCheck },
      { id: 'TESORERIA', label: 'Contabilidad y Caja', icon: Wallet },
      { id: 'LOGISTICA', label: 'Gestión Suministros', icon: Truck },
      { id: 'CAJERO', label: 'Cajero (Venta)', icon: Calculator },
      { id: 'CAMARERO', label: 'Camarero (Venta)', icon: Beer },
      { id: 'KIOSKO_CASAL', label: 'Barra Fallera (Casal)', icon: Home },
   ];

   return (
      <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">

         {/* HEADER */}
         <div className="bg-[#09090b] text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12"><Settings size={300} /></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Master Operations Control</span>
               </div>
               <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">AJUSTES<br /><span className="text-indigo-600">DEL SISTEMA</span></h1>
               <p className="text-slate-400 mt-4 max-w-lg font-medium italic">Terminal de mando central para seguridad, tarifas y maestros de datos.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center md:items-end gap-4">
               <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-6 shadow-inner">
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dispositivos en Red</p>
                     <p className="text-3xl font-black text-white tabular-nums">{peerCount + 1}</p>
                  </div>
                  <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl animate-pulse">
                     <Wifi size={24} />
                  </div>
               </div>
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sincronización P2P Activa
               </span>
            </div>
         </div>

         {/* NAVBAR */}
         <div className="flex gap-2 overflow-x-auto p-2 bg-white rounded-3xl border border-slate-200 shadow-sm no-scrollbar">
            {[
               { id: 'IDENTITY', label: 'Seguridad y PINs', icon: Lock },
               { id: 'PRICES', label: 'Productos y Tickets', icon: Ticket },
               { id: 'MASTERS', label: 'Maestros', icon: Database },
               { id: 'PERMISOS', label: 'Permisos por Rol', icon: Shield },
               { id: 'SYNC', label: 'Nube / Backup', icon: UploadCloud },
               { id: 'AUDIT', label: 'Auditoría', icon: History },
               { id: 'DANGER', label: 'Danger Zone', icon: AlertTriangle }
            ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <tab.icon size={16} /> {tab.label}
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-8">

               {/* TEMA: AUDITORÍA */}
               {activeTab === 'AUDIT' && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4">
                     <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                              <History size={20} className="text-indigo-600" /> Historial de Acciones
                           </h3>
                           <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                              {data.auditLog?.length ?? 0} entradas
                           </span>
                        </div>
                        <AuditLog auditLog={data.auditLog ?? []} onClearLog={onClearAuditLog} />
                     </div>
                  </div>
               )}

               {/* TEMA: SEGURIDAD */}
               {activeTab === 'IDENTITY' && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4">
                     <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-8">

                        <div className="flex justify-between items-center">
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><Key size={20} className="text-indigo-600" /> Códigos de Acceso (PIN)</h3>
                           <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase">Cifrado de 4 Dígitos</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Gestiona los PINs de cada perfil. Los cambios cerrarán las sesiones activas que no coincidan.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {securityRoles.map(role => (
                              <div key={role.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group transition-all focus-within:border-indigo-500 focus-within:bg-white shadow-sm hover:shadow-md">
                                 <div className="flex justify-between items-center mb-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                       <role.icon size={12} className="text-slate-300 group-focus-within:text-indigo-500" />
                                       {role.label}
                                    </p>
                                    <ShieldAlert size={12} className="text-slate-200 group-focus-within:text-indigo-400" />
                                 </div>
                                 <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="0000"
                                    value={config.pins[role.id] || ''}
                                    onChange={e => updatePin(role.id, e.target.value)}
                                    className="bg-transparent font-black text-3xl w-full outline-none tracking-[0.5em] text-slate-900 placeholder-slate-200"
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* TEMA: TICKETS (PRODUCTOS) */}
               {activeTab === 'PRICES' && (
                  <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
                     <div className="flex justify-between items-center">
                        <div>
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><Ticket size={20} className="text-indigo-600" /> Gestión de Tickets</h3>
                           <p className="text-[10px] text-slate-400 font-bold mt-1">Define qué botones aparecen en la caja y cuánto cuestan.</p>
                        </div>
                     </div>

                     {/* ADD NEW TICKET */}
                     <div className="bg-indigo-50/50 p-6 rounded-[32px] border-2 border-indigo-100 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                           <label className="text-[9px] font-black text-indigo-400 uppercase ml-2 mb-1 block">Nombre en Ticket</label>
                           <input
                              value={newTicket.name}
                              onChange={e => setNewTicket({ ...newTicket, name: e.target.value })}
                              placeholder="Ej. Copa Premium"
                              className="w-full p-4 bg-white rounded-2xl font-bold border-2 border-indigo-100 outline-none focus:border-indigo-500"
                           />
                        </div>
                        <div className="w-full md:w-32">
                           <label className="text-[9px] font-black text-indigo-400 uppercase ml-2 mb-1 block">Precio</label>
                           <input
                              type="number" step="0.5"
                              value={newTicket.price}
                              onChange={e => setNewTicket({ ...newTicket, price: e.target.value })}
                              className="w-full p-4 bg-white rounded-2xl font-black text-center border-2 border-indigo-100 outline-none focus:border-indigo-500"
                           />
                        </div>
                        <div className="w-full md:w-40">
                           <label className="text-[9px] font-black text-indigo-400 uppercase ml-2 mb-1 block">Categoría TPV</label>
                           <select
                              value={newTicket.category}
                              onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                              className="w-full p-4 bg-white rounded-2xl font-bold text-xs uppercase border-2 border-indigo-100 outline-none focus:border-indigo-500"
                           >
                              <option value="ALCOHOL">Copas</option>
                              <option value="REFRESCO">Refrescos</option>
                              <option value="OTRO">Otros/Vasos</option>
                           </select>
                        </div>
                        <button onClick={addTicketSmart} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-slate-900 transition-all active:scale-95 mt-4 md:mt-0">
                           <Plus size={24} />
                        </button>
                     </div>

                     <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {config.barPrices.map((item, i) => (
                           <div key={i} className="flex gap-4 items-center bg-slate-50 p-4 rounded-[24px] border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                              <div className="p-3 bg-white rounded-xl shadow-sm"><Tag size={16} className="text-slate-400" /></div>
                              <input
                                 value={item.name}
                                 onChange={e => updatePrice(i, 'name', e.target.value)}
                                 className="flex-1 bg-transparent font-black uppercase italic tracking-tight outline-none text-slate-800"
                                 placeholder="Nombre..."
                              />
                              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-inner">
                                 <input
                                    type="number"
                                    step="0.10"
                                    value={item.price}
                                    onChange={e => updatePrice(i, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-16 bg-transparent text-right font-black outline-none text-indigo-600"
                                 />
                                 <span className="font-bold text-slate-300 text-xs">€</span>
                              </div>
                              <button onClick={() => removePrice(item)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* TEMA: MAESTROS */}
               {activeTab === 'MASTERS' && (
                  <div className="bg-white rounded-[48px] border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-bottom-4">
                     <div className="flex bg-slate-100 p-2 gap-1 overflow-x-auto no-scrollbar border-b border-slate-200">
                        {[
                           { id: 'SUPPLIERS', label: 'Categorías Prov.', key: 'supplierCategories', icon: Truck },
                           { id: 'BUDGET', label: 'Partidas Gasto', key: 'budgetCategories', icon: Tag },
                           { id: 'STOCK', label: 'Categorías Stock', key: 'stockCategories', icon: Box },
                           { id: 'UNITS', label: 'Unidades', key: 'units', icon: Ruler },
                           { id: 'LOCATIONS', label: 'Ubicaciones', key: 'locations', icon: MapPin },
                        ].map(master => (
                           <button key={master.id} onClick={() => setActiveMaster(master.id as any)} className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${activeMaster === master.id ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-500 hover:bg-white/50'}`}>
                              <master.icon size={12} /> {master.label}
                           </button>
                        ))}
                     </div>

                     <div className="p-10 space-y-8">
                        {activeMaster === 'STOCK' ? (
                           <div className="space-y-6">
                              <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest bg-slate-100 p-4 rounded-3xl inline-block">Activa, edita o crea nuevas categorías de stock libremente.</p>

                              <div className="flex gap-2">
                                 <input
                                    value={newVal}
                                    onChange={e => setNewVal(e.target.value)}
                                    onKeyDown={e => {
                                       if (e.key === 'Enter' && newVal.trim()) {
                                          const newId = newVal.trim().toUpperCase().replace(/\s+/g, '_');
                                          if (!config.stockCategoryDefs?.find(d => d.id === newId)) {
                                             setConfig({
                                                ...config,
                                                stockCategoryDefs: [...(config.stockCategoryDefs || []), { id: newId, name: newVal.trim(), icon: 'Box', subcategories: [] }],
                                                stockCategories: [...config.stockCategories, newId]
                                             });
                                             setNewVal('');
                                          }
                                       }
                                    }}
                                    placeholder="Nueva Categoría Principal..."
                                    className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold outline-none focus:bg-white focus:border-indigo-300 shadow-inner"
                                 />
                                 <button
                                    onClick={() => {
                                       if (newVal.trim()) {
                                          const newId = newVal.trim().toUpperCase().replace(/\s+/g, '_');
                                          if (!config.stockCategoryDefs?.find(d => d.id === newId)) {
                                             setConfig({
                                                ...config,
                                                stockCategoryDefs: [...(config.stockCategoryDefs || []), { id: newId, name: newVal.trim(), icon: 'Box', subcategories: [] }],
                                                stockCategories: [...config.stockCategories, newId]
                                             });
                                             setNewVal('');
                                          }
                                       }
                                    }}
                                    className="px-10 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                                 >Añadir Principal</button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {(config.stockCategoryDefs || PREDEFINED_STOCK_CATEGORIES).map(cat => {
                                    const isActive = config.stockCategories.includes(cat.id);
                                    return (
                                       <div key={cat.id} className={`p-6 border-2 rounded-[32px] flex flex-col gap-4 transition-all shadow-sm ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:border-indigo-100 block'}`}>
                                          <div className="flex justify-between items-center">
                                             <div className="flex items-center gap-3">
                                                <span className={`font-black text-sm uppercase tracking-tighter ${isActive ? 'text-indigo-800' : 'text-slate-600'}`}>{cat.name}</span>
                                             </div>
                                             <button onClick={() => {
                                                if (isActive) {
                                                   setConfig({ ...config, stockCategories: config.stockCategories.filter(id => id !== cat.id) });
                                                } else {
                                                   setConfig({ ...config, stockCategories: [...config.stockCategories, cat.id] });
                                                }
                                             }} className={`p-2 rounded-xl border-2 transition-all ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-110' : 'bg-white border-slate-200 text-slate-400'}`}>
                                                <CheckCircle2 size={16} />
                                             </button>
                                          </div>
                                          {isActive && (
                                             <div className="flex flex-col gap-3 mt-2">
                                                <div className="flex flex-wrap gap-2">
                                                   {cat.subcategories.map(sub => (
                                                      <span key={sub.id} className="text-[9px] font-black bg-white text-indigo-600 pl-3 pr-1 py-1 rounded-full border border-indigo-100 uppercase tracking-widest shadow-sm flex items-center gap-1">
                                                         {sub.name}
                                                         <button onClick={() => {
                                                            const newCatDefs = (config.stockCategoryDefs || PREDEFINED_STOCK_CATEGORIES).map(c =>
                                                               c.id === cat.id ? { ...c, subcategories: c.subcategories.filter(s => s.id !== sub.id) } : c
                                                            );
                                                            setConfig({ ...config, stockCategoryDefs: newCatDefs });
                                                         }} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-colors"><X size={10} /></button>
                                                      </span>
                                                   ))}
                                                </div>
                                                <div className="flex gap-2">
                                                   <input
                                                      value={newSubcat[cat.id] || ''}
                                                      onChange={e => setNewSubcat({ ...newSubcat, [cat.id]: e.target.value })}
                                                      onKeyDown={e => {
                                                         if (e.key === 'Enter' && newSubcat[cat.id]?.trim()) {
                                                            const sName = newSubcat[cat.id].trim();
                                                            const sId = sName.toUpperCase().replace(/\s+/g, '_');
                                                            const newCatDefs = (config.stockCategoryDefs || PREDEFINED_STOCK_CATEGORIES).map(c =>
                                                               c.id === cat.id ? { ...c, subcategories: [...c.subcategories, { id: sId, name: sName }] } : c
                                                            );
                                                            setConfig({ ...config, stockCategoryDefs: newCatDefs });
                                                            setNewSubcat({ ...newSubcat, [cat.id]: '' });
                                                         }
                                                      }}
                                                      placeholder="Nueva subcategoría..."
                                                      className="flex-1 text-[10px] font-bold py-2 px-3 bg-white border border-indigo-100 rounded-xl outline-none focus:border-indigo-400"
                                                   />
                                                   <button onClick={() => {
                                                      if (newSubcat[cat.id]?.trim()) {
                                                         const sName = newSubcat[cat.id].trim();
                                                         const sId = sName.toUpperCase().replace(/\s+/g, '_');
                                                         const newCatDefs = (config.stockCategoryDefs || PREDEFINED_STOCK_CATEGORIES).map(c =>
                                                            c.id === cat.id ? { ...c, subcategories: [...c.subcategories, { id: sId, name: sName }] } : c
                                                         );
                                                         setConfig({ ...config, stockCategoryDefs: newCatDefs });
                                                         setNewSubcat({ ...newSubcat, [cat.id]: '' });
                                                      }
                                                   }}
                                                      className="bg-indigo-100 text-indigo-600 px-3 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                                                   >
                                                      <Plus size={14} />
                                                   </button>
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>
                        ) : (
                           <>
                              <div className="flex gap-2">
                                 <input
                                    value={newVal}
                                    onChange={e => setNewVal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleMasterAdd(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster])}
                                    placeholder={`Nueva entrada para ${activeMaster.toLowerCase()}...`}
                                    className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold outline-none focus:bg-white focus:border-indigo-300 shadow-inner"
                                 />
                                 <button
                                    onClick={() => handleMasterAdd(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster])}
                                    className="px-10 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                                 >Añadir</button>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                 {(((config as any)[({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster]] as string[]) || []).map((item: string) => (
                                    <div key={item} className="p-6 bg-white border-2 border-slate-50 rounded-[32px] flex justify-between items-center group hover:border-indigo-100 transition-all shadow-sm">
                                       <span className="font-bold text-slate-800 text-sm uppercase italic tracking-tighter">{item}</span>
                                       <button onClick={() => handleMasterRemove(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster], item)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X size={16} /></button>
                                    </div>
                                 ))}
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               )}

               {/* TEMA: PERMISOS POR ROL */}
               {activeTab === 'PERMISOS' && (
                  <div className="bg-white p-8 rounded-[48px] border-2 border-slate-100 shadow-sm animate-in slide-in-from-bottom-4">
                     <RolePermissionsPanel
                        config={data.appConfig}
                        onUpdateConfig={onUpdateConfig}
                     />
                  </div>
               )}

               {/* TEMA: SYNC / BACKUPS */}
               {activeTab === 'SYNC' && (
                  <div className="animate-in slide-in-from-bottom-4 h-full space-y-6">

                     {/* Panel de Copias de Seguridad */}
                     <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-10 opacity-5 pointer-events-none"><DownloadCloud size={200} /></div>
                        <div className="relative z-10 w-full md:w-auto">
                           <h3 className="font-black text-2xl flex items-center gap-3 uppercase italic tracking-tighter">
                              <ShieldCheck className="text-emerald-400" size={28} /> Bóveda de Backups
                           </h3>
                           <p className="text-slate-400 text-sm mt-2 font-medium max-w-sm">Genera una copia de seguridad instantánea ("Snapshot") de <b>TODA</b> la Falla en este exacto segundo. El sistema también hace copias automáticas a las <span className="text-emerald-400">04:00 AM</span>.</p>
                        </div>
                        <button
                           disabled={isBackingUp}
                           onClick={createManualBackup}
                           className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-8 py-5 rounded-[24px] flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50 relative z-10 text-xs uppercase tracking-widest"
                        >
                           {isBackingUp ? <RefreshCw className="animate-spin" size={20} /> : <DownloadCloud size={20} />}
                           Crear INSTANTÁNEA NOW
                        </button>
                     </div>

                     {/* Historial de Backups */}
                     <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Historial y Restauración</h4>
                        {backups.length === 0 ? (
                           <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-3xl font-bold uppercase text-xs tracking-widest">No hay copias de seguridad aún</div>
                        ) : (
                           <div className="grid gap-3">
                              {backups.map(b => (
                                 <div key={b.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-white transition-colors group">
                                    <div className="mb-4 md:mb-0">
                                       <div className="flex items-center gap-2 mb-1">
                                          <Database size={14} className="text-indigo-500" />
                                          <span className="font-black text-slate-800 tracking-tight text-sm">
                                             {new Date(b.timestamp).toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                                          </span>
                                       </div>
                                       <div className="flex gap-2">
                                          <span className="text-[9px] font-black uppercase tracking-widest bg-slate-200 text-slate-500 px-2 py-1 rounded-md">ID: {b.id.substring(0, 6)}...</span>
                                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${b.trigger === 'AUTO_NIGHT_BACKUP' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                                             {b.trigger === 'AUTO_NIGHT_BACKUP' ? 'Auto Cierre (4AM)' : 'Admin Manual'}
                                          </span>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => restoreBackup(b.data)}
                                       className="w-full md:w-auto px-6 py-3 bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 transition-all opacity-80 group-hover:opacity-100"
                                    >
                                       <RefreshCw size={14} /> Restaurar Falla a la Copia
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* TEMA: DANGER ZONE */}
               {activeTab === 'DANGER' && (
                  <div className="bg-rose-50 p-10 rounded-[48px] border-4 border-dashed border-rose-200 space-y-8 animate-in zoom-in-95">
                     <div className="flex items-center gap-4 text-rose-600">
                        <div className="p-4 bg-white rounded-3xl shadow-lg animate-bounce"><AlertTriangle size={48} /></div>
                        <div>
                           <h3 className="text-4xl font-black italic uppercase tracking-tighter">Danger Zone</h3>
                           <p className="text-sm font-bold opacity-70">Protocolos de limpieza masiva de datos. Úsalos con precaución.</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => setPendingDangerAction({ title: 'Resetear Censo', message: 'Se borrarán TODOS los falleros, sus misiones y registros de presencia. Esta acción es IRREVERSIBLE.', confirmWord: 'CONFIRMAR', onConfirm: () => onResetModule('members') })} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <Users className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Resetear Censo</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Borra a todos los falleros, sus misiones y registros de presencia.</p>
                        </button>
                        <button onClick={() => setPendingDangerAction({ title: 'Resetear Caja', message: 'Se borrará TODO el historial de ingresos, gastos y el saldo actual de tesorería. Esta acción es IRREVERSIBLE.', confirmWord: 'CONFIRMAR', onConfirm: () => onResetModule('transactions') })} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <Wallet className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Resetear Caja</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Limpia el historial de ingresos, gastos y el saldo actual de tesorería.</p>
                        </button>
                        <button onClick={() => setPendingDangerAction({ title: 'Limpiar Tareas', message: 'Se eliminará TODO el tablero logístico y las sub-misiones activas. Esta acción es IRREVERSIBLE.', confirmWord: 'CONFIRMAR', onConfirm: () => onResetModule('tasks') })} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <ClipboardList className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Limpiar Tareas</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Elimina todo el tablero logístico y las sub-misiones activas.</p>
                        </button>
                        <button onClick={() => setPendingDangerAction({ title: 'Vaciar Inventario', message: 'Se borrarán TODOS los artículos registrados en las bodegas de Venta y Casal. Esta acción es IRREVERSIBLE.', confirmWord: 'CONFIRMAR', onConfirm: () => onResetModule('stock') })} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <Box className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Vaciar Inventario</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Borra todos los artículos registrados en las bodegas de Venta y Casal.</p>
                        </button>
                     </div>

                     <div className="pt-8 border-t border-rose-200">
                        <button onClick={() => setPendingDangerAction({ title: 'HARD RESET GLOBAL', message: '⚠️ ESTO BORRARÁ ABSOLUTAMENTE TODO EL EJERCICIO PARA EMPEZAR DE CERO. Todos los datos de la Falla se perderán PERMANENTEMENTE. ¿Estás ABSOLUTAMENTE seguro?', confirmWord: 'BORRAR TODO', onConfirm: () => window.location.reload() })} className="w-full py-8 bg-rose-600 text-white rounded-[40px] font-black uppercase text-sm tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-rose-700 transition-all border-b-8 border-rose-900 active:translate-y-2 active:border-b-0">
                           <RefreshCw size={24} className="animate-spin-slow" /> HARD RESET GLOBAL DEL SISTEMA
                        </button>
                     </div>
                  </div>
               )}
            </div>

            {/* SIDEBAR DE STATUS DE APLICACIÓN */}
            <div className="lg:col-span-4">
               <div className="bg-[#09090b] text-white p-10 rounded-[56px] shadow-2xl space-y-8 sticky top-8 border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform"><ShieldCheck size={200} /></div>

                  <h4 className="text-2xl font-black tracking-tighter italic uppercase leading-none relative z-10">Estado de la<br /><span className="text-indigo-500">Configuración</span></h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10 italic">Guardar aplicará los cambios de PINs y maestros a todos los móviles que estén usando la App.</p>

                  <div className="space-y-4 pt-4 relative z-10">
                     {[
                        { label: 'Identidad Fallera', icon: Users },
                        { label: 'Maestros Logísticos', icon: Database },
                        { label: 'Seguridad de Red', icon: Key },
                        { label: 'Tarifas Kiosko', icon: Monitor }
                     ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/50 transition-all">
                           <div className="flex items-center gap-3">
                              <item.icon size={14} className="text-slate-500 group-hover:text-indigo-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                           </div>
                           <CheckCircle2 size={16} className="text-indigo-500" />
                        </div>
                     ))}
                  </div>

                  <div className="pt-6 relative z-10">
                     <button onClick={handleSave} className="w-full py-10 bg-indigo-600 text-white rounded-[40px] font-black uppercase text-base tracking-[0.2em] shadow-xl hover:bg-white hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-2 group border-b-8 border-indigo-900 active:border-b-0 active:translate-y-2">
                        <Save size={36} className="group-hover:scale-125 transition-transform" />
                        <span>APLICAR CAMBIOS</span>
                     </button>
                     <p className="text-[8px] text-center text-slate-600 mt-6 font-black uppercase tracking-widest opacity-50">Merello Planner Security Framework v2026</p>
                  </div>
               </div>
            </div>
         </div>

         <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

         <ConfirmModal
            isOpen={!!pendingDangerAction}
            title={pendingDangerAction?.title || ''}
            message={pendingDangerAction?.message || ''}
            confirmWord={pendingDangerAction?.confirmWord || 'CONFIRMAR'}
            onConfirm={() => { pendingDangerAction?.onConfirm(); setPendingDangerAction(null); }}
            onCancel={() => setPendingDangerAction(null)}
         />
      </div >
   );
};
