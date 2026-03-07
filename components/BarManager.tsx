
import React, { useState, useEffect } from 'react';
import { Shift, ShiftTime, Member, UserRole } from '../types';
import { 
  Sparkles, Sun, Moon, Sunset, 
  Plus, X, Trash2, Activity, ChevronLeft, ChevronRight,
  
  Fingerprint
} from 'lucide-react';

interface Props {
  shifts: Shift[];
  members: Member[];
  onAutoAssign: () => void;
  onUpdateShift: (shiftId: string, updates: Partial<Shift>) => void;
  userRole?: UserRole;
  labels?: Record<string, string>;
  onAddDay: (date: string) => void;
}

export const BarManager: React.FC<Props> = ({ shifts, members, onAutoAssign, onUpdateShift, userRole, labels, onAddDay }) => {
  const dates = Array.from(new Set(shifts.map(s => s.date))).sort() as string[];
  const isReadOnly = userRole === 'FALLERO';
  const isAdmin = userRole === 'ADMIN';

  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [, setCurrentTime] = useState(new Date());
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDayDate, setNewDayDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeDate = dates[activeDateIndex];
  const editingShift = shifts.find(s => s.id === editingShiftId);

  const handleAddDay = () => {
     if(dates.includes(newDayDate)) { alert("Este día ya existe en el cuadrante."); return; }
     onAddDay(newDayDate);
     setShowAddDay(false);
     setActiveDateIndex(0); // Reset a la primera fecha para encontrar la nueva si se ordena
  };

  const getShiftLabel = (time: string) => {
     if(!labels) return time;
     if(time === ShiftTime.MORNING) return labels.MORNING;
     if(time === ShiftTime.AFTERNOON) return labels.AFTERNOON;
     if(time === ShiftTime.NIGHT) return labels.NIGHT;
     return time;
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700 bg-slate-50/30">
       <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center border border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
             <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-xl border border-indigo-400/30"><Fingerprint size={40} /></div>
             <div>
                <h2 className="text-4xl font-black tracking-tighter leading-none">Mando de Turnos</h2>
                <p className="text-slate-400 text-sm mt-2">Gestión dinámica de personal de servicio.</p>
             </div>
          </div>
          <div className="mt-8 md:mt-0 flex gap-2 relative z-10">
             {isAdmin && <button onClick={() => setShowAddDay(true)} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2"><Plus size={16}/> Añadir Día</button>}
             {!isReadOnly && <button onClick={onAutoAssign} className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"><Sparkles size={16} /> Optimizar</button>}
             <button onClick={() => setShowStats(!showStats)} className={`p-4 rounded-2xl border transition-all ${showStats ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}><Activity size={24} /></button>
          </div>
       </div>

       <div className="flex items-center gap-4 bg-white p-2 rounded-[32px] border border-slate-200 shadow-sm">
          <button onClick={() => setActiveDateIndex(Math.max(0, activeDateIndex - 1))} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft size={24}/></button>
          <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth p-1">
             {dates.map((date, idx) => (
                <button key={date} onClick={() => setActiveDateIndex(idx)} className={`min-w-[120px] flex flex-col items-center p-3 rounded-[24px] border-2 transition-all ${activeDateIndex === idx ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105 z-10' : 'bg-white border-transparent text-slate-400 hover:bg-slate-50'}`}>
                   <span className="text-[10px] font-black uppercase tracking-widest mb-1">{new Date(date).toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                   <span className="text-xl font-black tabular-nums">{new Date(date).getDate()}</span>
                </button>
             ))}
             {dates.length === 0 && <div className="text-slate-400 font-bold p-4">No hay días configurados. Usa "Añadir Día"</div>}
          </div>
          <button onClick={() => setActiveDateIndex(Math.min(dates.length - 1, activeDateIndex + 1))} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><ChevronRight size={24}/></button>
       </div>

       <div className="flex-1 overflow-y-auto pr-2 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {shifts.filter(s => s.date === activeDate).map((shift) => (
                <div key={shift.id} onClick={() => !isReadOnly && setEditingShiftId(shift.id)} className={`rounded-[48px] p-8 transition-all border-2 flex flex-col cursor-pointer hover:-translate-y-2 hover:shadow-2xl bg-white border-slate-100`}>
                   <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-5">
                         <div className="w-16 h-16 rounded-[28px] flex items-center justify-center bg-orange-50 text-orange-600">
                            {shift.time.includes('Noche') ? <Moon size={32}/> : shift.time.includes('Mañana') ? <Sun size={32}/> : <Sunset size={32}/>}
                         </div>
                         <h3 className="text-2xl font-black tracking-tighter leading-none">{getShiftLabel(shift.time).split('(')[0]}</h3>
                      </div>
                   </div>
                   <div className="flex-1 space-y-4">
                      {shift.assignedMembers.map(m => (
                         <div key={m} className="flex items-center justify-between p-3 rounded-[24px] border bg-slate-50 border-slate-200">
                            <span className="text-sm font-black">{m}</span>
                         </div>
                      ))}
                      {shift.assignedMembers.length === 0 && <p className="text-xs text-slate-300 italic p-2 border border-dashed rounded-xl">Sin asignar</p>}
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* MODAL AÑADIR DÍA */}
       {showAddDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
             <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl space-y-6">
                <h3 className="text-2xl font-black italic uppercase">Programar Jornada</h3>
                <div className="space-y-4">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha del Evento</label>
                   <input type="date" value={newDayDate} onChange={e=>setNewDayDate(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold" />
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setShowAddDay(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold uppercase text-xs">Cancelar</button>
                   <button onClick={handleAddDay} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase text-xs shadow-lg">Confirmar Día</button>
                </div>
             </div>
          </div>
       )}

       {/* MODAL EDITAR TURNO */}
       {editingShift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in p-4 overflow-hidden">
             <div className="bg-white rounded-[64px] w-full max-w-7xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-white/10">
                <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{getShiftLabel(editingShift.time).split('(')[0]}</h3>
                   <button onClick={() => setEditingShiftId(null)} className="p-6 bg-slate-200/50 hover:bg-slate-900 hover:text-white rounded-[32px] transition-all text-slate-500"><X size={40}/></button>
                </div>
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
                   <div className="w-full lg:w-[480px] bg-slate-50 border-r border-slate-200 flex flex-col p-10 overflow-y-auto">
                      <div className="space-y-6">
                         {editingShift.assignedMembers.map(m => (
                            <div key={m} className="bg-white p-6 rounded-[36px] border-2 border-slate-200 shadow-sm flex items-center justify-between font-black text-slate-900 text-xl">
                               <span>{m}</span>
                               <button onClick={() => onUpdateShift(editingShift.id, { assignedMembers: editingShift.assignedMembers.filter(name => name !== m) })} className="p-4 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={24}/></button>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="flex-1 flex flex-col bg-slate-100/50 p-12 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                         {members.filter(m => !editingShift.assignedMembers.includes(m.name)).map(member => (
                            <button key={member.id} onClick={() => onUpdateShift(editingShift.id, { assignedMembers: [...editingShift.assignedMembers, member.name] })} className="flex flex-col p-8 rounded-[48px] border-2 bg-white border-slate-200 hover:border-indigo-600 shadow-sm transition-all text-left">
                               <span className="font-black text-slate-900 text-2xl mb-2">{member.name}</span>
                               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{member.role}</span>
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
