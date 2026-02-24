import React, { useState } from 'react';
import { Shield, RotateCcw, Check, ChevronDown, Users, Eye, Edit3, Lock } from 'lucide-react';
import { UserRole, ALL_MODULES, DEFAULT_ROLE_PERMISSIONS, AppConfig, ModulePermissions } from '../types';

interface RolePermissionsPanelProps {
    config: AppConfig;
    onUpdateConfig: (config: AppConfig) => void;
}

const ROLES: { id: UserRole; label: string; emoji: string }[] = [
    { id: 'ADMIN', label: 'Administrador', emoji: '👑' },
    { id: 'PRESIDENTE', label: 'Presidente', emoji: '🏛️' },
    { id: 'TESORERIA', label: 'Tesorería', emoji: '💰' },
    { id: 'LOGISTICA', label: 'Logística', emoji: '📦' },
    { id: 'BARRA', label: 'Barra', emoji: '🍺' },
    { id: 'CAMARERO', label: 'Camarero', emoji: '🧑‍🍳' },
    { id: 'CAJERO', label: 'Cajero', emoji: '🧾' },
    { id: 'FALLERO', label: 'Fallero', emoji: '🎇' },
    { id: 'KIOSKO_VENTA', label: 'Kiosko Venta', emoji: '💳' },
    { id: 'KIOSKO_CASAL', label: 'Kiosko Casal', emoji: '🏠' },
];

const SECTIONS = ['General', 'Economía', 'Logística', 'Operativa', 'Utilidades'];

// Handles backward compatibility from string[] to Object map
const getPermissions = (config: AppConfig, role: UserRole): Record<string, ModulePermissions> => {
    const raw = config.rolePermissions?.[role];
    if (!raw) return DEFAULT_ROLE_PERMISSIONS[role];

    // Legacy migration: if it's an array of strings, convert it
    if (Array.isArray(raw)) {
        const migrated: Record<string, ModulePermissions> = {};
        ALL_MODULES.forEach(m => {
            const isAllowed = raw.includes(m.id);
            migrated[m.id] = { canView: isAllowed, canEdit: isAllowed, canViewSensitive: isAllowed };
        });
        return migrated;
    }

    return raw as Record<string, ModulePermissions>;
};

