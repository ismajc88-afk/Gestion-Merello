
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
   LayoutDashboard, Wallet, ShoppingCart, Users, Beer,
   Calculator, Monitor, Settings, FileText,
   Truck, ClipboardList, Utensils, PieChart, ShoppingBag,
   ChevronRight, Sparkles, LogOut, User as UserIcon, HelpCircle,
   Boxes, Menu, X, Maximize, Minimize, HardHat, WifiOff
} from 'lucide-react';
import { UserRole, AppConfig } from '../types';
import { usePermissions } from '../hooks/usePermissions';

interface LayoutProps {
   currentView: string;
   onChangeView: (view: string) => void;
   children: React.ReactNode;
   onOpenAI: () => void;
   userRole: UserRole;
   onLogout: () => void;
   peerCount: number;
   onForceSync: () => void;
   appConfig?: AppConfig;
}

export const Layout: React.FC<LayoutProps> = ({
   currentView, onChangeView, children, onOpenAI, userRole, onLogout, peerCount, onForceSync, appConfig
}) => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isFullscreen, setIsFullscreen] = useState(false);
   const [isOffline, setIsOffline] = useState(!navigator.onLine);

   // --- PULL-TO-REFRESH ---
   const scrollRef = useRef<HTMLDivElement>(null);
   const [pullDistance, setPullDistance] = useState(0);
   const [isRefreshing, setIsRefreshing] = useState(false);
   const touchStartY = useRef(0);
   const isPulling = useRef(false);
   const PULL_THRESHOLD = 80;

   const onTouchStart = useCallback((e: React.TouchEvent) => {
      if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
         touchStartY.current = e.touches[0].clientY;
         isPulling.current = true;
      }
   }, []);

   const onTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isPulling.current) return;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY > 0 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
         setPullDistance(Math.min(deltaY * 0.5, 120));
      } else {
         isPulling.current = false;
         setPullDistance(0);
      }
   }, []);

   const onTouchEnd = useCallback(() => {
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
         setIsRefreshing(true);
         setPullDistance(PULL_THRESHOLD);
         onForceSync();
         setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
         }, 1500);
      } else {
         setPullDistance(0);
      }
      isPulling.current = false;
   }, [pullDistance, isRefreshing, onForceSync]);

   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(!!document.fullscreenElement);
      };

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
         document.removeEventListener('fullscreenchange', handleFullscreenChange);
         window.removeEventListener('online', handleOnline);
         window.removeEventListener('offline', handleOffline);
      };
   }, []);

   const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
         document.documentElement.requestFullscreen().catch((e) => {
            console.error("Error fullscreen:", e);
            alert("Usa 'Añadir a pantalla de inicio' en iOS para pantalla completa real.");
         });
      } else {
         if (document.exitFullscreen) document.exitFullscreen();
      }
   };

   // Resolve allowed views for this role using the new hook
   const isAllowed = (id: string) => usePermissions(appConfig, userRole, id).canView;

   const getMenuItems = () => {
      const common = [
         { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
         { id: 'help', label: 'Ayuda', icon: HelpCircle },
      ].filter(i => isAllowed(i.id));

      if (userRole === 'FALLERO') {
         return [
            ...common,
            { id: 'bar', label: 'Turnos Barra', icon: Beer },
            { id: 'work-groups', label: 'Grupos Trabajo', icon: HardHat },
            { id: 'logistics', label: 'Mis Tareas', icon: ClipboardList },
            { id: 'meals', label: 'Menús', icon: Utensils },
         ].filter(i => 'type' in i || isAllowed(i.id));
      }

      const allItems = [
         ...common,
         { id: 'economy', type: 'header', label: 'Economía' },
         { id: 'inventory', label: 'Presupuesto', icon: PieChart },
         { id: 'cash', label: 'Tesorería', icon: Wallet },
         { id: 'reports', label: 'Informes', icon: FileText },

         { id: 'supply', type: 'header', label: 'Logística' },
         { id: 'purchase', label: 'Pedidos', icon: ShoppingCart },
         { id: 'shopping', label: 'Lista Compra', icon: ShoppingBag },
         { id: 'stock', label: 'Stock', icon: Boxes },
         { id: 'suppliers', label: 'Proveedores', icon: Truck },

         { id: 'ops', type: 'header', label: 'Operativa' },
         { id: 'work-groups', label: 'Grupos Trabajo', icon: HardHat },
         { id: 'logistics', label: 'Tareas', icon: ClipboardList },
         { id: 'bar', label: 'Turnos', icon: Users },
         { id: 'bar-profit', label: 'Cierre Caja', icon: Beer },
         { id: 'meals', label: 'Cocina', icon: Utensils },
         { id: 'hr', label: 'Censo', icon: UserIcon },

         { id: 'tools', type: 'header', label: 'Utilidades' },
         { id: 'tools', label: 'Calculadoras', icon: Calculator },
         { id: 'kiosk', label: userRole === 'LOGISTICA' ? 'Panel Entregas Kanban' : 'Modo Kiosko', icon: Monitor },
         { id: 'settings-master', label: 'Ajustes', icon: Settings },
      ];

      // Filter: keep header rows only if at least one item in their group is allowed
      const filtered: typeof allItems = [];
      for (let i = 0; i < allItems.length; i++) {
         const item = allItems[i];
         if ('type' in item && item.type === 'header') {
            // Look ahead: keep header only if any next non-header item is allowed
            const nextItems = allItems.slice(i + 1).filter(ni => !('type' in ni));
            const nextHeader = allItems.slice(i + 1).findIndex(ni => 'type' in ni && ni.type === 'header');
            const groupItems = nextHeader >= 0 ? nextItems.slice(0, nextHeader) : nextItems;
            if (groupItems.some(gi => isAllowed(gi.id))) {
               filtered.push(item);
            }
         } else if (isAllowed(item.id)) {
            filtered.push(item);
         }
      }
      return filtered;
   };

   const navItems = getMenuItems();

   const handleNavClick = (id: string) => {
      onChangeView(id);
      setIsMobileMenuOpen(false);
   };

   const currentLabel = navItems.find(i => 'id' in i && i.id === currentView);

   return (
      <div className="flex h-[100dvh] bg-[#f8fafc] text-slate-900 overflow-hidden relative">

         {/* MOBILE DRAWER (SLIDE-OUT MENU) */}
         <div
            className={`fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
         >
            <div
               className={`absolute top-0 bottom-0 left-0 w-[85%] max-w-[320px] bg-white shadow-2xl transition-transform duration-300 transform flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
               onClick={e => e.stopPropagation()}
            >
               {/* Mobile Drawer Header */}
               <div className="p-6 bg-slate-50 border-b border-slate-100 safe-pt">
                  <div className="flex items-center gap-3 mb-3">
                     <img src="/escudo-merello.png" alt="Escudo Falla" className="w-12 h-12 object-contain" />
                     <div>
                        <h1 className="font-black text-xl tracking-tighter text-slate-900 italic">Merello<span className="text-blue-600">App</span></h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestión Fallera</p>
                     </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm text-slate-400 active:scale-90 transition-transform"><X size={24} /></button>
               </div>

               {/* Mobile Drawer Content */}
               <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {navItems.map((item, idx) => {
                     if ('type' in item && item.type === 'header') return (
                        <div key={idx} className="pt-6 pb-2 px-2 text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                     );
                     const menuItem = item as { id: string; label: string; icon: React.ElementType };
                     const Icon = menuItem.icon;
                     const isActive = currentView === menuItem.id;

                     return (
                        <button
                           key={idx}
                           onClick={() => handleNavClick(menuItem.id)}
                           className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold transition-all active:scale-95 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                           <Icon size={22} className={isActive ? 'text-blue-200' : 'text-slate-400'} />
                           {menuItem.label}
                        </button>
                     );
                  })}
               </div>

               {/* Mobile Drawer Footer */}
               <div className="p-4 border-t border-slate-100 bg-slate-50 safe-pb">
                  <button onClick={onLogout} className="w-full py-4 bg-white border border-rose-100 text-rose-500 rounded-xl font-black uppercase text-xs tracking-widest shadow-sm flex items-center justify-center gap-2 active:bg-rose-50">
                     <LogOut size={18} /> Cerrar Sesión
                  </button>
               </div>
            </div>
         </div>

         {/* DESKTOP SIDEBAR (Hidden on mobile) */}
         <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 shadow-xl z-20">
            <div className="p-8 border-b border-slate-100">
               <div className="flex items-center gap-3">
                  <img src="/escudo-merello.png" alt="Escudo Falla Eduardo Merello" className="w-14 h-14 object-contain" />
                  <div>
                     <h1 className="font-black text-xl tracking-tighter leading-none text-slate-900 uppercase italic">Merello<br /><span className="text-blue-600">Planner</span></h1>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
               {navItems.map((item, idx) => {
                  if ('type' in item && item.type === 'header') return (
                     <div key={idx} className="px-4 pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                  );

                  const menuItem = item as { id: string; label: string; icon: React.ElementType };
                  const Icon = menuItem.icon;
                  const isActive = currentView === menuItem.id;

                  return (
                     <button
                        key={idx}
                        onClick={() => handleNavClick(menuItem.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all group ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                     >
                        <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'} />
                        <span className="uppercase tracking-wide">{menuItem.label}</span>
                        {isActive && <ChevronRight size={14} className="ml-auto text-slate-500" />}
                     </button>
                  );
               })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
               <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{peerCount + 1} Conectados</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               </div>
               {isOffline && (
                  <div className="w-full flex items-center justify-center gap-2 py-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] font-black uppercase text-rose-600 shadow-inner">
                     <WifiOff size={14} className="animate-pulse" />
                     Guardando Local...
                  </div>
               )}
               <button onClick={toggleFullscreen} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900">
                  {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />} {isFullscreen ? 'Salir' : 'Pantalla Completa'}
               </button>
               <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50">
                  <LogOut size={14} /> Salir
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT AREA */}
         <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-[#f8fafc]">

            {/* MOBILE HEADER BAR (Sticky) */}
            <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm safe-pt">
               <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-700 active:bg-slate-100 rounded-lg transition-colors">
                  <Menu size={28} />
               </button>
               <span className="font-black text-lg uppercase tracking-tight text-slate-900 italic">
                  {(currentLabel as any)?.label || 'Merello'}
               </span>
               <div className="w-10 flex justify-end">
                  {isOffline && <WifiOff size={20} className="text-rose-500 animate-pulse" />}
               </div>
            </header>

            {/* SCROLLABLE VIEW CONTAINER */}
            <div
               ref={scrollRef}
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}
               className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-10 scroll-smooth relative"
            >
               {/* Pull indicator */}
               {pullDistance > 0 && (
                  <div className="flex justify-center items-center transition-all" style={{ height: pullDistance }}>
                     <div className={`flex flex-col items-center gap-1 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }}>
                        <div className={`w-8 h-8 rounded-full border-4 ${pullDistance >= PULL_THRESHOLD ? 'border-blue-500 border-t-transparent' : 'border-slate-300 border-t-transparent'}`}></div>
                     </div>
                     {!isRefreshing && pullDistance >= PULL_THRESHOLD && (
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-3">Suelta para sincronizar</span>
                     )}
                     {isRefreshing && (
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-3">Sincronizando...</span>
                     )}
                  </div>
               )}
               <div className="max-w-7xl mx-auto h-full pb-32 lg:pb-0">
                  {children}
               </div>
            </div>

            {/* AI FLOATING ACTION BUTTON (Mobile Optimized) */}
            {isAllowed('ai') && (
               <button
                  onClick={onOpenAI}
                  className="fixed bottom-6 right-4 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center z-40 active:scale-90 transition-transform safe-mb"
               >
                  <Sparkles size={28} className="fill-white/20" />
               </button>
            )}

         </main>
      </div>
   );
};
