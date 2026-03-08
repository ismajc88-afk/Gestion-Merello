
import React, { useState } from 'react';
import { Task, Member, TaskStatus } from '../types';
import {
   Briefcase, Plus,
   Clock, UtensilsCrossed,
   X, CheckSquare, Square, Navigation
} from 'lucide-react';
import { RecipeCalculator } from './logistics/RecipeCalculator';
import { PasacallesRoute } from './logistics/PasacallesRoute';
import { ShoppingItem } from '../types';

interface Props {
   tasks: Task[];
   members: Member[];
   onAddTask: (task: Partial<Task>) => void;
   onUpdateTask: (id: string, updates: Partial<Task>) => void;
   onDeleteTask: (id: string) => void;
   onAiSuggest: () => void;
   onAddShoppingItems?: (items: Omit<ShoppingItem, 'id' | 'checked'>[]) => void;
}

export const LogisticsManager: React.FC<Props> = ({ tasks, members, onAddTask, onUpdateTask, onDeleteTask, onAddShoppingItems }) => {
   // Filters
   const searchQuery = '';
   const priorityFilter = 'ALL';
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState<'TASKS' | 'RECIPES' | 'ROUTE'>('TASKS');

   const hapticClick = () => { if ("vibrate" in navigator) navigator.vibrate(20); };

   const [newTask, setNewTask] = useState<Partial<Task>>({
      title: '', description: '', priority: 'MEDIUM', assigneeId: '', deadline: '', tags: []
   });

   const selectedTask = tasks.find(t => t.id === selectedTaskId);

   const filteredTasks = tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
   });

   const backlogTasks = filteredTasks.filter(t => t.status === TaskStatus.PENDING && !t.isCompleted);
   const inProgressTasks = filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS && !t.isCompleted);
   const doneTasks = filteredTasks.filter(t => t.isCompleted || t.status === TaskStatus.DONE);

   const handleCreate = () => {
      if (!newTask.title) return;
      const assigneeName = members.find(m => m.id === newTask.assigneeId)?.name || '';
      onAddTask({ ...newTask, assignee: assigneeName, status: TaskStatus.PENDING });
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', deadline: '', tags: [] });
      hapticClick();
   };

   // handleAssign removed

   const toggleSubtask = (taskId: string, subtaskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.subtasks) return;
      const newSubs = task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
      onUpdateTask(taskId, { subtasks: newSubs });
      hapticClick();
   };

   const renderTaskCard = (task: Task) => {
      const subtasks = task.subtasks || [];
      const completedSubs = subtasks.filter(s => s.completed).length;

      return (
         <div key={task.id} onClick={() => { setSelectedTaskId(task.id); hapticClick(); }} className="group bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-300 transition-all relative cursor-pointer">
            <div className="absolute top-0 right-0 bg-slate-100 px-3 py-1 rounded-bl-xl text-[9px] font-black text-slate-500">
               {task.priority}
            </div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1">{task.title}</h4>
            {subtasks.length > 0 && (
               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(completedSubs / subtasks.length) * 100}%` }}></div>
               </div>
            )}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
               <span className="text-[10px] font-bold text-slate-400 uppercase">{task.assignee || 'Sin asignar'}</span>
               {task.deadline && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10} /> {task.deadline}</span>}
            </div>
         </div>
      );
   };

   return (
      <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
            <div>
               <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Briefcase size={24} className="text-indigo-600" /> Logística</h2>

               {/* TABS */}
               <div className="flex overflow-x-auto custom-scrollbar gap-2 mt-4 bg-slate-100 p-1 rounded-2xl w-full max-w-full">
                  <button
                     onClick={() => setActiveTab('TASKS')}
                     className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'TASKS' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'
                        }`}
                  >
                     <Briefcase size={14} className="inline mr-1" /> Tareas
                  </button>
                  <button
                     onClick={() => setActiveTab('RECIPES')}
                     className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'RECIPES' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'
                        }`}
                  >
                     <UtensilsCrossed size={14} className="inline mr-1" /> Calculadora Menús
                  </button>
                  <button
                     onClick={() => setActiveTab('ROUTE')}
                     className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'ROUTE' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'
                        }`}
                  >
                     <Navigation size={14} className="inline mr-1" /> Ruta Pasacalles
                  </button>
               </div>
            </div>

            {activeTab === 'TASKS' && (
               <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 flex items-center gap-2">
                  <Plus size={16} /> Nueva Tarea
               </button>
            )}
         </div>

         {activeTab === 'TASKS' ? (
            <div className="flex-1 overflow-hidden rounded-[40px] border border-slate-200 bg-slate-50/50 shadow-inner p-6 overflow-x-auto flex flex-col relative">
               <div className="flex gap-8 h-full min-w-[1000px] flex-1">
                  {[
                     { id: 'PENDING', label: 'Preparación', tasks: backlogTasks, color: 'slate' },
                     { id: 'IN_PROGRESS', label: 'En Curso', tasks: inProgressTasks, color: 'indigo' },
                     { id: 'DONE', label: 'Completado', tasks: doneTasks, color: 'emerald' }
                  ].map(col => (
                     <div key={col.id} className="flex-1 flex flex-col gap-4">
                        <h3 className="font-black text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full bg-${col.color}-500`}></div> {col.label}
                        </h3>
                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pb-32">
                           {col.tasks.map(renderTaskCard)}
                        </div>
                     </div>
                  ))}
               </div>

               {isModalOpen && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                     <div className="bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl space-y-6">
                        <h3 className="text-2xl font-black">Nueva Misión</h3>
                        <input autoFocus value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full p-4 bg-slate-50 rounded-xl font-bold" placeholder="¿Qué hay que hacer?" />
                        <select value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })} className="w-full p-4 bg-slate-50 rounded-xl font-bold">
                           <option value="">Sin asignar</option>
                           {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <button onClick={handleCreate} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">Crear Tarea</button>
                     </div>
                  </div>
               )}

               {selectedTask && (
                  <div className="fixed inset-0 z-[200] flex justify-end bg-slate-950/20 backdrop-blur-sm">
                     <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right p-8">
                        <div className="flex justify-between items-center mb-8">
                           <h2 className="text-3xl font-black">{selectedTask.title}</h2>
                           <button onClick={() => setSelectedTaskId(null)}><X size={32} /></button>
                        </div>
                        <div className="space-y-6 flex-1">
                           <div>
                              <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Estado</label>
                              <select value={selectedTask.status} onChange={e => onUpdateTask(selectedTask.id, { status: e.target.value as any, isCompleted: e.target.value === 'DONE' })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold">
                                 <option value="PENDING">Pendiente</option>
                                 <option value="IN_PROGRESS">En Curso</option>
                                 <option value="DONE">Hecho</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Checklist</label>
                              <div className="space-y-2">
                                 {selectedTask.subtasks?.map(s => (
                                    <div key={s.id} onClick={() => toggleSubtask(selectedTask.id, s.id)} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
                                       {s.completed ? <CheckSquare className="text-emerald-500" /> : <Square className="text-slate-300" />}
                                       <span className={s.completed ? 'line-through text-slate-400' : 'font-bold'}>{s.title}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <button onClick={() => { onDeleteTask(selectedTask.id); setSelectedTaskId(null); hapticClick(); }} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-xs">Eliminar Tarea</button>
                     </div>
                  </div>
               )}
            </div>
         ) : activeTab === 'RECIPES' ? (
            <div className="flex-1 overflow-y-auto pb-32">
               <RecipeCalculator
                  onAddShoppingItems={onAddShoppingItems || (() => { })}
               />
            </div>
         ) : (
            <div className="flex-1 overflow-y-auto pb-32">
               <PasacallesRoute />
            </div>
         )}
      </div>
   );
};
