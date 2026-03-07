
import React, { useState, useEffect } from 'react';
import {
   LayoutDashboard, Wallet, ShoppingCart, Users, Beer,
   Calculator, Monitor, Settings, FileText,
   Truck, ClipboardList, Utensils, PieChart, ShoppingBag,
   ChevronRight, LogOut, User as UserIcon, HelpCircle,
   Boxes, Menu, X, Maximize, Minimize, HardHat
} from 'lucide-react';
import { UserRole } from '../types';
import { canAccessModule, getRoleLabel } from '../utils/permissions';

interface LayoutProps {
   currentView: string;
   onChangeView: (view: string) => void;
   children: React.ReactNode;
   userRole: UserRole;
   onLogout: () => void;
   peerCount: number;
   onForceSync: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
   currentView, onChangeView, children, userRole, onLogout, peerCount
}) => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isFullscreen, setIsFullscreen] = useState(false);

   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

   const getMenuItems = () => {
      // Full menu structure with all modules
      const allModules = [
         { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
         { id: 'help', label: 'Ayuda', icon: HelpCircle },

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
         { id: 'kiosk', label: 'Modo Kiosko', icon: Monitor },
         { id: 'settings-master', label: 'Ajustes', icon: Settings },
      ];

      // Filter modules based on role permissions
      const filteredModules = allModules.filter(item => {
         // Always keep headers for now (we'll clean empty ones later)
         if (item.type === 'header') return true;
         // Check if user has access to this module
         return canAccessModule(userRole, item.id);
      });

      // Remove headers that have no items following them
      return filteredModules.filter((item, index, arr) => {
         if (item.type === 'header') {
            const nextItem = arr[index + 1];
            // Keep header only if next item exists and is not another header
            return nextItem && nextItem.type !== 'header';
         }
         return true;
      });
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
                     <div className="flex-1">
                        <h1 className="font-black text-xl tracking-tighter text-slate-900 italic">Merello<span className="text-blue-600">App</span></h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestión Fallera</p>
                     </div>
                  </div>

                  {/* Role Badge */}
                  <div className="px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Tu Rol</p>
                     <p className="text-sm font-bold text-indigo-700">{getRoleLabel(userRole)}</p>
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
                  {/* Spacer to center title or add right action */}
               </div>
            </header>

            {/* SCROLLABLE VIEW CONTAINER */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-10 scroll-smooth">
               <div className="max-w-7xl mx-auto h-full pb-32 lg:pb-0">
                  {children}
               </div>
            </div>


         </main>
      </div>
   );
};
