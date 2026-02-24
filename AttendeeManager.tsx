
import React, { useState, useMemo } from 'react';
import { Member, Task, Shift, MealEvent } from '../types';
import { 
  Users, Search, Plus, Trash2, X, HeartPulse, UserPlus, 
  ChevronRight, CheckCircle2, Phone, FileText, Activity, 
  Moon, Sun, Sunset, Fingerprint, Award, Briefcase, Beer, 
  ShieldCheck, ArrowRightCircle, QrCode, Layout
} from 'lucide-react';

interface Props {
  members: Member[];
  tasks: Task[];
  shifts: Shift[];
  mealEvents?: MealEvent[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
}

export const AttendeeManager: React.FC<Props> = ({ members, tasks, shifts, mealEvents = [], onAddMember, onDeleteMember, onUpdateMember }) => {
  const [filter, setFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: '', role: 'Fallero', allergies: '', skills: '', emergency: '' });

  // --- LOGIC: INTELLIGENCE CORE ---
  const memberIntel = useMemo(() => {
    const intel: Record<string, any> = {};
    const todayStr = new Date().toISOString().split('T')[0];

    members.forEach(m => {
      const mTasks = tasks.filter(t => t.assigneeId === m.id || t.assignee === m.name);
      const mShifts = shifts.filter(s => s.assignedMembers.includes(m.name));
      const mMeals = mealEvents.filter(me => me.attendeeIds.includes(m.id));
      
      const karma = (mTasks.filter(t => t.isCompleted).length * 10) + (mShifts.length * 15);
      
      let rank = 'RECLUTA';
      if (karma > 150) rank = 'LEYENDA';
      else if (karma > 80) rank = 'ELITE';
      else if (karma > 30) rank = 'OPERATIVO';

      // Next activities in the next 24h
      const nextActions = [
        ...mTasks.filter(t => !t.isCompleted && t.deadline === todayStr).map(t => ({ label: t.title, type: 'TASK', time: 'Hoy' })),
        ...mShifts.filter(s => s.date === todayStr).map(s => ({ label: 'Turno Barra', type: 'SHIFT', time: s.time.split(' ')[0] }))
      ];

      intel[m.id] = { mTasks, mShifts, mMeals, karma, rank, nextActions };
    });
    return intel;
  }, [members, tasks, shifts, mealEvents]);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(filter.toLowerCase()) || 
    m.role.toLowerCase().includes(filter.toLowerCase()) ||
    m.skills?.some(s => s.toLowerCase().includes(filter.toLowerCase()))
  );

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const selectedIntel = selectedMember ? memberIntel[selectedMember.id] : null;

  const handleAdd = () => {
    if (!newMember.name) return;
    onAddMember({
      name: newMember.name,
      role: newMember.role,
      accessRole: 'FALLERO',
      paid: true,
      allergies: newMember.allergies ? newMember.allergies.split(',').map(s => s.trim()) : [],
      skills: newMember.skills ? newMember.skills.split(',').map(s => s.trim()) : [],
      emergencyContact: newMember.emergency,
      isPresent: false,
      preferences: { morning: true, afternoon: true, night: false },
      qrCodeValue: `FALLA-2026-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
    setNewMember({ name: '', role: 'Fallero', allergies: '', skills: '', emergency: '' });
    setShowAddForm(false);
  };

  const togglePreference = (memberId: string, time: 'morning' | 'afternoon' | 'night') => {
    const m = members.find(x => x.id === memberId);
    if (!m) return;
    const current = m.preferences || { morning: true, afternoon: true, night: true };
    onUpdateMember(memberId, { preferences: { ...current, [time]: !current[time] } });
  };

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6 animate-in fade-in duration-500 pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[32px] md:rounded-[48px] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/5 relative overflow-hidden shrink-0">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Users size={200} className="rotate-12" />
         </div>
         <div className="relative z-10 w-full md:w-auto">
            <div className="flex items-center gap-3 mb-2">
               <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">Censo 2026</span>
               <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  {members.length} Activos
               </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Personal</h2>
         </div>
         <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full md:w-auto bg-white text-slate-900 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 relative z-10"
         >
            <UserPlus size={18} /> <span className="md:hidden">Nuevo</span><span className="hidden md:inline">Reclutar Agente</span>
         </button>
      </div>

      {/* --- ADD FORM (Mobile Optimized) --- */}
      {showAddForm && (
        <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-indigo-100 animate-in slide-in-from-top-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-600"/> Alta Rápida
             </h3>
             <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} className="text-slate-500"/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nombre</label>
               <input placeholder="Ej. Vicent Aleixandre" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm" />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Rol</label>
               <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm">
                  <option value="Fallero">Fallero</option>
                  <option value="Junta">Junta</option>
                  <option value="Presidente">Presidente</option>
                  <option value="Cocinero">Cocinero</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Habilidades</label>
               <input placeholder="Paella, Electricidad..." value={newMember.skills} onChange={e => setNewMember({...newMember, skills: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm" />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Móvil SOS</label>
               <input placeholder="600..." value={newMember.emergency} onChange={e => setNewMember({...newMember, emergency: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm" />
            </div>
          </div>
          <button onClick={handleAdd} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Guardar Ficha</button>
        </div>
      )}

      {/* --- SEARCHBAR --- */}
      <div className="relative group shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
            type="text" 
            placeholder="Buscar fallero..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 shadow-sm font-bold text-slate-700 placeholder-slate-300 transition-all"
          />
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-10">
        {filteredMembers.map(member => {
          const intel = memberIntel[member.id];
          return (
            <div 
              key={member.id} 
              onClick={() => setSelectedMemberId(member.id)}
              className={`
                bg-white border-2 rounded-[32px] p-5 md:p-6 shadow-sm transition-all cursor-pointer relative group flex flex-col gap-4 active:scale-95
                ${member.isPresent ? 'border-emerald-400 ring-2 ring-emerald-50' : 'border-slate-100 hover:border-indigo-200'}
              `}
            >
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${member.isPresent ? 'bg-emerald-500' : 'bg-slate-900'}`}>
                       {member.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-black text-slate-900 text-lg leading-tight mb-1 truncate max-w-[140px]">{member.name}</h3>
                       <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">{member.role}</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-black uppercase ${intel.rank === 'LEYENDA' ? 'text-amber-500' : 'text-slate-400'}`}>{intel.rank}</span>
                    {member.isPresent && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-1"></span>}
                 </div>
              </div>

              <div className="space-y-3">
                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[9px] font-bold text-slate-400 uppercase">Karma</span>
                       <span className="text-[9px] font-black text-slate-600">{intel.karma} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min((intel.karma/200)*100, 100)}%` }}></div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <div className="flex gap-4">
                       <div className="text-center">
                          <span className="text-sm font-black text-slate-800 block leading-none">{intel.mTasks.filter((t:any)=>t.isCompleted).length}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Misiones</span>
                       </div>
                       <div className="text-center">
                          <span className="text-sm font-black text-slate-800 block leading-none">{intel.mShifts.length}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Turnos</span>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL DETALLE (FULLSCREEN ON MOBILE) --- */}
      {selectedMember && (
         <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-6 animate-in slide-in-from-bottom-10">
            <div className="bg-white w-full h-[95vh] md:h-[90vh] max-w-5xl rounded-t-[32px] md:rounded-[48px] shadow-2xl flex flex-col overflow-hidden relative">
               
               {/* MODAL HEADER */}
               <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-lg ${selectedMember.isPresent ? 'bg-emerald-500' : 'bg-slate-900'}`}>
                        {selectedMember.name.charAt(0)}
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider">{selectedMember.role}</span>
                           {selectedMember.isPresent && <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Presente</span>}
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">{selectedMember.name}</h3>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                     <button 
                        onClick={() => onUpdateMember(selectedMember.id, { isPresent: !selectedMember.isPresent })}
                        className={`flex-1 md:flex-none py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${selectedMember.isPresent ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}
                     >
                        {selectedMember.isPresent ? 'Marcar Salida' : 'Check-In'}
                     </button>
                     <button onClick={() => setSelectedMemberId(null)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"><X size={20}/></button>
                  </div>
               </div>

               {/* MODAL BODY (SCROLLABLE) */}
               <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                  
                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone size={10}/> Teléfono</p>
                        <p className="font-bold text-slate-800 text-sm">{selectedMember.emergencyContact || 'S/D'}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><HeartPulse size={10} className="text-rose-500"/> Salud</p>
                        <p className="font-bold text-rose-600 text-sm truncate">{selectedMember.allergies.join(', ') || 'OK'}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><QrCode size={10}/> ID</p>
                        <p className="font-mono font-bold text-slate-500 text-xs truncate">...{selectedMember.id.slice(-6)}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 cursor-pointer hover:bg-rose-50 hover:border-rose-200 transition-colors" onClick={() => { if(confirm('¿Borrar?')) { onDeleteMember(selectedMember.id); setSelectedMemberId(null); } }}>
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Trash2 size={10}/> Zona Roja</p>
                        <p className="font-bold text-rose-600 text-sm">Eliminar</p>
                     </div>
                  </div>

                  {/* Availability */}
                  <div>
                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Layout size={16} className="text-indigo-600"/> Disponibilidad</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                           { id: 'morning', label: 'Mañanas', icon: Sun },
                           { id: 'afternoon', label: 'Tardes', icon: Sunset },
                           { id: 'night', label: 'Noches', icon: Moon },
                        ].map(pref => (
                           <button 
                              key={pref.id}
                              onClick={() => togglePreference(selectedMember.id, pref.id as any)}
                              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${((selectedMember.preferences as any)?.[pref.id]) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'}`}
                           >
                              <div className="flex items-center gap-3">
                                 <pref.icon size={18}/>
                                 <span className="text-xs font-bold uppercase">{pref.label}</span>
                              </div>
                              {((selectedMember.preferences as any)?.[pref.id]) && <CheckCircle2 size={16} />}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={16} className="text-indigo-600"/> Actividad Reciente</h4>
                     <div className="space-y-4">
                        {selectedIntel?.nextActions.length === 0 ? (
                           <div className="text-center py-8 opacity-40">
                              <p className="text-xs font-bold text-slate-500">Sin actividad programada hoy</p>
                           </div>
                        ) : (
                           selectedIntel?.nextActions.map((act:any, i:number) => (
                              <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                 <div className={`p-2 rounded-lg ${act.type === 'TASK' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {act.type === 'TASK' ? <Briefcase size={16}/> : <Beer size={16}/>}
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-800">{act.label}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{act.time} • {act.type}</p>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  {/* Notes */}
                  <div>
                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={16} className="text-indigo-600"/> Notas Internas</h4>
                     <textarea 
                        className="w-full h-32 bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-700 border-2 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                        placeholder="Anotaciones sobre el fallero..."
                        value={selectedMember.notes || ''}
                        onChange={(e) => onUpdateMember(selectedMember.id, { notes: e.target.value })}
                     />
                  </div>

               </div>
            </div>
         </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </div>
  );
};
