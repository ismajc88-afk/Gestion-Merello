
import React, { useState } from 'react';
import { AppData, AppConfig, UserRole, BarPrice, KioskConfig, CustomPermission } from '../types';
import {
   Settings, ShieldAlert, Key, Trash2,
   Save, AlertTriangle, CheckCircle2, RefreshCw,
   Lock, Database,
   Users, Wallet, Truck, Beer, Plus, Tag,
   X, ShieldCheck, Box, Ruler, MapPin,
   ClipboardList, Wifi, Monitor, UploadCloud, Ticket, Home, Calculator,
   UserCog
} from 'lucide-react';
import { SyncModules } from './SyncModules';
import { getAllModules, getRoleLabel, ROLE_PERMISSIONS } from '../utils/permissions';

interface Props {
   data: AppData;
   onUpdateConfig: (config: AppConfig) => void;
   onUpdateData: (updates: Partial<AppData>) => void; // NEW: For updating customPermissions
   onResetModule: (key: string) => void;
   onFullImport?: (newData: AppData) => void;
   peerCount?: number;
   kioskConfig?: KioskConfig;
   onUpdateKioskConfig?: (config: KioskConfig) => void;
}

export const AdminControlPanel: React.FC<Props> = ({ data, onUpdateConfig, onUpdateData, onResetModule, onFullImport, peerCount = 0, kioskConfig, onUpdateKioskConfig }) => {
   const [config, setConfig] = useState<AppConfig>(data.appConfig);
   const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PRICES' | 'MASTERS' | 'PERMISSIONS' | 'SYNC' | 'DANGER'>('IDENTITY');
   const [newVal, setNewVal] = useState('');
   const [activeMaster, setActiveMaster] = useState<'SUPPLIERS' | 'BUDGET' | 'STOCK' | 'UNITS' | 'LOCATIONS'>('SUPPLIERS');
   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

   // New Ticket Form State
   const [newTicket, setNewTicket] = useState({ name: '', price: '1.00', category: 'ALCOHOL' });

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
      const oldName = config.barPrices[index].name;
      const newPrices = [...config.barPrices];
      newPrices[index] = { ...newPrices[index], [field]: value };
      setConfig({ ...config, barPrices: newPrices });

      // FIX: Propagate name changes to KioskConfig to avoid breaking links
      if (field === 'name' && kioskConfig && onUpdateKioskConfig) {
         const newKiosk = { ...kioskConfig };
         const replaceIn = (arr: string[]) => arr.map(n => n === oldName ? value : n);

         newKiosk.alcoholItems = replaceIn(newKiosk.alcoholItems);
         newKiosk.mixerItems = replaceIn(newKiosk.mixerItems);
         newKiosk.cupItems = replaceIn(newKiosk.cupItems);

         onUpdateKioskConfig(newKiosk);
      }
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

   const getKioskCategory = (itemName: string) => {
      if (!kioskConfig) return 'NONE';
      if (kioskConfig.alcoholItems.includes(itemName)) return 'ALCOHOL';
      if (kioskConfig.mixerItems.includes(itemName)) return 'REFRESCO';
      if (kioskConfig.cupItems.includes(itemName)) return 'OTRO';
      return 'NONE';
   };

   const updateKioskCategory = (itemName: string, newCategory: string) => {
      if (!kioskConfig || !onUpdateKioskConfig) return;
      const newKiosk = { ...kioskConfig };
      newKiosk.alcoholItems = newKiosk.alcoholItems.filter(n => n !== itemName);
      newKiosk.mixerItems = newKiosk.mixerItems.filter(n => n !== itemName);
      newKiosk.cupItems = newKiosk.cupItems.filter(n => n !== itemName);

      if (newCategory === 'ALCOHOL') newKiosk.alcoholItems.push(itemName);
      else if (newCategory === 'REFRESCO') newKiosk.mixerItems.push(itemName);
      else if (newCategory === 'OTRO') newKiosk.cupItems.push(itemName);

      onUpdateKioskConfig(newKiosk);
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
               { id: 'PERMISSIONS', label: 'Permisos de Usuario', icon: UserCog },
               { id: 'SYNC', label: 'Nube / Backup', icon: UploadCloud },
               { id: 'DANGER', label: 'Danger Zone', icon: AlertTriangle }
            ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <tab.icon size={16} /> {tab.label}
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-8">

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

                              {/* KIOSK CATEGORY SELECTOR */}
                              <select
                                 value={getKioskCategory(item.name)}
                                 onChange={e => updateKioskCategory(item.name, e.target.value)}
                                 className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2 text-[10px] font-black uppercase outline-none focus:border-indigo-500 w-24 md:w-32"
                              >
                                 <option value="NONE">🚫 Oculto</option>
                                 <option value="ALCOHOL">🍷 Copas</option>
                                 <option value="REFRESCO">🥤 Refrescos</option>
                                 <option value="OTRO">🥣 Vasos</option>
                              </select>
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
                        <div className="flex gap-2">
                           <input
                              value={newVal}
                              onChange={e => setNewVal(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleMasterAdd(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' }[activeMaster] as any))}
                              placeholder={`Nueva entrada para ${activeMaster.toLowerCase()}...`}
                              className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold outline-none focus:bg-white focus:border-indigo-300 shadow-inner"
                           />
                           <button
                              onClick={() => handleMasterAdd(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' }[activeMaster] as any))}
                              className="px-10 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                           >Añadir</button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {(config[{ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' }[activeMaster] as keyof AppConfig] as string[]).map(item => (
                              <div key={item} className="p-6 bg-white border-2 border-slate-50 rounded-[32px] flex justify-between items-center group hover:border-indigo-100 transition-all shadow-sm">
                                 <span className="font-bold text-slate-800 text-sm uppercase italic tracking-tighter">{item}</span>
                                 <button onClick={() => handleMasterRemove(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' }[activeMaster] as any), item)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X size={16} /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* TEMA: PERMISOS CUSTOM POR USUARIO */}
               {activeTab === 'PERMISSIONS' && (() => {
                  const customPerms: CustomPermission[] = data.customPermissions || [];
                  const allModules = getAllModules();

                  const handleTogglePermission = (userId: string, moduleId: string) => {
                     const userPerms = customPerms.find(p => p.userId === userId);
                     let newCustomPerms: CustomPermission[];

                     if (!userPerms) {
                        // Create new permission entry
                        newCustomPerms = [...customPerms, { userId, extraModules: [moduleId] }];
                     } else {
                        const hasPermission = userPerms.extraModules.includes(moduleId);
                        if (hasPermission) {
                           // Remove permission
                           const newExtraModules = userPerms.extraModules.filter(m => m !== moduleId);
                           if (newExtraModules.length === 0) {
                              // Remove user entry if no more custom perms
                              newCustomPerms = customPerms.filter(p => p.userId !== userId);
                           } else {
                              newCustomPerms = customPerms.map(p =>
                                 p.userId === userId ? { ...p, extraModules: newExtraModules } : p
                              );
                           }
                        } else {
                           // Add permission
                           newCustomPerms = customPerms.map(p =>
                              p.userId === userId ? { ...p, extraModules: [...p.extraModules, moduleId] } : p
                           );
                        }
                     }

                     onUpdateData({ customPermissions: newCustomPerms });
                  };

                  const getUserPermissions = (userId: string, userRole: string) => {
                     const basePerms = ROLE_PERMISSIONS[userRole as UserRole] || [];
                     const customPerm = customPerms.find(p => p.userId === userId);
                     return {
                        base: basePerms.includes('*') ? allModules.map(m => m.id) : basePerms,
                        custom: customPerm?.extraModules || []
                     };
                  };

                  return (
                     <div className="space-y-8 animate-in slide-in-from-bottom-4">
                        <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-8">
                           <div className="flex justify-between items-center">
                              <div>
                                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                    <UserCog size={20} className="text-indigo-600" /> Gestión de Permisos Personalizados
                                 </h3>
                                 <p className="text-xs text-slate-500 mt-2">Otorga acceso a módulos específicos más allá de los permisos del rol base</p>
                              </div>
                           </div>

                           {data.members.length === 0 ? (
                              <div className="text-center py-12 bg-slate-50 rounded-3xl">
                                 <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                 <p className="text-slate-400 font-bold">No hay miembros registrados</p>
                                 <p className="text-xs text-slate-300 mt-2">Añade miembros primero en el módulo de Censo</p>
                              </div>
                           ) : (
                              <div className="space-y-4">
                                 {data.members.slice(0, 20).map(member => {
                                    const permissions = getUserPermissions(member.id, member.role);
                                    const customCount = permissions.custom.length;

                                    return (
                                       <div key={member.id} className="border-2 border-slate-100 rounded-3xl p-6 space-y-4 hover:border-indigo-100 transition-all">
                                          {/* Member Header */}
                                          <div className="flex items-start justify-between">
                                             <div className="flex-1">
                                                <h4 className="font-black text-lg text-slate-800">{member.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                   <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                                      {getRoleLabel(member.role as UserRole)}
                                                   </span>
                                                   {customCount > 0 && (
                                                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                         +{customCount} permisos custom
                                                      </span>
                                                   )}
                                                </div>
                                             </div>
                                             <button
                                                onClick={() => setSelectedUserId(selectedUserId === member.id ? null : member.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all"
                                             >
                                                {selectedUserId === member.id ? 'Cerrar' : 'Gestionar'}
                                             </button>
                                          </div>

                                          {/* Module Grid (Expanded) */}
                                          {selectedUserId === member.id && (
                                             <div className="pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2">
                                                {['economy', 'supply', 'ops', 'tools'].map(category => {
                                                   const categoryModules = allModules.filter(m => m.category === category);
                                                   if (categoryModules.length === 0) return null;

                                                   return (
                                                      <div key={category} className="space-y-2">
                                                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {category === 'economy' ? '💰 Economía' : category === 'supply' ? '📦 Logística' : category === 'ops' ? '⚙️ Operativa' : '🛠️ Utilidades'}
                                                         </h5>
                                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                            {categoryModules.map(module => {
                                                               const hasBase = permissions.base.includes('*') || permissions.base.includes(module.id);
                                                               const hasCustom = permissions.custom.includes(module.id);

                                                               return (
                                                                  <button
                                                                     key={module.id}
                                                                     onClick={() => !hasBase && handleTogglePermission(member.id, module.id)}
                                                                     disabled={hasBase}
                                                                     className={`p-3 rounded-xl text-left text-xs font-bold transition-all ${hasBase
                                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                        : hasCustom
                                                                           ? 'bg-emerald-500 text-white shadow-lg border-2 border-emerald-600'
                                                                           : 'bg-white border-2 border-slate-200 text-slate-700hover:border-indigo-400 hover:bg-indigo-50'
                                                                        }`}
                                                                  >
                                                                     <div className="flex items-center justify-between">
                                                                        <span>{module.label}</span>
                                                                        {hasBase && <span className="text-[9px] opacity-60">BASE</span>}
                                                                        {hasCustom && <CheckCircle2 size={14} />}
                                                                     </div>
                                                                  </button>
                                                               );
                                                            })}
                                                         </div>
                                                      </div>
                                                   );
                                                })}
                                             </div>
                                          )}
                                       </div>
                                    );
                                 })}
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })()}

               {/* TEMA: SYNC / NUBE MANUAL */}
               {activeTab === 'SYNC' && (
                  <div className="animate-in slide-in-from-bottom-4 h-full">
                     {onFullImport ? (
                        <SyncModules data={data} onImport={onFullImport} />
                     ) : (
                        <div className="p-10 text-center bg-slate-50 rounded-[40px]">Error: Módulo de sincronización no disponible.</div>
                     )}
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
                        <button onClick={() => confirm('¿Purgar censo completo?') && onResetModule('members')} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <Users className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Resetear Censo</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Borra a todos los falleros, sus misiones y registros de presencia.</p>
                        </button>
                        <button onClick={() => confirm('¿Borrar toda la contabilidad?') && onResetModule('transactions')} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <Wallet className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Resetear Caja</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Limpia el historial de ingresos, gastos y el saldo actual de tesorería.</p>
                        </button>
                        <button onClick={() => confirm('¿Limpiar tablero de tareas?') && onResetModule('tasks')} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <ClipboardList className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Limpiar Tareas</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Elimina todo el tablero logístico y las sub-misiones activas.</p>
                        </button>
                        <button onClick={() => confirm('¿Purgar almacenes e inventario?') && onResetModule('stock')} className="p-8 bg-white border-2 border-rose-100 rounded-[40px] text-left hover:border-rose-500 group transition-all shadow-sm hover:shadow-xl">
                           <Box className="text-rose-400 group-hover:text-rose-600 mb-4" size={32} />
                           <h4 className="font-black uppercase text-xs tracking-widest text-slate-800">Vaciar Inventario</h4>
                           <p className="text-[10px] text-slate-400 font-medium mt-2 italic leading-relaxed">Borra todos los artículos registrados en las bodegas de Venta y Casal.</p>
                        </button>
                     </div>

                     <div className="pt-8 border-t border-rose-200">
                        <button onClick={() => confirm('⚠️⚠️⚠️ ESTO BORRARÁ TODO EL EJERCICIO PARA EMPEZAR DE CERO. ¿ESTÁS SEGURO?') && window.location.reload()} className="w-full py-8 bg-rose-600 text-white rounded-[40px] font-black uppercase text-sm tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-rose-700 transition-all border-b-8 border-rose-900 active:translate-y-2 active:border-b-0">
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
      </div>
   );
};
