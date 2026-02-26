
import React, { useState, useMemo } from 'react';
import { Beer, Thermometer, ChefHat, GlassWater, Wine, Plus, ShoppingCart, Minus, AlertCircle, CheckCircle, Package, Scale, Users, Target, Zap, ShieldAlert, Settings, Trash2, Activity, Smartphone, Save, Radio, Download, Copy, Check, BellRing } from 'lucide-react';
import { ShoppingItem, AppData, TransactionType, KioskConfig, AppConfig } from '../types';
import { useToast } from '../hooks/useToast';

interface Props {
   onAddShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
   appData: AppData;
   onUpdateKioskConfig: (config: KioskConfig) => void;
   onUpdateAppConfig?: (config: AppConfig) => void; // New prop for updating app config
}

export const ToolsManager: React.FC<Props> = ({ onAddShoppingItem, appData, onUpdateKioskConfig, onUpdateAppConfig }) => {
   // Default to HAPTIC to make it immediately visible as requested
   const [activeTool, setActiveTool] = useState<'ESCANDALLO' | 'MARGEN_REAL' | 'BOTELLOMETRO' | 'HIELOLOGO' | 'CHEF' | 'KIOSK_CONFIG' | 'HAPTIC'>('HAPTIC');

   return (
      <div className="flex flex-col h-full gap-6">
         {/* Top Nav */}
         <div className="flex bg-white rounded-xl p-2 shadow-sm border border-slate-200 overflow-x-auto no-scrollbar">
            {[
               { id: 'HAPTIC', label: 'Sismógrafo (Alertas)', icon: Activity },
               { id: 'MARGEN_REAL', label: 'Margen Real', icon: Scale },
               { id: 'ESCANDALLO', label: 'Escandallo Pro', icon: GlassWater },
               { id: 'BOTELLOMETRO', label: 'Botellómetro', icon: Wine },
               { id: 'HIELOLOGO', label: 'Hielólogo', icon: Thermometer },
               { id: 'CHEF', label: 'Chef Fallero', icon: ChefHat },
               { id: 'KIOSK_CONFIG', label: 'Config Barra', icon: Settings },
            ].map(tool => (
               <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTool === tool.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  <tool.icon size={18} /> {tool.label}
               </button>
            ))}
         </div>

         <div className="flex-1 bg-slate-50/50 rounded-xl shadow-inner border border-slate-200 overflow-y-auto">
            {activeTool === 'MARGEN_REAL' && <RealMarginTool data={appData} />}
            {activeTool === 'ESCANDALLO' && <EscandalloTool />}
            {activeTool === 'BOTELLOMETRO' && <BotellometerTool onAdd={onAddShoppingItem} />}
            {activeTool === 'HIELOLOGO' && <HielologoTool />}
            {activeTool === 'CHEF' && <ChefFalleroTool onAdd={onAddShoppingItem} />}
            {activeTool === 'HAPTIC' && onUpdateAppConfig && <HapticTuner config={appData.appConfig} onUpdate={onUpdateAppConfig} />}
            {activeTool === 'KIOSK_CONFIG' && <KioskConfigTool config={appData.kioskConfig} onUpdate={onUpdateKioskConfig} />}
         </div>
      </div>
   );
};

// --- HAPTIC TUNER COMPONENT ---

