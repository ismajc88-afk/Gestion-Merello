
import React, { useState } from 'react';
import { AppData, Member, Task, Transaction } from '../types';
import { Download, Upload, Copy, Check, GitMerge, FileJson, Layers, RefreshCw, AlertTriangle, ArrowRight, Database, Split, X, CheckCircle2 } from 'lucide-react';

interface SyncProps {
  data: AppData;
  onImport: (newData: AppData) => void;
}

interface Conflict {
  type: string;
  id: string;
  name: string;
  local: any;
  incoming: any;
  resolution: 'LOCAL' | 'INCOMING' | null;
}

export const SyncModules: React.FC<SyncProps> = ({ data, onImport }) => {
  // Export State
  const [exportModules, setExportModules] = useState({
    finance: true,
    hr: true,
    logistics: true,
    settings: true
  });
  const [copied, setCopied] = useState(false);

  // Import State
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'MERGE' | 'REPLACE'>('MERGE');

  // Conflict Management
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflictUI, setShowConflictUI] = useState(false);
  const [previewStats, setPreviewStats] = useState<string | null>(null);

  // --- EXPORT LOGIC ---
  const getExportData = () => {
    let exportData: Partial<AppData> = {};

    if (exportModules.finance) {
      exportData = { ...exportData, transactions: data.transactions, budgetLines: data.budgetLines, budgetLimit: data.budgetLimit };
    }
    if (exportModules.hr) {
      exportData = { ...exportData, members: data.members, shifts: data.shifts };
    }
    if (exportModules.logistics) {
      exportData = { ...exportData, tasks: data.tasks, shoppingList: data.shoppingList, orders: data.orders, mealEvents: data.mealEvents, suppliers: data.suppliers };
    }

    return JSON.stringify(exportData, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportData());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([getExportData()], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `fallas_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
  };

  const handleClone = () => window.open(window.location.href, '_blank');

  // --- IMPORT & CONFLICT LOGIC ---

  const parseAndAnalyze = () => {
    if (!importText.trim()) return;
    try {
      const incoming = JSON.parse(importText);
      const memberCount = incoming.members?.length || 0;
      setPreviewStats(`Datos listos: ${memberCount} falleros, ${incoming.transactions?.length || 0} movimientos.`);
    } catch (e) {
      setPreviewStats("Error: JSON inválido");
    }
  };

  const detectConflicts = (incoming: Partial<AppData>) => {
    const foundConflicts: Conflict[] = [];

    // Helper to compare arrays
    const checkArray = (localArr: any[], incomingArr: any[], type: string, nameField: string) => {
      if (!incomingArr) return;
      incomingArr.forEach(incItem => {
        const localItem = localArr.find(l => l.id === incItem.id);
        if (localItem) {
          // If ID exists, check if content is different
          const localStr = JSON.stringify(localItem);
          const incStr = JSON.stringify(incItem);
          if (localStr !== incStr) {
            foundConflicts.push({
              type,
              id: incItem.id,
              name: (incItem as any)[nameField] || (incItem as any).description || (incItem as any).title || 'Item',
              local: localItem,
              incoming: incItem,
              resolution: null
            });
          }
        }
      });
    };

    checkArray(data.members, incoming.members || [], 'Fallero', 'name');
    checkArray(data.tasks, incoming.tasks || [], 'Tarea', 'title');
    checkArray(data.transactions, incoming.transactions || [], 'Movimiento', 'description');
    checkArray(data.shoppingList, incoming.shoppingList || [], 'Compra', 'name');

    return foundConflicts;
  };

  const initiateImport = () => {
    try {
      const incoming = JSON.parse(importText);

      if (importMode === 'REPLACE') {
        if (confirm("⚠️ SE BORRARÁN TODOS TUS DATOS. ¿Continuar?")) {
          onImport({ ...data, ...incoming });
          alert("Datos reemplazados.");
          setImportText('');
        }
        return;
      }

      // MERGE MODE
      const detected = detectConflicts(incoming);

      if (detected.length > 0) {
        setConflicts(detected);
        setShowConflictUI(true);
      } else {
        // No conflicts, direct merge
        finalizeMerge(incoming, []);
      }

    } catch (e) {
      alert("Error al leer el archivo.");
    }
  };

  const resolveConflict = (id: string, resolution: 'LOCAL' | 'INCOMING') => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, resolution } : c));
  };

  const finalizeMerge = (incoming: Partial<AppData>, resolvedConflicts: Conflict[]) => {
    const newState = { ...data };

    // Helper to merge arrays honoring resolution
    const mergeList = (key: keyof AppData) => {
      const localList = (data[key] as any[]) || [];
      const incomingList = (incoming[key] as any[]) || [];
      const mergedMap = new Map();

      // 1. Add all locals first
      localList.forEach(item => mergedMap.set(item.id, item));

      // 2. Add incoming (unless conflict resolved to LOCAL)
      incomingList.forEach(incItem => {
        const conflict = resolvedConflicts.find(c => c.id === incItem.id);
        if (conflict) {
          if (conflict.resolution === 'INCOMING') {
            mergedMap.set(incItem.id, incItem); // Overwrite with incoming
          }
          // If LOCAL, do nothing (keep local)
        } else {
          // No conflict, safe to add/overwrite (should technically be new if no conflict detected earlier)
          mergedMap.set(incItem.id, incItem);
        }
      });

      return Array.from(mergedMap.values());
    };

    // Apply merges
    if (incoming.members) newState.members = mergeList('members');
    if (incoming.tasks) newState.tasks = mergeList('tasks');
    if (incoming.transactions) newState.transactions = mergeList('transactions');
    if (incoming.shoppingList) newState.shoppingList = mergeList('shoppingList');
    if (incoming.orders) newState.orders = mergeList('orders');
    if (incoming.shifts) newState.shifts = mergeList('shifts');

    // Simple overwrites for settings if present
    if (incoming.budgetLimit) newState.budgetLimit = incoming.budgetLimit;

    onImport(newState);
    alert("✅ Sincronización completada con éxito.");
    setImportText('');
    setConflicts([]);
    setShowConflictUI(false);
  };

  // --- RENDER CONFLICT UI ---
  if (showConflictUI) {
    const allResolved = conflicts.every(c => c.resolution !== null);

    return (
      <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-red-600 flex items-center gap-2"><Split size={24} /> Conflictos Detectados ({conflicts.length})</h3>
            <p className="text-sm text-slate-500">Hay datos diferentes para el mismo registro. Tú decides cuál gana.</p>
          </div>
          <button onClick={() => setShowConflictUI(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {conflicts.map(c => (
            <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase bg-slate-200 px-2 py-0.5 rounded text-slate-600">{c.type}</span>
                <span className="font-bold text-slate-800">{c.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* LOCAL OPTION */}
                <button
                  onClick={() => resolveConflict(c.id, 'LOCAL')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${c.resolution === 'LOCAL' ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Mis Datos (Local)</span>
                    {c.resolution === 'LOCAL' && <CheckCircle2 size={16} className="text-blue-500" />}
                  </div>
                  <pre className="text-[10px] text-slate-600 overflow-x-hidden whitespace-pre-wrap">
                    {JSON.stringify(c.local, (key, value) => key === 'id' ? undefined : value, 2).replace(/"/g, '').replace(/{|}/g, '')}
                  </pre>
                </button>

                {/* INCOMING OPTION */}
                <button
                  onClick={() => resolveConflict(c.id, 'INCOMING')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${c.resolution === 'INCOMING' ? 'bg-green-50 border-green-500 shadow-md' : 'bg-white border-slate-200 hover:border-green-300'}`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Recibido (Importar)</span>
                    {c.resolution === 'INCOMING' && <CheckCircle2 size={16} className="text-green-500" />}
                  </div>
                  <pre className="text-[10px] text-slate-600 overflow-x-hidden whitespace-pre-wrap">
                    {JSON.stringify(c.incoming, (key, value) => key === 'id' ? undefined : value, 2).replace(/"/g, '').replace(/{|}/g, '')}
                  </pre>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={() => setShowConflictUI(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancelar</button>
          <button
            onClick={() => finalizeMerge(JSON.parse(importText), conflicts)}
            disabled={!allResolved}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Confirmar Cambios <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // --- NORMAL RENDER ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)] overflow-y-auto">

      {/* EXPORT */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Download className="text-blue-500" /> Enviar Datos</h3>
          <p className="text-slate-500 text-sm mt-1">Elige qué módulos quieres enviar a tus compañeros.</p>
        </div>

        <div className="space-y-4 mb-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['finance', 'hr', 'logistics'].map(mod => (
              <label key={mod} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${(exportModules as any)[mod] ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-200'}`}>
                <input type="checkbox" checked={(exportModules as any)[mod]} onChange={e => setExportModules({ ...exportModules, [mod]: e.target.checked })} className="accent-blue-600 w-5 h-5" />
                <span className="font-bold text-slate-700 capitalize">{mod === 'hr' ? 'RRHH / Censo' : mod === 'finance' ? 'Economía' : 'Logística'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <button onClick={handleCopy} className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
            {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? '¡Copiado!' : 'Copiar JSON'}
          </button>
          <div className="flex gap-3">
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50">
              <FileJson size={18} /> Bajar Archivo
            </button>
            <button onClick={handleClone} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 border border-blue-100">
              <Layers size={18} /> Clonar App
            </button>
          </div>
        </div>
      </div>

      {/* IMPORT */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Upload className="text-orange-500" /> Importar Datos</h3>
          <p className="text-slate-500 text-sm mt-1">Si hay conflictos, podrás elegir qué versión guardar.</p>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl mb-4 flex">
          <button onClick={() => setImportMode('MERGE')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${importMode === 'MERGE' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>
            <GitMerge size={16} /> Combinar (Smart)
          </button>
          <button onClick={() => setImportMode('REPLACE')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${importMode === 'REPLACE' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>
            <RefreshCw size={16} /> Reemplazar Todo
          </button>
        </div>

        <textarea
          className="flex-1 w-full p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none mb-4 resize-none"
          placeholder='Pega aquí el JSON...'
          value={importText}
          onChange={e => { setImportText(e.target.value); setPreviewStats(null); }}
          onBlur={parseAndAnalyze}
        />

        {previewStats && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${previewStats.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {previewStats.startsWith('Error') ? <AlertTriangle size={14} /> : <Database size={14} />}
            {previewStats}
          </div>
        )}

        <button
          onClick={initiateImport}
          disabled={!importText}
          className={`w-full py-4 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${importMode === 'REPLACE' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {importMode === 'MERGE' ? 'Analizar y Fusionar' : 'Reemplazar Todo'} <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
};