export const RolePermissionsPanel: React.FC<RolePermissionsPanelProps> = ({ config, onUpdateConfig }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>('PRESIDENTE');
    const [saved, setSaved] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('General');

    const isAdmin = selectedRole === 'ADMIN';
    const currentPerms = getPermissions(config, selectedRole);

    const toggle = (moduleId: string, field: keyof ModulePermissions) => {
        if (isAdmin) return; // ADMIN always has all access

        const currentMatrix = { ...currentPerms };
        // Ensure the module exists in the matrix
        if (!currentMatrix[moduleId]) {
            currentMatrix[moduleId] = { canView: false, canEdit: false, canViewSensitive: false };
        }

        const newValue = !currentMatrix[moduleId][field];
        currentMatrix[moduleId] = { ...currentMatrix[moduleId], [field]: newValue };

        // Cascading logic: If you can't view, you can't edit or see sensitive data
        if (field === 'canView' && !newValue) {
            currentMatrix[moduleId].canEdit = false;
            currentMatrix[moduleId].canViewSensitive = false;
        }

        // Cascading logic: If you get edit/sensitive access, you must be able to view
        if ((field === 'canEdit' || field === 'canViewSensitive') && newValue) {
            currentMatrix[moduleId].canView = true;
        }

        save(currentMatrix);
    };

    const save = (permsMatrix: Record<string, ModulePermissions>) => {
        const updatedPerms = {
            ...(config.rolePermissions ?? DEFAULT_ROLE_PERMISSIONS),
            [selectedRole]: permsMatrix,
        } as Record<UserRole, Record<string, ModulePermissions>>;
        onUpdateConfig({ ...config, rolePermissions: updatedPerms });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const resetRole = () => {
        save(DEFAULT_ROLE_PERMISSIONS[selectedRole]);
    };

    const toggleAll = (enable: boolean) => {
        if (isAdmin) return;
        const matrix: Record<string, ModulePermissions> = {};
        ALL_MODULES.forEach(m => {
            // If turning off everything, only keep dashboard viewable
            if (!enable && m.id === 'dashboard') {
                matrix[m.id] = { canView: true, canEdit: false, canViewSensitive: false };
            } else {
                matrix[m.id] = { canView: enable, canEdit: enable, canViewSensitive: enable };
            }
        });
        save(matrix);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-base">Permisos por Rol</h3>
                        <p className="text-xs text-slate-400">El Admin controla qué modulo ve cada rol</p>
                    </div>
                </div>
                {saved && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 animate-in fade-in">
                        <Check size={12} /> Guardado
                    </div>
                )}
            </div>

            {/* Role selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {ROLES.map(role => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedRole === role.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                            }`}
                    >
                        <span>{role.emoji}</span>
                        <span>{role.label}</span>
                    </button>
                ))}
            </div>

            {/* Selected role info */}
            <div className={`p-4 rounded-2xl border-2 ${isAdmin ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{ROLES.find(r => r.id === selectedRole)?.emoji}</span>
                        <span className="font-black text-slate-900 text-sm">{ROLES.find(r => r.id === selectedRole)?.label}</span>
                        {isAdmin && (
                            <span className="text-[10px] bg-amber-200 text-amber-800 font-black px-2 py-0.5 rounded-full uppercase">Acceso Total Siempre</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isAdmin && (
                            <>
                                <button onClick={() => toggleAll(true)} className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">Todo ✓</button>
                                <button onClick={() => toggleAll(false)} className="text-[10px] font-black text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors">Ninguno ✗</button>
                                <button onClick={resetRole} className="flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                                    <RotateCcw size={10} /> Defecto
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {!isAdmin && (
                    <p className="text-[10px] text-slate-500 font-medium">
                        Solo los módulos habilitados ("Ver") aparecerán en el menú
                    </p>
                )}
                {isAdmin && (
                    <p className="text-xs text-amber-700 font-medium">
                        El rol ADMIN tiene acceso a todos los módulos siempre, por seguridad. No se puede restringir.
                    </p>
                )}
            </div>

            {/* Modules by section */}
            {!isAdmin && SECTIONS.map(section => {
                const sectionModules = ALL_MODULES.filter(m => m.section === section);
                if (!sectionModules.length) return null;
                const isExpanded = expandedSection === section;

                // Count how many modules have at least 'canView' enabled
                const enabledCount = sectionModules.filter(m => currentPerms[m.id]?.canView).length;

                return (
                    <div key={section} className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
                        <button
                            onClick={() => setExpandedSection(isExpanded ? null : section)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{section}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${enabledCount === sectionModules.length ? 'bg-emerald-100 text-emerald-700' :
                                    enabledCount === 0 ? 'bg-rose-100 text-rose-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {enabledCount}/{sectionModules.length}
                                </span>
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isExpanded && (
                            <div className="border-t border-slate-100 divide-y divide-slate-50">
                                {/* Header Row for Columns */}
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50">
                                    <div className="w-1/3 text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</div>
                                    <div className="w-2/3 flex justify-end gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-1 w-16 justify-center" title="Puede ver en el menú y acceder a la pantalla"><Eye size={12} /> Ver</div>
                                        <div className="flex items-center gap-1 w-16 justify-center" title="Puede añadir, modificar o borrar datos"><Edit3 size={12} /> Editar</div>
                                        <div className="flex items-center gap-1 w-16 justify-center" title="Puede ver totales y saldos económicos reales"><Lock size={12} /> Sensible</div>
                                    </div>
                                </div>

                                {sectionModules.map(module => {
                                    const modPerms = currentPerms[module.id] || { canView: false, canEdit: false, canViewSensitive: false };

                                    return (
                                        <div key={module.id} className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${modPerms.canView ? '' : 'opacity-60'}`}>
                                            <span className="w-1/3 text-sm font-semibold text-slate-700 truncate pr-2">{module.label}</span>

                                            <div className="w-2/3 flex justify-end gap-6">
                                                {/* CAN VIEW SWITCH */}
                                                <button onClick={() => toggle(module.id, 'canView')} className={`w-12 h-6 rounded-full transition-all duration-200 relative focus:outline-none ${modPerms.canView ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${modPerms.canView ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>

                                                {/* CAN EDIT SWITCH */}
                                                <button onClick={() => toggle(module.id, 'canEdit')} className={`w-12 h-6 rounded-full transition-all duration-200 relative focus:outline-none ${modPerms.canEdit ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${modPerms.canEdit ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>

                                                {/* CAN VIEW SENSITIVE SWITCH */}
                                                <button onClick={() => toggle(module.id, 'canViewSensitive')} className={`w-12 h-6 rounded-full transition-all duration-200 relative focus:outline-none ${modPerms.canViewSensitive ? 'bg-rose-500' : 'bg-slate-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${modPerms.canViewSensitive ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {isAdmin && (
                <div className="text-center py-6 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold text-slate-500">Selecciona otro rol para editar sus permisos</p>
                </div>
            )}
        </div>
    );
};
