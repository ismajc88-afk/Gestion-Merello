
import React, { useState } from 'react';
import { 
  LayoutDashboard, Wallet, Users, 
  Calculator, FileText, Truck, ClipboardList, 
  RefreshCw, 
  Zap, ShieldCheck, Database, 
  
  Cpu, Wifi,
  Merge, BookOpen, 
  
  Fingerprint, 
  Bell
} from 'lucide-react';

export const HelpGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("intro");

  const fullGuide = [
    {
      id: "dashboard",
      title: "1. VISIÓN GLOBAL (DASHBOARD)",
      icon: LayoutDashboard,
      color: "text-indigo-600",
      description: "Es el radar de la falla. Cruza todos los datos de la app para dar un diagnóstico rápido.",
      points: [
        { label: "Health Score (%)", detail: "Nota de gestión. Sube al completar tareas y tener dinero en caja. Baja si hay gastos sin presupuesto o turnos de barra vacíos." },
        { label: "Radar Operativo", detail: "Gráfico de 5 ejes. Si la mancha se aleja del centro, ese departamento va bien. Si está cerca del centro, hay crisis en ese área." },
        { label: "Próximo Relevo", detail: "Muestra quiénes deben entrar a la barra en el siguiente turno para que los delegados los busquen si no aparecen." },
        { label: "Cadena de Suministros", detail: "Detecta qué ingredientes faltan para la próxima comida programada en el calendario." },
        { label: "Feed Táctico", detail: "Historial en tiempo real de lo que otros directivos están haciendo en sus móviles." },
        { label: "Alertas del Casal", detail: "Incidencias urgentes (ej: 'Sin hielo', 'Inundación baño') enviadas desde el Modo Kiosko de la barra." }
      ]
    },
    {
      id: "economy",
      title: "2. ECONOMÍA (PRESUPUESTO Y CAJA)",
      icon: Wallet,
      color: "text-emerald-600",
      description: "Control total del dinero. Divide la gestión en 'Planificación' vs 'Realidad'.",
      points: [
        { label: "Presupuesto (Inventory)", detail: "Aquí se decide cuánto dinero hay para cada cosa. El 'Techo de Gasto' es el límite que no podemos pasar." },
        { label: "Caja y Tesorería (Cash)", detail: "Es el libro diario del dinero físico. Cada vez que alguien saca 20€ para el súper, debe anotarse aquí." },
        { label: "Arqueo de Caja", detail: "Calculadora para contar billetes y monedas al final del día. La app te dirá si el dinero físico coincide con lo anotado." },
        { label: "Auditoría de Stock", detail: "Técnica avanzada: Pones cuántas cervezas había al empezar y cuántas quedan, y la app te dice cuánto dinero DEBERÍA haber en caja." }
      ]
    },
    {
      id: "logistics",
      title: "3. APROVISIONAMIENTO (COMPRAS)",
      icon: Truck,
      color: "text-blue-600",
      description: "Gestión de pedidos industriales, compras de supermercado y stock.",
      points: [
        { label: "Planificador (Pedidos)", detail: "Carrito de la compra pro. Permite simular cuánto nos costará un pedido antes de hablar con el proveedor." },
        { label: "Asistente de Previsión", detail: "IA que calcula cuánta bebida necesitas basándose en el número de falleros y días de fiesta." },
        { label: "Lista Compra (Súper)", detail: "Interfaz diseñada para llevar el móvil en la mano en el Mercadona. Tachas productos y registras el gasto al instante." },
        { label: "Control Stock", detail: "Inventario de lo que hay en el almacén. Si algo baja del 'Stock Mínimo', el sistema avisa en el Dashboard." },
        { label: "Proveedores", detail: "Agenda con acceso directo a WhatsApp para pedir barriles o comida con un click." }
      ]
    },
    {
      id: "ops",
      title: "4. LOGÍSTICA Y CASAL (TRABAJO)",
      icon: ClipboardList,
      color: "text-orange-600",
      description: "Organización de la fuerza de trabajo y los eventos culinarios.",
      points: [
        { label: "Tareas y Montaje", detail: "Tablero Kanban (Pendiente, En curso, Hecho). Asigna responsables para que no todos pregunten '¿qué hay que hacer?'." },
        { label: "Sistema de XP (Experiencia)", detail: "Gamificación: cada tarea da puntos según su importancia. Sirve para ver quién es el fallero que más trabaja." },
        { label: "Cocina y Menús", detail: "Recetario dinámico. Ajustas el número de comensales y te dice los kilos exactos de arroz, carne o verdura que hay que comprar." },
        { label: "Turnos de Barra", detail: "Cuadrante 24h. Controla quién está de servicio para que la barra nunca se quede sola." }
      ]
    },
    {
      id: "hr",
      title: "5. CENSO Y PERSONAL (RRHH)",
      icon: Users,
      color: "text-rose-600",
      description: "Dossier de inteligencia sobre cada miembro de la comisión.",
      points: [
        { label: "Dossier del Fallero", detail: "Ficha con alergias, teléfono de emergencia y 'Karma' (puntos acumulados por ayudar)." },
        { label: "Matriz de Disponibilidad", detail: "Indica si un fallero prefiere trabajar por la mañana, tarde o noche." },
        { label: "Puntos de Fatiga", detail: "Lógica anti-quemado: Trabajar de noche suma 3 pts, de día 1 pt. A los 8 pts, la app recomienda que esa persona descanse." },
        { label: "Control de Presencia", detail: "Botón de 'Check-in' para saber quién está físicamente en el casal en caso de emergencia." }
      ]
    },
    {
      id: "science",
      title: "6. HERRAMIENTAS CIENTÍFICAS",
      icon: Calculator,
      color: "text-purple-600",
      description: "Calculadoras técnicas para optimizar el beneficio y no malgastar recursos.",
      points: [
        { label: "Sismógrafo (Ntfy/N2FI)", detail: "Conecta la app externa Ntfy para recibir alertas de barra con vibración real, incluso con el móvil bloqueado." },
        { label: "Margen Real", detail: "Calcula si una cena es rentable cruzando el coste de los ingredientes con el precio del ticket." },
        { label: "Hielólogo", detail: "Fórmula maestra que estima sacos de hielo basándose en la temperatura exterior prevista." },
        { label: "Botellómetro", detail: "Dice cuántas botellas de cada alcohol comprar según las horas de fiesta para no quedarnos cortos ni que sobre stock." },
        { label: "Escandallo Pro", detail: "Calcula el beneficio exacto de cada copa de la barra (restando vaso, hielo y refresco)." }
      ]
    }
  ];

  const syncGuide = [
    {
      q: "¿Qué es Ntfy (N2FI) y para qué sirve?",
      a: "Es una app externa gratuita. Nuestro Planner se comunica con ella para hacerte vibrar el móvil cuando hay una emergencia en la barra, aunque tengas la pantalla apagada.",
      icon: Bell
    },
    {
      q: "¿Cómo se pasan los datos de un móvil a otro?",
      a: "La app usa 'Smart Merge P2P'. Cuando dos directivos abren la app a la vez, sus móviles se 'saludan' y combinan los datos. No hay un servidor central; los datos saltan de móvil a móvil.",
      icon: Wifi
    },
    {
      q: "¿Qué significa el contador de 'Dispositivos Fusionados'?",
      a: "Indica con cuántos compañeros estás sincronizado en este momento. Si pone 'Modo Local', tus cambios solo se guardan en tu móvil hasta que otra persona entre online.",
      icon: Merge
    },
    {
      q: "¿Cómo hago una copia de seguridad total?",
      a: "En la sección 'Ajustes', puedes descargar un archivo JSON. Es recomendable que el Tesorero descargue uno cada noche y lo envíe al grupo de WhatsApp de la directiva.",
      icon: Database
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-500 px-4">
      
      {/* --- HERO HEADER --- */}
      <div className="mb-16 relative py-12 border-b-8 border-slate-900 overflow-hidden">
        <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none -mr-20 -mt-10">
           <Cpu size={500} className="rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <span className="bg-indigo-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.4em] shadow-xl">Manual de Usuario Oficial v2026.2</span>
             <div className="h-px w-20 bg-slate-200"></div>
             <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5 italic">
                Operativa Directiva Merello
             </span>
          </div>
          <h1 className="text-8xl font-black tracking-tighter uppercase leading-[0.85] italic">
            TECHNICAL<br/><span className="text-indigo-600">MANUAL</span>
          </h1>
          <p className="mt-8 text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Bienvenido al cerebro de la Falla. Este documento detalla cada rincón de la aplicación para que la directiva gestione la comisión con precisión militar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- SIDEBAR NAVIGATION --- */}
        <div className="lg:col-span-3 space-y-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Módulos de la App</p>
           <button
              onClick={() => setActiveSection('intro')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${activeSection === 'intro' ? 'bg-white border-indigo-600 shadow-lg translate-x-2' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/50'}`}
            >
               <div className={`p-2 rounded-lg ${activeSection === 'intro' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <BookOpen size={20} />
               </div>
               <span className="text-sm font-black uppercase tracking-tight">Introducción</span>
           </button>
           {fullGuide.map(mod => (
              <button
                key={mod.id}
                onClick={() => setActiveSection(mod.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${activeSection === mod.id ? 'bg-white border-indigo-600 shadow-lg translate-x-2' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/50'}`}
              >
                 <div className={`p-2 rounded-lg ${activeSection === mod.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <mod.icon size={20} />
                 </div>
                 <span className={`text-sm font-black uppercase tracking-tight ${activeSection === mod.id ? 'text-slate-900' : 'text-slate-500'}`}>{mod.title.split('.')[1].split('(')[0]}</span>
              </button>
           ))}
           <div className="pt-8">
              <button
                onClick={() => setActiveSection('sync')}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${activeSection === 'sync' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-transparent border-transparent text-slate-500'}`}
              >
                 <RefreshCw size={20} />
                 <span className="text-sm font-black uppercase tracking-tight">Sincronización P2P</span>
              </button>
           </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="lg:col-span-9">
           
           {/* INTRO SECTION */}
           {activeSection === 'intro' && (
              <div className="bg-white rounded-[48px] p-12 border-2 border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-right-4">
                 <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600">
                    <Fingerprint size={40} />
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">¿Qué es Merello Planner?</h2>
                 <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    Es una herramienta de <strong>gestión de recursos</strong> diseñada para que la Falla Merello funcione como una empresa de alto rendimiento durante la semana fallera.
                    <br/><br/>
                    La aplicación elimina las libretas, los tickets perdidos y la desinformación. Todo lo que ocurre en el Casal (gastos, tareas, suministros) queda registrado y compartido al instante con el resto de la directiva.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="p-8 bg-slate-900 rounded-[32px] text-white">
                       <h4 className="font-black uppercase text-xs tracking-widest mb-3 text-indigo-400">Objetivo 1</h4>
                       <p className="text-sm font-medium opacity-80 italic">Que el presupuesto no se descontrole y la falla acabe el año con salud financiera.</p>
                    </div>
                    <div className="p-8 bg-indigo-600 rounded-[32px] text-white">
                       <h4 className="font-black uppercase text-xs tracking-widest mb-3 text-indigo-100">Objetivo 2</h4>
                       <p className="text-sm font-medium opacity-80 italic">Que el trabajo se reparta de forma justa y nadie de la junta se "queme" por exceso de carga.</p>
                    </div>
                 </div>
              </div>
           )}

           {/* MODULE DETAIL SECTIONS */}
           {fullGuide.map(mod => activeSection === mod.id && (
              <div key={mod.id} className="space-y-8 animate-in slide-in-from-right-4">
                 <div className="bg-white rounded-[48px] p-12 border-2 border-slate-100 shadow-sm relative overflow-hidden">
                    <div className={`p-5 rounded-3xl inline-flex bg-slate-50 ${mod.color} mb-8 border border-slate-100 shadow-inner`}>
                       <mod.icon size={48} />
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">{mod.title}</h2>
                    <p className="text-xl text-slate-500 font-medium max-w-3xl leading-relaxed mb-12">
                       {mod.description}
                    </p>

                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                       <Database size={16} fill="currentColor"/> Diccionario de Datos y Funciones
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                       {mod.points.map((dp, i) => (
                          <div key={i} className="p-8 bg-slate-50 rounded-[40px] border border-slate-200 group hover:bg-white hover:border-indigo-300 transition-all">
                             <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                                <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                   <Zap size={14}/>
                                </div>
                                <p className={`text-sm font-black uppercase tracking-widest ${mod.color}`}>{dp.label}</p>
                             </div>
                             <p className="text-base text-slate-600 font-medium leading-relaxed italic ml-0 md:ml-12">{dp.detail}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           ))}

           {/* SYNC SECTION */}
           {activeSection === 'sync' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="bg-slate-900 text-white rounded-[48px] p-12 mb-12 relative overflow-hidden">
                    <h2 className="text-4xl font-black tracking-tighter italic uppercase relative z-10">Motor de Fusión y Alertas</h2>
                    <p className="text-slate-400 font-medium mt-2 relative z-10">Cómo funciona la sincronización P2P y las notificaciones Ntfy (N2FI).</p>
                    <Wifi size={180} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {syncGuide.map((faq, i) => (
                       <div key={i} className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-4">
                          <div className="flex items-center gap-4 mb-2">
                             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <faq.icon size={24} />
                             </div>
                             <h4 className="text-xl font-black text-slate-800 leading-tight">{faq.q}</h4>
                          </div>
                          <p className="text-slate-500 font-medium leading-relaxed italic ml-16">{faq.a}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

        </div>
      </div>

      {/* --- MASTER FOOTER --- */}
      <div className="mt-24 p-16 bg-slate-950 rounded-[64px] text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <ShieldCheck size={300} />
        </div>
        <div className="flex-1 space-y-6 relative z-10">
          <h3 className="text-5xl font-black italic tracking-tighter leading-none">¿Sigues con <span className="text-indigo-500">Dudas?</span></h3>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl font-medium">
            Pulsa el botón de la <strong>IA Fallera (Chispas)</strong> en la esquina inferior derecha. Ella tiene acceso a todos los datos de tu falla y puede resolverte dudas específicas sobre el presupuesto o las recetas.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
           <button 
             onClick={() => window.print()} 
             className="px-12 py-6 bg-white text-slate-900 rounded-3xl font-black uppercase text-sm tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl flex items-center gap-3 active:scale-95"
           >
              <FileText size={20}/> Imprimir Manual PDF
           </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};