const HapticTuner: React.FC<{ config: AppConfig, onUpdate: (c: AppConfig) => void }> = ({ config, onUpdate }) => {
   const toast = useToast();
   const [testing, setTesting] = useState(false);
   const [remoteTesting, setRemoteTesting] = useState(false);
   const [selectedPattern, setSelectedPattern] = useState<number[]>(config.hapticPattern || [200, 100, 200]);
   const [customTopic, setCustomTopic] = useState(config.ntfyTopic || "merello-planner-2026-global-alerts");
   const [showInstallGuide, setShowInstallGuide] = useState(true);
   const [copySuccess, setCopySuccess] = useState<'URL' | 'NAME' | null>(null);
   const [showNtfySettings, setShowNtfySettings] = useState(false);

   const NTFY_TOPIC = customTopic.trim() || "merello-planner-2026-global-alerts";
   const NTFY_DEEP_LINK = `ntfy://ntfy.sh/${NTFY_TOPIC}`;

   const patterns = [
      { name: 'Estándar (Pulso)', value: [200] },
      { name: 'Alerta (Doble)', value: [200, 100, 200] },
      { name: 'Emergencia (Sirena)', value: [500, 100, 500, 100, 500] },
      { name: 'Mascletà (Ritmo)', value: [50, 50, 50, 50, 100, 50, 100, 50, 500] },
      { name: 'Largo (1 seg)', value: [1000] },
      { name: 'Muy Largo (2 seg)', value: [2000] },
      { name: 'Extremo (3 seg)', value: [3000] },
      { name: 'Insistente (Bucle 5s)', value: [500, 200, 500, 200, 500, 200, 1000, 200, 1000] },
   ];

   const testVibration = (pattern: number[]) => {
      if (!navigator.vibrate) {
         toast.warning('Tu dispositivo no soporta vibración web');
         return;
      }
      setTesting(true);
      navigator.vibrate(pattern);
      setTimeout(() => setTesting(false), pattern.reduce((a, b) => a + b, 0));
   };

   const testRemoteVibration = async () => {
      setRemoteTesting(true);
      try {
         const url = new URL(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`);
         url.searchParams.append('title', 'PRUEBA SISMÓGRAFO');
         url.searchParams.append('priority', '5');
         url.searchParams.append('tags', 'rotating_light,vibration');

         await fetch(url.toString(), {
            method: 'POST',
            body: "Test de vibración en App Nativa (Prioridad Max)"
         });
         toast.success(`Señal enviada al canal: ${NTFY_TOPIC}`);
      } catch (e) {
         toast.error('Error al contactar con el puente externo');
      } finally {
         setRemoteTesting(false);
      }
   };

   const handleSave = () => {
      onUpdate({
         ...config,
         hapticPattern: selectedPattern,
         ntfyTopic: customTopic.trim()
      });
      toast.success('Configuración guardada (Canal y Patrón)');
   };

   const copyText = (text: string, type: 'URL' | 'NAME') => {
      navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
   };

   return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
         <div className="mb-8 text-center">
            <div className={`w-20 h-20 md:w-24 md:h-24 bg-indigo-600 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center shadow-2xl transition-transform duration-75 ${testing ? 'translate-x-1 translate-y-1' : ''}`}>
               <Activity size={40} className={`text-white md:w-12 md:h-12 ${testing ? 'animate-pulse' : ''}`} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic">
               Sismógrafo Fallero
            </h2>
            <p className="text-slate-500 font-medium mt-2 max-w-lg mx-auto text-sm md:text-base">
               Sistema de alerta sísmica para recibir avisos de la barra incluso con el móvil bloqueado.
            </p>
         </div>

         {/* GUÍA DE INSTALACIÓN EXPANDIDA */}
         <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-indigo-100 text-left mb-8 shadow-md">
            <div className="flex justify-between items-center mb-6 border-b border-indigo-50 pb-4">
               <h4 className="text-lg font-black text-indigo-900 uppercase flex items-center gap-2"><Smartphone size={24} /> Vinculación App N2FI</h4>
               <button onClick={() => setShowInstallGuide(!showInstallGuide)} className="text-xs font-bold text-indigo-500 uppercase">
                  {showInstallGuide ? 'Ocultar' : 'Mostrar Ayuda'}
               </button>
            </div>

            {showInstallGuide && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">

                  {/* STEP 1: DOWNLOAD */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shrink-0">1</span>
                        <p className="text-sm font-bold text-slate-700">Instala la App Receptora</p>
                     </div>
                     <p className="text-xs text-slate-500 ml-11 mb-2">Necesitas esta app gratuita para recibir las vibraciones en segundo plano.</p>
                     <div className="flex gap-2 pl-11">
                        <a href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-2 transition-colors border border-slate-200"><Download size={16} /> Android</a>
                        <a href="https://apps.apple.com/us/app/ntfy/id1625396347" target="_blank" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-2 transition-colors border border-slate-200"><Download size={16} /> iOS</a>
                     </div>
                  </div>

                  {/* STEP 2: CONNECT TOPIC */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">2</span>
                        <p className="text-sm font-bold text-slate-700">Suscríbete al Canal</p>
                     </div>

                     <div className="pl-11 space-y-4">
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                           <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2">CÓDIGO DE CANAL (TOPIC)</label>

                           <div className="flex items-center gap-2 mb-3">
                              <input
                                 type="text"
                                 value={customTopic}
                                 onChange={(e) => setCustomTopic(e.target.value)}
                                 className="w-full p-3 bg-white border border-indigo-100 rounded-xl font-mono text-sm font-bold text-indigo-900 outline-none focus:border-indigo-500 transition-all text-center"
                              />
                              <button onClick={() => copyText(NTFY_TOPIC, 'NAME')} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                                 {copySuccess === 'NAME' ? <Check size={18} /> : <Copy size={18} />}
                              </button>
                           </div>

                           <a href={NTFY_DEEP_LINK} className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                              <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                              <span className="font-black uppercase text-[10px] tracking-widest">Conexión Automática</span>
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 mb-8">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowNtfySettings(!showNtfySettings)}>
               <h4 className="font-black text-indigo-900 uppercase text-xs md:text-sm tracking-widest flex items-center gap-2">
                  <BellRing size={20} className="text-indigo-600" /> ¿No vibra tu móvil?
               </h4>
               <button className="text-indigo-600 font-bold text-[10px] uppercase bg-white px-3 py-1 rounded-full shadow-sm">{showNtfySettings ? 'Ocultar' : 'Solucionar'}</button>
            </div>

            {showNtfySettings && (
               <div className="mt-4 pt-4 border-t border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">En la App Ntfy</p>
                     <ul className="text-xs text-indigo-900 font-medium space-y-1 ml-4 list-disc marker:text-indigo-400">
                        <li>Entra al tema <strong>{customTopic}</strong>.</li>
                        <li>Pulsa los 3 puntos (Menú) {'>'} Ajustes de Notificación.</li>
                        <li>Asegúrate de que <strong>Min Priority</strong> está en "Default" o "Low".</li>
                     </ul>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">En tu Móvil (Ajustes Sistema)</p>
                     <ul className="text-xs text-indigo-900 font-medium space-y-1 ml-4 list-disc marker:text-indigo-400">
                        <li>Ve a Ajustes {'>'} Aplicaciones {'>'} Ntfy.</li>
                        <li>Entra en <strong>Notificaciones</strong>.</li>
                        <li>Activa "Permitir Sonido y Vibración".</li>
                        <li>Revisa que el canal "Default" tenga la vibración ON.</li>
                     </ul>
                  </div>
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            {patterns.map((pat, idx) => (
               <button
                  key={idx}
                  onClick={() => { setSelectedPattern(pat.value); testVibration(pat.value); }}
                  className={`p-4 md:p-6 rounded-3xl border-2 transition-all flex items-center justify-between group active:scale-95 ${JSON.stringify(selectedPattern) === JSON.stringify(pat.value) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
               >
                  <div className="flex flex-col text-left">
                     <span className="font-black text-xs md:text-sm uppercase tracking-widest">{pat.name}</span>
                     <span className="text-[9px] opacity-60 font-medium">Patrón Web Local</span>
                  </div>
                  <div className="flex gap-1">
                     {pat.value.map((v, i) => (
                        <div key={i} className={`h-2 rounded-full ${JSON.stringify(selectedPattern) === JSON.stringify(pat.value) ? 'bg-white' : 'bg-slate-300'}`} style={{ width: Math.min(v / 10, 40) + 'px' }}></div>
                     ))}
                  </div>
               </button>
            ))}
         </div>

         <div className="bg-slate-100 p-6 md:p-8 rounded-[40px] text-center space-y-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Zona de Pruebas</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button
                  onClick={() => testVibration(selectedPattern)}
                  className={`w-full h-24 md:h-32 rounded-3xl font-black text-base md:text-lg uppercase tracking-widest shadow-lg transition-all active:scale-90 flex flex-col items-center justify-center gap-2 ${testing ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-slate-900 hover:bg-slate-50'}`}
               >
                  <Smartphone size={24} className={testing ? 'animate-bounce' : ''} />
                  <span>Vibración Web</span>
                  <span className="text-[9px] md:text-[10px] opacity-60 font-medium normal-case">Test local (sin internet)</span>
               </button>

               <button
                  onClick={testRemoteVibration}
                  disabled={remoteTesting}
                  className={`w-full h-24 md:h-32 rounded-3xl font-black text-base md:text-lg uppercase tracking-widest shadow-lg transition-all active:scale-90 flex flex-col items-center justify-center gap-2 ${remoteTesting ? 'bg-indigo-400 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
               >
                  <Radio size={24} className={remoteTesting ? 'animate-ping' : ''} />
                  <span>{remoteTesting ? 'ENVIANDO...' : 'Vibración App Ntfy'}</span>
                  <span className="text-[9px] md:text-[10px] opacity-60 font-medium normal-case">Test real a través de la nube</span>
               </button>
            </div>

            <div className="pt-4 border-t border-slate-200">
               <button onClick={handleSave} className="bg-slate-900 text-white px-8 md:px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2 mx-auto">
                  <Save size={18} /> Guardar Configuración
               </button>
            </div>
         </div>
      </div>
   );
};

// --- KIOSK CONFIG TOOL ---

const KioskConfigTool: React.FC<{ config: KioskConfig, onUpdate: (c: KioskConfig) => void }> = ({ config, onUpdate }) => {
   const [newItemName, setNewItemName] = useState('');
   const [activeCategory, setActiveCategory] = useState<'alcoholItems' | 'mixerItems' | 'cupItems'>('alcoholItems');

   const addItem = () => {
      if (!newItemName.trim()) return;
      const updated = { ...config, [activeCategory]: [...config[activeCategory], newItemName.trim()] };
      onUpdate(updated);
      setNewItemName('');
   };

   const removeItem = (index: number) => {
      const updatedList = [...config[activeCategory]];
      updatedList.splice(index, 1);
      onUpdate({ ...config, [activeCategory]: updatedList });
   };

   return (
      <div className="p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
         <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Settings size={32} className="text-indigo-600" /> Personalizar Barra
            </h2>
            <p className="text-slate-500 font-medium">Gestiona los productos que aparecen en el Modo Kiosko de logística.</p>
         </div>

         <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex bg-slate-100 p-2 gap-1">
               {[
                  { id: 'alcoholItems', label: 'Alcohol', icon: Wine },
                  { id: 'mixerItems', label: 'Refrescos', icon: GlassWater },
                  { id: 'cupItems', label: 'Vasos', icon: Package },
               ].map(cat => (
                  <button
                     key={cat.id}
                     onClick={() => setActiveCategory(cat.id as any)}
                     className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                  >
                     <cat.icon size={16} /> {cat.label}
                  </button>
               ))}
            </div>

            <div className="p-8 space-y-6">
               <div className="flex gap-2">
                  <input
                     value={newItemName}
                     onChange={e => setNewItemName(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && addItem()}
                     placeholder={`Añadir nuevo ${activeCategory === 'alcoholItems' ? 'alcohol' : activeCategory === 'mixerItems' ? 'refresco' : 'vaso'}...`}
                     className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                  />
                  <button onClick={addItem} className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2">
                     <Plus size={18} /> Añadir
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {config[activeCategory].map((item, index) => (
                     <div key={index} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all shadow-sm">
                        <span className="font-bold text-slate-800">{item}</span>
                        <button onClick={() => removeItem(index)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  ))}
               </div>

               {config[activeCategory].length === 0 && (
                  <div className="py-20 text-center opacity-20">
                     <AlertCircle size={48} className="mx-auto mb-4" />
                     <p className="font-black uppercase tracking-widest text-xs">Sin elementos configurados</p>
                  </div>
               )}
            </div>
         </div>

         <div className="mt-8 bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex items-start gap-4">
            <Zap className="text-indigo-600 shrink-0" size={24} />
            <div>
               <p className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">Dato de interés</p>
               <p className="text-xs text-indigo-700 leading-relaxed font-medium">Los cambios que realices aquí se propagarán instantáneamente a todos los dispositivos sincronizados que estén usando el Modo Kiosko en este momento.</p>
            </div>
         </div>
      </div>
   );
};

// --- REST OF THE COMPONENTS (Unchanged) ---

const RealMarginTool: React.FC<{ data: AppData }> = ({ data }) => {
   const [ticketPrice, setTicketPrice] = useState(8);
   const [ticketsSold, setTicketsSold] = useState(data.members.length);
   const [selectedCategory, setSelectedCategory] = useState('Comida (Cenas)');
   const [stressMode, setStressMode] = useState(false);

   // Deep Financial Logic
   const actualSpent = useMemo(() =>
      data.transactions
         .filter(t => t.type === TransactionType.EXPENSE && t.category === selectedCategory)
         .reduce((acc, t) => acc + t.amount, 0),
      [data.transactions, selectedCategory]);

   const budgetGoal = data.budgetLines.find(l => l.category === selectedCategory)?.estimated || 1;

   // Stress simulation: -20% attendance
   const effectiveTickets = stressMode ? Math.floor(ticketsSold * 0.8) : ticketsSold;

   const totalRevenue = effectiveTickets * ticketPrice;
   const netProfit = totalRevenue - actualSpent;
   const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : -100;
   const costPerTicket = effectiveTickets > 0 ? actualSpent / effectiveTickets : actualSpent;
   const breakEvenTickets = ticketPrice > 0 ? Math.ceil(actualSpent / ticketPrice) : 0;
   const isLosingMoney = netProfit < 0;

   return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

         {/* Header Info */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Análisis de Rentabilidad Real
               </h2>
               <p className="text-slate-500 font-medium">Cruzando datos de Tesorería con proyecciones de venta.</p>
            </div>
            <button
               onClick={() => setStressMode(!stressMode)}
               className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${stressMode ? 'bg-rose-600 border-rose-600 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-500'}`}
            >
               <ShieldAlert size={16} /> {stressMode ? 'Modo Stress Activo (-20% Pax)' : 'Simular Stress Test'}
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT: INPUTS & BREAK-EVEN (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
               <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Zap size={14} className="text-indigo-500" /> Configuración del Evento
                  </h3>

                  <div className="space-y-5">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Partida de Gasto Vinculada</label>
                        <select
                           value={selectedCategory}
                           onChange={(e) => setSelectedCategory(e.target.value)}
                           className="w-full bg-transparent font-bold text-slate-800 outline-none text-lg cursor-pointer"
                        >
                           {data.budgetLines.map(l => (
                              <option key={l.category} value={l.category}>{l.category}</option>
                           ))}
                        </select>
                        <div className="mt-2 flex justify-between text-[10px] font-bold">
                           <span className="text-slate-400">Gasto en Caja: <span className="text-indigo-600">{actualSpent.toLocaleString()}€</span></span>
                           <span className="text-slate-400">Presupuesto: <span className="text-slate-600">{budgetGoal.toLocaleString()}€</span></span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">PVP Ticket</label>
                           <div className="flex items-center gap-3">
                              <span className="text-2xl font-black text-slate-900">{ticketPrice}€</span>
                              <div className="flex flex-col gap-1">
                                 <button onClick={() => setTicketPrice(p => p + 1)} className="p-1 hover:bg-white rounded"><Plus size={12} /></button>
                                 <button onClick={() => setTicketPrice(p => Math.max(0, p - 1))} className="p-1 hover:bg-white rounded"><Minus size={12} /></button>
                              </div>
                           </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Afluencia Estimada</label>
                           <div className="flex items-center gap-3">
                              <span className="text-2xl font-black text-slate-900">{ticketsSold}</span>
                              <Users size={16} className="text-slate-400" />
                           </div>
                        </div>
                     </div>

                     <div className="pt-2">
                        <input
                           type="range" min="10" max="400"
                           value={ticketsSold}
                           onChange={(e) => setTicketsSold(parseInt(e.target.value))}
                           className="w-full accent-slate-900"
                        />
                     </div>
                  </div>
               </div>

               {/* Break-Even Intelligence Widget */}
               <div className={`p-8 rounded-[32px] border-2 transition-all ${isLosingMoney ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-3 rounded-2xl ${isLosingMoney ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        <Target size={24} />
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Punto de Equilibrio</p>
                        <p className="text-3xl font-black text-slate-900">{breakEvenTickets} tickets</p>
                     </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                     Necesitas vender <span className="font-bold text-slate-900">{breakEvenTickets}</span> tickets a <span className="font-bold text-slate-900">{ticketPrice}€</span> para cubrir el gasto actual de <span className="font-bold text-slate-900">{actualSpent.toLocaleString()}€</span>.
                  </p>
                  <div className="mt-6 flex items-center gap-2">
                     {effectiveTickets >= breakEvenTickets ? (
                        <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase bg-emerald-100 px-3 py-1 rounded-full">
                           <CheckCircle size={14} /> Objetivo Superado (+{effectiveTickets - breakEvenTickets})
                        </span>
                     ) : (
                        <span className="flex items-center gap-1.5 text-xs font-black text-rose-600 uppercase bg-rose-100 px-3 py-1 rounded-full animate-pulse">
                           <AlertCircle size={14} /> Faltan {breakEvenTickets - effectiveTickets} para no perder
                        </span>
                     )}
                  </div>
               </div>
            </div>

            {/* RIGHT: MARGIN & METRICS (7 cols) */}
            <div className="lg:col-span-7 space-y-6">

               {/* BIG GAUGE AREA */}
               <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-16 -top-16 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Scale size={240} className="rotate-12" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                     <div className="w-48 h-48 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                           <circle
                              cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                              strokeDasharray={502.6}
                              strokeDashoffset={502.6 - (502.6 * Math.min(Math.max(margin, 0), 100)) / 100}
                              className={`${margin < 15 ? 'text-rose-500' : margin < 40 ? 'text-amber-500' : 'text-emerald-400'} transition-all duration-1000 ease-out`}
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-4xl font-black tabular-nums">{margin.toFixed(0)}%</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margen</span>
                        </div>
                     </div>

                     <div className="flex-1 space-y-6">
                        <div>
                           <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Beneficio Neto Proyectado</p>
                           <h4 className={`text-6xl font-black tracking-tighter ${isLosingMoney ? 'text-rose-500' : 'text-white'}`}>
                              {netProfit.toLocaleString()}€
                           </h4>
                        </div>
                        <div className="flex gap-4">
                           <div className="bg-white/5 p-3 rounded-2xl flex-1 border border-white/5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Ingresos Totales</p>
                              <p className="text-xl font-black">{totalRevenue.toLocaleString()}€</p>
                           </div>
                           <div className="bg-white/5 p-3 rounded-2xl flex-1 border border-white/5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Eficiencia/Euro</p>
                              <p className="text-xl font-black">{totalRevenue > 0 ? (Math.max(0, (netProfit / totalRevenue)).toFixed(2)) : '0.00'}€</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* STRATEGY RECOMMENDATION */}
               <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                     <Target size={18} className="text-indigo-600" /> Breakdown de Coste Unitario
                  </h4>

                  <div className="space-y-10">
                     {/* Visual Unit Bar */}
                     <div className="relative">
                        <div className="flex justify-between items-end mb-3">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estructura de 1 Ticket</p>
                              <p className="text-2xl font-black text-slate-800">{ticketPrice}€ <span className="text-xs font-medium text-slate-400">PVP</span></p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coste de Producto</p>
                              <p className="text-lg font-black text-rose-500">{costPerTicket.toFixed(2)}€</p>
                           </div>
                        </div>

                        <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex p-1">
                           <div
                              className={`h-full rounded-full transition-all duration-1000 ${isLosingMoney ? 'bg-rose-500' : 'bg-rose-400'}`}
                              style={{ width: `${ticketPrice > 0 ? Math.min((costPerTicket / ticketPrice) * 100, 100) : 100}%` }}
                           ></div>
                           {!isLosingMoney && totalRevenue > 0 && (
                              <div
                                 className="h-full bg-emerald-400 rounded-full ml-1 transition-all duration-1000 delay-300"
                                 style={{ width: `${(netProfit / totalRevenue) * 100}%` }}
                              ></div>
                           )}
                        </div>

                        <div className="flex justify-between mt-3 text-[10px] font-black uppercase tracking-tighter">
                           <span className="text-rose-500">Materia Prima</span>
                           <span className="text-emerald-500">Beneficio (Excedente)</span>
                        </div>
                     </div>

                     {/* Actionable Insights Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                           <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Análisis de Desviación</p>
                           <p className="text-xs text-indigo-900 leading-relaxed">
                              Estás gastando un <span className="font-bold">{budgetGoal > 0 ? (actualSpent / budgetGoal * 100).toFixed(0) : 0}%</span> del presupuesto asignado. {actualSpent > budgetGoal ? '⚠️ Has superado el presupuesto inicial.' : '✅ Operas dentro de lo previsto.'}
                           </p>
                        </div>
                        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                           <p className="text-[10px] font-black text-amber-500 uppercase mb-2">Consejo Estratégico</p>
                           <p className="text-xs text-amber-900 leading-relaxed">
                              {margin < 20 ? 'Margen muy bajo. Considera subir el ticket +2€ o reducir la picaeta previa.' : 'Margen saludable. Puedes invertir el excedente en mejores postres o música.'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

            </div>

         </div>
      </div>
   );
};

const EscandalloTool: React.FC = () => {
   const [targetPrice, setTargetPrice] = useState(5.00);
   const [bottleCost, setBottleCost] = useState(12.00);
   const [mixerCost, setMixerCost] = useState(0.40);
   const [consumables, setConsumables] = useState(0.15);
   const [bottleCap, setBottleCap] = useState(700);
   const [pourSize, setPourSize] = useState(60);
   const [waste, setWaste] = useState(10);

   const drinksPerBottle = (bottleCap / pourSize) * (1 - waste / 100);
   const alcoholCostPerDrink = bottleCost / drinksPerBottle;
   const totalCost = alcoholCostPerDrink + mixerCost + consumables;
   const profit = targetPrice - totalCost;
   const margin = targetPrice > 0 ? (profit / targetPrice) * 100 : 0;

   let statusColor = 'text-red-500';
   let statusMsg = 'PELIGROSO';
   let statusBg = 'bg-red-50 border-red-200';

   if (margin > 40) { statusColor = 'text-orange-500'; statusMsg = 'ACEPTABLE'; statusBg = 'bg-orange-50 border-orange-200'; }
   if (margin > 60) { statusColor = 'text-green-500'; statusMsg = 'EXCELENTE'; statusBg = 'bg-green-50 border-green-200'; }

   return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h3 className="font-bold text-slate-800 text-lg">Configuración de Producto</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500">Coste Botella (€)</label>
                     <input type="number" value={bottleCost} onChange={e => setBottleCost(parseFloat(e.target.value))} className="w-full border p-2 rounded-lg font-bold" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500">Capacidad (ml)</label>
                     <input type="number" value={bottleCap} onChange={e => setBottleCap(parseFloat(e.target.value))} className="w-full border p-2 rounded-lg" />
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-slate-500 flex justify-between">Dosis de Alcohol <span>{pourSize} ml</span></label>
                  <input type="range" min="30" max="100" value={pourSize} onChange={e => setPourSize(parseInt(e.target.value))} className="w-full accent-indigo-600" />
               </div>

               <div>
                  <label className="text-xs font-bold text-slate-500 flex justify-between">Merma / Desperdicio <span>{waste}%</span></label>
                  <input type="range" min="0" max="30" value={waste} onChange={e => setWaste(parseInt(e.target.value))} className="w-full accent-red-500" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500">Refresco (€)</label>
                     <input type="number" step="0.05" value={mixerCost} onChange={e => setMixerCost(parseFloat(e.target.value))} className="w-full border p-2 rounded-lg" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500">Vaso/Hielo (€)</label>
                     <input type="number" step="0.05" value={consumables} onChange={e => setConsumables(parseFloat(e.target.value))} className="w-full border p-2 rounded-lg" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-600">PVP OBJETIVO</span>
                  <div className="flex items-center gap-4">
                     <button onClick={() => setTargetPrice(p => Math.max(0, p - 0.5))} className="w-8 h-8 rounded-full bg-white border shadow flex items-center justify-center text-slate-500 hover:bg-slate-100"><Minus size={16} /></button>
                     <span className="text-3xl font-black text-slate-900">{targetPrice.toFixed(2)}€</span>
                     <button onClick={() => setTargetPrice(p => p + 0.5)} className="w-8 h-8 rounded-full bg-slate-900 text-white shadow flex items-center justify-center hover:bg-black"><Plus size={16} /></button>
                  </div>
               </div>

               <div className={`p-4 rounded-xl border-2 ${statusBg} text-center`}>
                  <p className="text-xs font-bold opacity-60 uppercase mb-1">Rentabilidad</p>
                  <p className={`text-4xl font-black ${statusColor} tracking-tight`}>{margin.toFixed(1)}%</p>
                  <p className={`text-sm font-bold ${statusColor} mt-1`}>{statusMsg}</p>
               </div>

               <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Desglose del Precio</p>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     <div className="h-full bg-purple-500" style={{ width: `${targetPrice > 0 ? (alcoholCostPerDrink / targetPrice) * 100 : 0}%` }} title="Alcohol"></div>
                     <div className="h-full bg-blue-400" style={{ width: `${targetPrice > 0 ? (mixerCost / targetPrice) * 100 : 0}%` }} title="Refresco"></div>
                     <div className="h-full bg-slate-400" style={{ width: `${targetPrice > 0 ? (consumables / targetPrice) * 100 : 0}%` }} title="Consumibles"></div>
                     <div className="h-full bg-green-500" style={{ width: `${targetPrice > 0 ? (profit / targetPrice) * 100 : 0}%` }} title="Beneficio"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                     <span className="text-purple-600">Alcohol: {alcoholCostPerDrink.toFixed(2)}€</span>
                     <span className="text-blue-500">Mixer: {mixerCost.toFixed(2)}€</span>
                     <span className="text-green-600 font-bold">Ganancia: {profit.toFixed(2)}€</span>
                  </div>
               </div>

               <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 space-y-1">
                  <p>Ventas para ganar 1.000€: <strong className="text-slate-800">{profit > 0 ? Math.ceil(1000 / profit) : 'N/A'} copas</strong></p>
                  <p>Copas por botella: <strong className="text-slate-800">{drinksPerBottle.toFixed(1)}</strong></p>
               </div>
            </div>
         </div>
      </div>
   );
};

const BotellometerTool: React.FC<{ onAdd: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void }> = ({ onAdd }) => {
   const toast = useToast();
   const [pax, setPax] = useState(50);
   const [hours, setHours] = useState(6);
   const [intensity, setIntensity] = useState(50);
   const [beerPref, setBeerPref] = useState(50);

   const factor = 0.5 + (intensity / 100);
   const totalDrinks = pax * hours * factor;

   const spiritDrinks = totalDrinks * (beerPref / 100);
   const beerDrinks = totalDrinks * (1 - beerPref / 100);

   const alcoholBottles = Math.ceil(spiritDrinks / 14);
   const mixerBottles = Math.ceil(alcoholBottles * 4);
   const beerCans = Math.ceil(beerDrinks);
   const iceSacks = Math.ceil((alcoholBottles + (beerCans / 6)) * 0.5);

   const handleAddAll = () => {
      if (alcoholBottles > 0) onAdd({ name: 'Botellas Alcohol Variado', quantity: alcoholBottles, unit: 'botellas', location: 'Barra' });
      if (mixerBottles > 0) onAdd({ name: 'Refrescos Mixer 2L', quantity: mixerBottles, unit: 'botellas', location: 'Barra' });
      if (beerCans > 0) onAdd({ name: 'Cerveza (Latas)', quantity: beerCans, unit: 'u', location: 'Nevera' });
      if (iceSacks > 0) onAdd({ name: 'Hielo (Sacos)', quantity: iceSacks, unit: 'sacos', location: 'Arcón' });
      toast.success('Añadido a la lista de compra');
   };

   return (
      <div className="p-8 max-w-4xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
               <div>
                  <label className="font-bold text-slate-700 block mb-2">Asistentes ({pax})</label>
                  <input type="range" min="10" max="500" value={pax} onChange={e => setPax(parseInt(e.target.value))} className="w-full accent-purple-600" />
               </div>
               <div>
                  <label className="font-bold text-slate-700 block mb-2">Horas de Fiesta ({hours}h)</label>
                  <input type="range" min="2" max="12" value={hours} onChange={e => setHours(parseInt(e.target.value))} className="w-full accent-purple-600" />
               </div>
               <div>
                  <label className="font-bold text-slate-700 block mb-2">Intensidad: {intensity < 30 ? 'Tranqui' : intensity > 70 ? 'Desmadre' : 'Animada'}</label>
                  <input type="range" min="0" max="100" value={intensity} onChange={e => setIntensity(parseInt(e.target.value))} className="w-full accent-orange-500" />
               </div>
               <div>
                  <label className="font-bold text-slate-700 block mb-2">Preferencia: {beerPref < 50 ? 'Más Cerveza' : 'Más Copas'}</label>
                  <div className="flex items-center gap-2">
                     <Beer size={20} className="text-yellow-600" />
                     <input type="range" min="0" max="100" value={beerPref} onChange={e => setBeerPref(parseInt(e.target.value))} className="w-full accent-blue-600" />
                     <Wine size={20} className="text-purple-600" />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                     <p className="text-4xl font-black text-purple-600">{alcoholBottles}</p>
                     <p className="text-xs font-bold text-purple-400 uppercase">Botellas Alcohol</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                     <p className="text-4xl font-black text-blue-600">{mixerBottles}</p>
                     <p className="text-xs font-bold text-blue-400 uppercase">Refrescos (2L)</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center">
                     <p className="text-4xl font-black text-yellow-600">{beerCans}</p>
                     <p className="text-xs font-bold text-yellow-400 uppercase">Latas Cerveza</p>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 text-center">
                     <p className="text-4xl font-black text-cyan-600">{iceSacks}</p>
                     <p className="text-xs font-bold text-cyan-400 uppercase">Sacos Hielo</p>
                  </div>
               </div>
               <button onClick={handleAddAll} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black shadow-xl flex items-center justify-center gap-2">
                  <ShoppingCart size={20} /> Añadir Todo a la Lista
               </button>
            </div>
         </div>
      </div>
   );
};

const HielologoTool: React.FC = () => {
   const [temp, setTemp] = useState(20);
   const [pax, setPax] = useState(50);
   const [hours, setHours] = useState(4);

   const kgNeeded = Math.ceil((pax * 0.3) * (1 + (hours / 4)) * (1 + (temp - 15) / 40));
   const bags = Math.ceil(kgNeeded / 2);
   const arcones = Math.ceil(bags / 30);

   return (
      <div className="p-8 flex flex-col items-center justify-center space-y-8">
         <div className="w-full max-w-lg space-y-6">
            <div>
               <div className="flex justify-between font-bold text-slate-700 mb-2">
                  <span>Temperatura Ambiente</span>
                  <span>{temp}ºC</span>
               </div>
               <input type="range" min="5" max="40" value={temp} onChange={e => setTemp(parseInt(e.target.value))} className="w-full accent-red-500" />
            </div>
            <div>
               <div className="flex justify-between font-bold text-slate-700 mb-2">
                  <span>Asistentes</span>
                  <span>{pax}</span>
               </div>
               <input type="range" min="10" max="500" value={pax} onChange={e => setPax(parseInt(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div>
               <div className="flex justify-between font-bold text-slate-700 mb-2">
                  <span>Duración Evento</span>
                  <span>{hours}h</span>
               </div>
               <input type="range" min="1" max="12" value={hours} onChange={e => setHours(parseInt(e.target.value))} className="w-full accent-slate-500" />
            </div>
         </div>

         <div className="bg-cyan-50 border border-cyan-200 p-8 rounded-3xl text-center shadow-sm w-full max-w-md">
            <Thermometer size={48} className="text-cyan-500 mx-auto mb-4" />
            <p className="text-lg text-cyan-800 font-medium">Necesitas comprar</p>
            <p className="text-6xl font-black text-cyan-600 my-2">{kgNeeded} <span className="text-2xl">kg</span></p>
            <div className="flex justify-center gap-4 mt-4 text-cyan-700 font-bold text-sm">
               <span className="bg-white px-3 py-1 rounded-full shadow-sm">{bags} bolsas (2kg)</span>
               <span className="bg-white px-3 py-1 rounded-full shadow-sm">{arcones} {arcones === 1 ? 'arcón' : 'arcones'}</span>
            </div>
         </div>
      </div>
   );
};

const ChefFalleroTool: React.FC<{ onAdd: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void }> = ({ onAdd }) => {
   const [pax, setPax] = useState(40);
   const [dish, setDish] = useState<'PAELLA' | 'FIDEUA' | 'GUISO'>('PAELLA');
   const [picaeta, setPicaeta] = useState(false);

   const baseSize = 100;
   const growthFactor = pax * 1.5;
   const visualSize = Math.min(400, baseSize + growthFactor);
   const diameter = Math.round(30 + (pax * 1.2));

   const factor = picaeta ? 0.85 : 1.0;
   const rice = (pax * 0.100 * factor).toFixed(1);
   const meat = (pax * 0.350 * factor).toFixed(1);
   const veg = (pax * 0.150 * factor).toFixed(1);

   const ingredients = [
      { name: dish === 'FIDEUA' ? 'Fideo Fideuà' : dish === 'GUISO' ? 'Patatas' : 'Arroz Redondo', qty: rice, unit: 'kg' },
      { name: dish === 'FIDEUA' ? 'Morralla/Pescado' : 'Carne (Pollo/Conejo)', qty: meat, unit: 'kg' },
      { name: 'Verdura Fresca', qty: veg, unit: 'kg' },
      { name: 'Aceite Oliva', qty: (pax * 0.03).toFixed(1), unit: 'L' },
   ];

   const handleAddList = () => {
      ingredients.forEach(i => onAdd({ name: i.name, quantity: Math.ceil(parseFloat(i.qty)), unit: i.unit, location: 'Despensa' }));
      alert("Ingredientes añadidos");
   };

   return (
      <div className="h-full flex flex-col md:flex-row">
         <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-8 border-r border-slate-200 relative overflow-hidden">
            <div
               className="rounded-full border-4 border-slate-800 bg-yellow-100 flex items-center justify-center shadow-xl transition-all duration-500 relative"
               style={{ width: `${visualSize}px`, height: `${visualSize}px` }}
            >
               <div className="absolute inset-2 border border-slate-400 rounded-full opacity-20"></div>
               <div className="absolute w-full h-2 bg-slate-800 top-1/2 -translate-y-1/2 opacity-10 rotate-45"></div>
               <div className="absolute w-full h-2 bg-slate-800 top-1/2 -translate-y-1/2 opacity-10 -rotate-45"></div>
               <span className="font-black text-slate-800 text-2xl drop-shadow-md">{diameter} cm</span>
            </div>
            <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-xs">Diámetro Recomendado</p>
         </div>

         <div className="w-full md:w-96 p-6 bg-white overflow-y-auto space-y-6">
            <div>
               <label className="font-bold text-slate-700 block mb-2">Comensales: {pax}</label>
               <input type="range" min="10" max="200" value={pax} onChange={e => setPax(parseInt(e.target.value))} className="w-full accent-orange-500" />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg">
               {['PAELLA', 'FIDEUA', 'GUISO'].map(d => (
                  <button key={d} onClick={() => setDish(d as any)} className={`flex-1 py-2 text-xs font-bold rounded ${dish === d ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>{d}</button>
               ))}
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
               <span className="text-sm font-bold text-slate-700">Incluir Picaeta previa</span>
               <button onClick={() => setPicaeta(!picaeta)} className={`w-12 h-6 rounded-full transition-colors relative ${picaeta ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${picaeta ? 'left-7' : 'left-1'}`}></div>
               </button>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl space-y-2">
               {ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-orange-100 last:border-0 pb-1 last:pb-0">
                     <span className="text-orange-900">{ing.name}</span>
                     <span className="font-bold text-orange-700">{ing.qty} {ing.unit}</span>
                  </div>
               ))}
            </div>

            <button onClick={handleAddList} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black flex items-center justify-center gap-2">
               <ShoppingCart size={18} /> Añadir Ingredientes
            </button>
         </div>
      </div>
   );
};
