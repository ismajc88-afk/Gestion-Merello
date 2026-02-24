
import React, { useState, useMemo } from 'react';
import { AuditLogEntry, UserRole } from '../types';
import { History, Filter, Trash2 } from 'lucide-react';

interface Props {
    auditLog: AuditLogEntry[];
    onClearLog?: () => void;
}

const MODULE_LABELS: Record<string, string> = {
    cash: 'Tesorería',
    inventory: 'Presupuesto',
    stock: 'Stock',
    settings: 'Ajustes',
};

export const AuditLog: React.FC<Props> = ({ auditLog, onClearLog }) => {
    const [filterModule, setFilterModule] = useState('');
    const [filterRole, setFilterRole] = useState('');

    const filtered = useMemo(() => {
        return [...auditLog]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .filter(e => (filterModule ? e.module === filterModule : true))
            .filter(e => (filterRole ? e.userRole === filterRole : true));
    }, [auditLog, filterModule, filterRole]);

    const modules = [...new Set(auditLog.map(e => e.module))];
    const roles = [...new Set(auditLog.map(e => e.userRole))];

    const actionColor = (action: string) => {
        if (action.includes('ELIMINADA') || action.includes('ELIMINADO')) return 'text-rose-600 bg-rose-50';
        if (action.includes('AÑADIDO') || action.includes('CREADA')) return 'text-emerald-600 bg-emerald-50';
        return 'text-slate-600 bg-slate-100';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
                    <Filter size={14} className="text-slate-400" />
                    <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 outline-none">
                        <option value="">Todos los módulos</option>
                        {modules.map(m => <option key={m} value={m}>{MODULE_LABELS[m] ?? m}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
                    <Filter size={14} className="text-slate-400" />
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 outline-none">
                        <option value="">Todos los roles</option>
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {onClearLog && auditLog.length > 0 && (
                    <button onClick={() => { if (confirm('¿Vaciar el historial de auditoría?')) onClearLog(); }}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-xs font-black uppercase hover:bg-rose-100 transition-colors ml-auto">
                        <Trash2 size={14} /> Vaciar
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                    <History size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-sm">Sin entradas en el historial</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.slice(0, 100).map(entry => (
                        <div key={entry.id} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                            <div className="shrink-0 text-[10px] font-black text-slate-400 uppercase tabular-nums min-w-[120px]">
                                {new Date(entry.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                {' '}
                                {new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 shrink-0">
                                {entry.userRole}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${actionColor(entry.action)}`}>
                                {entry.action.split('_').join(' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-600 truncate flex-1">{entry.detail}</span>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">
                                {MODULE_LABELS[entry.module] ?? entry.module}
                            </span>
                        </div>
                    ))}
                    {filtered.length > 100 && (
                        <p className="text-center text-xs text-slate-400 font-bold pt-2">
                            Mostrando los 100 más recientes de {filtered.length} entradas totales.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
