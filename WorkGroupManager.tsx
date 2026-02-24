
import React, { useState, useMemo } from 'react';
import { WorkGroup, Member, UserRole, WorkGroupTask } from '../types';
import { 
  Users, HardHat, Calendar, ChevronLeft, ChevronRight, Plus, 
  Crown, CheckSquare, Trash2, X, Edit3, Shield, Search, 
  ListChecks, AlertCircle, UserPlus, User, CheckCircle2
} from 'lucide-react';

interface Props {
  members: Member[];
  workGroups: WorkGroup[];
  onUpdateGroups: (groups: WorkGroup[]) => void;
  onAddMember: (member: Member) => void;
  userRole: UserRole;
}

export const WorkGroupManager: React.FC<Props> = ({ members, workGroups = [], onUpdateGroups, onAddMember, userRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  // Permissions
  const isReadOnly = userRole === 'FALLERO'; 

  const dateKey = currentDate.toISOString().split('T')[0];

  // --- FORM STATE ---
  const [name, setName] = useState('');
  const [responsibleId, setResponsibleId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState<WorkGroupTask[]>([]);
  
  // Helpers UI State
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [respSearch, setRespSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const dayGroups = useMemo(() => 
    workGroups.filter(g => g.date === dateKey), 
  [workGroups, dateKey]);

  const handleDateChange = (days: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + days);
    setCurrentDate(nextDate);
  };

  const handleOpenModal = (group?: WorkGroup) => {
    if (group) {
      setEditingGroupId(group.id);
      setName(group.name);
      setResponsibleId(group.responsibleId);
      setMemberIds(group.memberIds);
      setTasks(group.tasks ? [...group.tasks] : []);
    } else {
      setEditingGroupId(null);
      setName('');
      setResponsibleId('');
      setMemberIds([]);
      setTasks([]);
    }
    setNewTaskLabel('');
    setRespSearch('');
    setTeamSearch('');
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskLabel.trim()) return;
    setTasks([...tasks, { id: Date.now().toString() + Math.random(), label: newTaskLabel, completed: false }]);
    setNewTaskLabel('');
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const toggleMemberSelection = (id: string) => {
    if (id === responsibleId) return; 
    setMemberIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  // --- QUICK ADD LOGIC ---
  const handleQuickAdd = (searchName: string, type: 'RESPONSIBLE' | 'TEAM') => {
    const newMemberId = Date.now().toString();
    const newMember: Member = {
      id: newMemberId,
      name: searchName,
      paid: false,
      role: 'Fallero',
      accessRole: 'FALLERO',
      allergies: [],
      skills: [],
      emergencyContact: '',
      notes: 'Alta rápida desde Grupos de Trabajo',
      isPresent: false
    };

    onAddMember(newMember);

    if (type === 'RESPONSIBLE') {
      setResponsibleId(newMemberId);
      setRespSearch(''); 
    } else {
      setMemberIds(prev => [...prev, newMemberId]);
      setTeamSearch('');
    }
  };

  const handleSave = () => {
    if (!name || !responsibleId) {
        alert("Por favor, asigna un Nombre de grupo y un Responsable.");
        return;
    }

    const newGroup: WorkGroup = {
      id: editingGroupId || Date.now().toString(),
      date: dateKey,
      name,
      responsibleId,
      memberIds,
      tasks
    };

    if (editingGroupId) {
      onUpdateGroups(workGroups.map(g => g.id === editingGroupId ? newGroup : g));
    } else {
      onUpdateGroups([...workGroups, newGroup]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este grupo de trabajo?')) {
      onUpdateGroups(workGroups.filter(g => g.id !== id));
    }
  };

  const toggleTaskCompletion = (group: WorkGroup, taskId: string) => {
    const updatedTasks = group.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedGroup = { ...group, tasks: updatedTasks };
    onUpdateGroups(workGroups.map(g => g.id === group.id ? updatedGroup : g));
  };

  // Filter logic for modal
  const availableForResp = members.filter(m => m.name.toLowerCase().includes(respSearch.toLowerCase()));
  const availableForTeam = members.filter(m => m.name.toLowerCase().includes(teamSearch.toLowerCase()) && m.id !== responsibleId);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      
      {/* HEADER & DATE NAV */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
               <HardHat size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Grupos Operativos</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Organización Diaria</p>
            </div>
         </div>

         <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100">
            <button onClick={() => handleDateChange(-1)} className="p-3 bg-white rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"><ChevronLeft/></button>
            <div className="flex items-center gap-2 px-4 min-w-[160px] justify-center">
               <Calendar size={18} className="text-slate-400"/>
               <span className="font-black text-lg text-slate-800 uppercase italic">
                  {currentDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
               </span>
            </div>
            <button onClick={() => handleDateChange(1)} className="p-3 bg-white rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"><ChevronRight/></button>
         </div>

         {!isReadOnly && (
            <button onClick={() => handleOpenModal()} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2">
               <Plus size={16}/> Nuevo Grupo
            </button>
         )}
      </div>

      {/* GRID DE GRUPOS */}
      <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
         {dayGroups.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[40px]">
               <HardHat size={64} className="mb-4 opacity-50"/>
               <p className="font-black uppercase tracking-widest text-lg">Sin grupos asignados para hoy</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {dayGroups.map(group => {
                  const responsible = members.find(m => m.id === group.responsibleId);
                  const totalTasks = group.tasks?.length || 0;
                  const completedTasks = group.tasks?.filter(t => t.completed).length || 0;
                  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                  
                  return (
                     <div key={group.id} className="bg-white rounded-[40px] p-8 border-2 border-slate-100 shadow-sm relative group hover:border-indigo-200 hover:shadow-xl transition-all flex flex-col">
                        
                        {/* Header Grupo */}
                        <div className="flex justify-between items-start mb-6">
                           <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight max-w-[70%]">{group.name}</h3>
                           {!isReadOnly && (
                              <div className="flex gap-2">
                                 <button onClick={() => handleOpenModal(group)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"><Edit3 size={16}/></button>
                                 <button onClick={() => handleDelete(group.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                              </div>
                           )}
                        </div>

                        {/* Responsable */}
                        <div className="mb-6 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
                           <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                              <Crown size={24}/>
                           </div>
                           <div className="min-w-0">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Responsable (Cabo)</p>
                              <p className="font-bold text-slate-800 truncate">{responsible?.name || 'Sin Asignar'}</p>
                           </div>
                        </div>

                        {/* Progreso */}
                        <div className="mb-6">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                              <span className="text-slate-400">Progreso Misión</span>
                              <span className={progress === 100 ? 'text-emerald-500' : 'text-indigo-500'}>{progress.toFixed(0)}%</span>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }}></div>
                           </div>
                        </div>

                        {/* Tareas Interactivas */}
                        <div className="space-y-2 mb-6 flex-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ListChecks size={12}/> Tareas ({completedTasks}/{totalTasks})</p>
                           <ul className="space-y-1">
                              {group.tasks && group.tasks.map((task, i) => (
                                 <li 
                                    key={task.id || i} 
                                    onClick={() => toggleTaskCompletion(group, task.id)}
                                    className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-all ${task.completed ? 'bg-emerald-50/50 text-slate-400' : 'hover:bg-slate-50 text-slate-700'}`}
                                 >
                                    <div className={`mt-0.5 min-w-[16px] h-4 rounded border transition-colors flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                       {task.completed && <CheckSquare size={10} fill="currentColor" />}
                                    </div>
                                    <span className={`text-xs font-bold leading-tight ${task.completed ? 'line-through' : ''}`}>{task.label}</span>
                                 </li>
                              ))}
                              {(!group.tasks || group.tasks.length === 0) && <li className="text-xs text-slate-300 italic p-2">Sin tareas definidas</li>}
                           </ul>
                        </div>

                        {/* Miembros */}
                        <div className="mt-auto pt-4 border-t border-slate-50">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Users size={12}/> Equipo ({group.memberIds.length})</p>
                           <div className="flex flex-wrap gap-2">
                              {group.memberIds.map(mid => {
                                 const m = members.find(mem => mem.id === mid);
                                 if(!m) return null;
                                 return (
                                    <span key={mid} className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                                       {m.name.split(' ')[0]}
                                    </span>
                                 )
                              })}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>

      {/* MODAL CREAR/EDITAR AVANZADO */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden border-8 border-slate-900 animate-in zoom-in-95">
               
               {/* HEADER */}
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                     {editingGroupId ? 'Editar Grupo' : 'Crear Pelotón'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-full border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-colors"><X size={24}/></button>
               </div>

               <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                  
                  {/* LEFT COLUMN: BASIC INFO & RESPONSIBLE */}
                  <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r border-slate-100 space-y-8 custom-scrollbar h-full bg-white">
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Misión</label>
                        <input 
                           autoFocus
                           value={name}
                           onChange={e => setName(e.target.value)}
                           className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg outline-none focus:border-indigo-500 transition-colors"
                           placeholder="Ej. Montaje Carpa"
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Shield size={12}/> Seleccionar Responsable (Cabo)</label>
                        
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                           <input 
                              value={respSearch}
                              onChange={e => setRespSearch(e.target.value)}
                              placeholder="Buscar fallero..."
                              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
                           />
                        </div>

                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2 min-h-[100px] bg-slate-50 rounded-2xl p-2 border border-slate-100">
                           
                           {/* Quick Add Button */}
                           {respSearch.trim().length > 0 && (
                              <button 
                                onClick={() => handleQuickAdd(respSearch, 'RESPONSIBLE')}
                                className="w-full p-3 mb-2 rounded-xl bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
                              >
                                 <UserPlus size={16}/> Alta Rápida: "{respSearch}"
                              </button>
                           )}

                           {members.length === 0 && respSearch.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                                 <AlertCircle size={24} className="mb-2 opacity-50"/>
                                 <p className="text-xs font-bold">Censo vacío</p>
                                 <p className="text-[10px]">Escribe un nombre arriba para crearlo.</p>
                              </div>
                           )}
                           
                           {availableForResp.map(m => (
                              <button 
                                 key={m.id}
                                 onClick={() => { setResponsibleId(m.id); setMemberIds(prev => prev.filter(id => id !== m.id)); }}
                                 className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${responsibleId === m.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${responsibleId === m.id ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                       {m.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold truncate max-w-[120px]">{m.name}</span>
                                 </div>
                                 {responsibleId === m.id && <Crown size={16} fill="currentColor" className="text-yellow-400"/>}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4 pt-6 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ListChecks size={12}/> Lista de Tareas</label>
                        <div className="flex gap-2">
                           <input 
                              value={newTaskLabel}
                              onChange={e => setNewTaskLabel(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                              placeholder="Nueva tarea..."
                              className="flex-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                           />
                           <button onClick={handleAddTask} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><Plus size={18}/></button>
                        </div>
                        <ul className="space-y-2">
                           {tasks.map((task, i) => (
                              <li key={task.id || i} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                 <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                    <span className="text-xs font-bold text-slate-700">{task.label}</span>
                                 </div>
                                 <button onClick={() => handleRemoveTask(task.id)} className="text-slate-300 hover:text-rose-500"><X size={14}/></button>
                              </li>
                           ))}
                           {tasks.length === 0 && <p className="text-xs text-slate-300 italic text-center py-2">Añade tareas para el equipo</p>}
                        </ul>
                     </div>

                  </div>

                  {/* RIGHT COLUMN: TEAM SELECTION */}
                  <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-slate-50/50 space-y-6 custom-scrollbar h-full">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={12}/> Reclutar Equipo ({memberIds.length})</label>
                     </div>

                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                           value={teamSearch}
                           onChange={e => setTeamSearch(e.target.value)}
                           placeholder="Filtrar censo..."
                           className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
                        />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[100px]">
                        
                        {/* Quick Add Button Team */}
                        {teamSearch.trim().length > 0 && (
                           <button 
                             onClick={() => handleQuickAdd(teamSearch, 'TEAM')}
                             className="col-span-full p-3 mb-2 rounded-xl bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
                           >
                              <UserPlus size={16}/> Alta Rápida: "{teamSearch}"
                           </button>
                        )}

                        {members.length === 0 && teamSearch.length === 0 && (
                           <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-slate-400 opacity-60">
                              <User size={32} className="mb-2"/>
                              <p className="text-xs font-bold">Censo vacío</p>
                              <p className="text-[10px]">Escribe un nombre para crearlo.</p>
                           </div>
                        )}
                        
                        {availableForTeam.map(m => {
                           const isSelected = memberIds.includes(m.id);
                           return (
                              <button 
                                 key={m.id}
                                 onClick={() => toggleMemberSelection(m.id)}
                                 className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${isSelected ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                              >
                                 <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                    {isSelected && <CheckSquare size={10} />}
                                 </div>
                                 <div className="min-w-0">
                                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{m.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{m.role}</p>
                                 </div>
                              </button>
                           );
                        })}
                     </div>
                  </div>

               </div>

               {/* FOOTER */}
               <div className="p-6 border-t border-slate-100 bg-white flex justify-end shrink-0">
                  <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2">
                     <CheckCircle2 size={16}/> Guardar Configuración
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
