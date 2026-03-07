import React, { useState } from 'react';
import { ShoppingItem, Task, TaskStatus, Supplier, Member } from '../types';
import { CheckSquare, Square, MapPin, Sparkles, Phone, ExternalLink, Utensils, Wand2, ArrowLeft } from 'lucide-react';

interface LogisticsProps {
  shoppingList: ShoppingItem[];
  tasks: Task[];
  suppliers: Supplier[];
  members: Member[];
  onToggleItem: (id: string, cost?: number) => void;
  onAddTask: (title: string, assignee: string) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onRequestAISuggestion: () => void;
  onAutoFillBasics: () => void;
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
}

export const LogisticsModules: React.FC<LogisticsProps> = ({ 
  shoppingList, tasks, suppliers, onToggleItem, onAddTask, onUpdateTaskStatus, onRequestAISuggestion, onAutoFillBasics, onAddShoppingItem
}) => {
  const [activeTab, setActiveTab] = useState<'shopping' | 'kanban' | 'suppliers' | 'meals'>('shopping');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [mealPax, setMealPax] = useState(50);
  const [isSuperMode, setIsSuperMode] = useState(false);

  const handleCreateTask = () => {
    if (newTaskTitle && assignee) {
      onAddTask(newTaskTitle, assignee);
      setNewTaskTitle('');
      setAssignee('');
    }
  };

  const addRecipeIngredients = (type: 'paella' | 'torra') => {
    if (type === 'paella') {
      onAddShoppingItem({ name: 'Arroz Redondo', quantity: Math.ceil(mealPax * 0.1), unit: 'kg', location: 'Despensa' });
      onAddShoppingItem({ name: 'Pollo y Conejo', quantity: Math.ceil(mealPax * 0.25), unit: 'kg', location: 'Nevera' });
      onAddShoppingItem({ name: 'Verdura Paella', quantity: Math.ceil(mealPax * 0.15), unit: 'kg', location: 'Nevera' });
    } else {
      onAddShoppingItem({ name: 'Chuletas Cordero', quantity: mealPax * 2, unit: 'u', location: 'Nevera' });
      onAddShoppingItem({ name: 'Embutido', quantity: mealPax * 2, unit: 'u', location: 'Nevera' });
      onAddShoppingItem({ name: 'Pan', quantity: mealPax, unit: 'barras', location: 'Despensa' });
    }
    setActiveTab('shopping');
  };

  const handleItemClick = (item: ShoppingItem) => {
    if (item.checked) {
      // Just uncheck if already checked
      onToggleItem(item.id);
    } else {
      // Check if user wants to record expense
      const cost = prompt(`¿Cuánto ha costado: ${item.name}? (Deja en blanco para no descontar de caja)`);
      if (cost !== null && cost.trim() !== "") {
         onToggleItem(item.id, parseFloat(cost));
      } else {
         onToggleItem(item.id);
      }
    }
  };

  if (isSuperMode) {
    return (
       <div className="fixed inset-0 bg-white z-50 flex flex-col p-4 animate-in slide-in-from-bottom">
         <div className="flex justify-between items-center mb-6 bg-orange-600 -m-4 p-6 shadow-md text-white">
           <h2 className="text-3xl font-bold">MODO SÚPER</h2>
           <button onClick={() => setIsSuperMode(false)} className="bg-white/20 p-2 rounded-full"><ArrowLeft size={32}/></button>
         </div>
         <p className="text-center text-gray-500 mb-4 text-xl">Toca para tachar</p>
         <div className="flex-1 overflow-y-auto space-y-3">
            {shoppingList.filter(i => !i.checked).map(item => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="p-6 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-transform"
              >
                 <span className="text-2xl font-bold text-gray-800">{item.name}</span>
                 <span className="text-3xl font-black text-orange-600">{item.quantity} {item.unit}</span>
              </div>
            ))}
            {shoppingList.filter(i => !i.checked).length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl text-green-500 font-bold mb-4">¡TODO COMPRADO!</p>
                <p className="text-xl text-gray-400">Ya puedes ir a la caja.</p>
              </div>
            )}
         </div>
         <div className="mt-4 pt-4 border-t border-gray-100">
           <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-2">Ya comprado:</h3>
           {shoppingList.filter(i => i.checked).map(item => (
              <span key={item.id} onClick={() => onToggleItem(item.id)} className="inline-block bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-sm mr-2 mb-2 line-through cursor-pointer">
                {item.name}
              </span>
           ))}
         </div>
       </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
       <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('shopping')} className={`flex-1 py-2 px-4 rounded-lg font-bold text-center whitespace-nowrap ${activeTab === 'shopping' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border'}`}>
          Lista Compra
        </button>
        <button onClick={() => setActiveTab('kanban')} className={`flex-1 py-2 px-4 rounded-lg font-bold text-center whitespace-nowrap ${activeTab === 'kanban' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border'}`}>
          Tareas
        </button>
        <button onClick={() => setActiveTab('suppliers')} className={`flex-1 py-2 px-4 rounded-lg font-bold text-center whitespace-nowrap ${activeTab === 'suppliers' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border'}`}>
          Proveedores
        </button>
        <button onClick={() => setActiveTab('meals')} className={`flex-1 py-2 px-4 rounded-lg font-bold text-center whitespace-nowrap ${activeTab === 'meals' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border'}`}>
          Comidas
        </button>
      </div>

      {activeTab === 'shopping' && (
        <div className="bg-white rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-4 bg-orange-50 border-b border-orange-100 flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
               <h3 className="font-bold text-orange-900">Gestión de Compra</h3>
               <p className="text-xs text-orange-700">{shoppingList.filter(i => !i.checked).length} pendientes</p>
             </div>
             <div className="flex gap-2">
               <button onClick={onAutoFillBasics} className="flex items-center gap-1 text-xs bg-orange-200 text-orange-800 px-3 py-2 rounded-full hover:bg-orange-300 font-bold">
                 <Wand2 size={14} /> Básicos
               </button>
               <button onClick={() => setIsSuperMode(true)} className="flex items-center gap-1 text-xs bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-black font-bold shadow-lg transform hover:scale-105 transition-all">
                 📱 MODO SÚPER
               </button>
             </div>
          </div>
          <div className="overflow-y-auto p-2 space-y-2 flex-1">
            {shoppingList.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className={`p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all ${item.checked ? 'bg-gray-100 opacity-50' : 'bg-white border-l-4 border-orange-500 shadow-sm'}`}
              >
                <div className="flex items-center gap-3">
                  {item.checked ? <CheckSquare className="text-gray-400" /> : <Square className="text-orange-500" />}
                  <div>
                    <p className={`text-lg font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>{item.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} /> {item.location}
                    </div>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-700">{item.quantity} {item.unit}</span>
              </div>
            ))}
            {shoppingList.length === 0 && <div className="text-center p-8 text-gray-400">Lista vacía. ¡Añade básicos!</div>}
          </div>
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="flex flex-col h-full gap-4">
           <div className="bg-white p-4 rounded-xl shadow-sm flex gap-2">
             <input 
               value={newTaskTitle} 
               onChange={e => setNewTaskTitle(e.target.value)} 
               placeholder="Nueva tarea..." 
               className="flex-1 border rounded px-3 py-2" 
             />
             <input 
               value={assignee} 
               onChange={e => setAssignee(e.target.value)} 
               placeholder="Responsable" 
               className="w-1/3 border rounded px-3 py-2" 
             />
             <button onClick={handleCreateTask} className="bg-orange-600 text-white px-4 rounded font-bold">+</button>
             <button onClick={onRequestAISuggestion} className="bg-indigo-600 text-white px-3 rounded" title="Sugerir Tareas IA">
               <Sparkles size={18} />
             </button>
           </div>
           
           <div className="flex-1 overflow-x-auto">
             <div className="flex gap-4 h-full min-w-[800px]">
                {[TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map(status => (
                  <div key={status} className="flex-1 bg-gray-100 rounded-xl p-3 flex flex-col">
                    <h4 className="font-bold text-gray-700 mb-3 text-center uppercase text-sm tracking-wider">
                      {status === TaskStatus.PENDING && 'Pendiente'}
                      {status === TaskStatus.IN_PROGRESS && 'En Curso'}
                      {status === TaskStatus.DONE && 'Hecho'}
                    </h4>
                    <div className="space-y-2 overflow-y-auto flex-1">
                      {tasks.filter(t => t.status === status).map(task => (
                        <div key={task.id} className="bg-white p-3 rounded shadow-sm border border-gray-200">
                           <p className="font-medium text-gray-800">{task.title}</p>
                           <div className="flex justify-between items-end mt-2">
                             <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{task.assignee}</span>
                             <div className="flex gap-1">
                               {status !== TaskStatus.PENDING && (
                                 <button onClick={() => onUpdateTaskStatus(task.id, TaskStatus.PENDING)} className="text-xs p-1 bg-gray-200 hover:bg-gray-300 rounded">{'<'}</button>
                               )}
                               {status !== TaskStatus.DONE && (
                                 <button onClick={() => onUpdateTaskStatus(task.id, status === TaskStatus.PENDING ? TaskStatus.IN_PROGRESS : TaskStatus.DONE)} className="text-xs p-1 bg-orange-200 hover:bg-orange-300 rounded text-orange-800">{'>'}</button>
                               )}
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map(sup => (
            <div key={sup.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-800">{sup.name}</h4>
                <p className="text-sm text-gray-500">{sup.category}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                   <Phone size={12} /> {sup.phone}
                </div>
              </div>
              <a 
                href={`https://wa.me/${sup.phone.replace(/\s+/g, '')}?text=Hola, te contacto desde la Falla para un pedido.`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 shadow-lg"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          ))}
          {suppliers.length === 0 && <div className="col-span-2 text-center text-gray-400 py-8">No hay proveedores registrados.</div>}
        </div>
      )}

      {activeTab === 'meals' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
             <Utensils className="text-orange-500" /> Planificador de Comidas
           </h3>
           <div className="mb-6">
             <label className="block text-sm font-medium text-gray-700 mb-1">Número de Falleros</label>
             <input 
               type="range" min="10" max="300" value={mealPax} 
               onChange={e => setMealPax(parseInt(e.target.value))}
               className="w-full"
             />
             <p className="text-center font-bold text-2xl text-orange-600">{mealPax} pax</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => addRecipeIngredients('paella')} className="border-2 border-orange-100 p-4 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-colors text-left group">
               <h4 className="font-bold text-lg group-hover:text-orange-700">🥘 Paella Valenciana</h4>
               <p className="text-sm text-gray-500 mt-1">Añade automáticamente: Arroz, Pollo/Conejo, Verdura.</p>
             </button>
             <button onClick={() => addRecipeIngredients('torra')} className="border-2 border-red-100 p-4 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors text-left group">
               <h4 className="font-bold text-lg group-hover:text-red-700">🍖 Torrà (Barbacoa)</h4>
               <p className="text-sm text-gray-500 mt-1">Añade automáticamente: Chuletas, Embutido, Pan.</p>
             </button>
           </div>
        </div>
      )}
    </div>
  );
};