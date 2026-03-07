import { UserRole, CustomPermission } from '../types';

/**
 * Role-Based Access Control (RBAC) Matrix
 * Defines which modules each role can access
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    // Full access roles
    ADMIN: ['*'],
    PRESIDENTE: ['*'],

    // Financial roles
    TESORERIA: [
        'dashboard',
        'help',
        'inventory',    // Presupuesto
        'cash',         // Tesorería
        'reports',      // Informes
        'bar-profit',   // Cierre de Caja
    ],

    // Logistics roles
    LOGISTICA: [
        'dashboard',
        'help',
        'purchase',     // Pedidos
        'shopping',     // Lista Compra
        'stock',        // Stock
        'suppliers',    // Proveedores
        'logistics',    // Tareas
    ],

    // Bar/Service roles
    BARRA: [
        'dashboard',
        'help',
        'bar',          // Turnos
        'bar-profit',   // Cierre Caja
        'stock',        // Stock (para ver bebidas)
        'kiosk',        // Modo Kiosko
    ],

    CAJERO: [
        'dashboard',
        'help',
        'bar-profit',   // Cierre Caja
        'kiosk',        // Kiosk Venta
    ],

    CAMARERO: [
        'dashboard',
        'help',
        'bar',          // Turnos
        'meals',        // Cocina
        'kiosk',        // Kiosk para tomar pedidos
    ],

    // General members
    FALLERO: [
        'dashboard',
        'help',
        'bar',          // Ver turnos de barra
        'work-groups',  // Grupos de trabajo
        'logistics',    // Sus tareas
        'meals',        // Menús
    ],

    // Kiosk-only roles (TPV)
    KIOSKO_VENTA: ['kiosk'],
    KIOSKO_CASAL: ['kiosk'],
};

/**
 * Check if a role can access a specific module
 * Supports custom permissions granted by admin
 */
export const canAccessModule = (
    role: UserRole | null,
    moduleId: string,
    userId?: string,
    customPermissions?: CustomPermission[]
): boolean => {
    if (!role) return false;

    // 1. Check base role permissions
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Wildcard grants access to everything
    if (permissions.includes('*')) return true;

    // Check specific role permission
    if (permissions.includes(moduleId)) return true;

    // 2. Check admin-granted custom permissions
    if (userId && customPermissions) {
        const userCustom = customPermissions.find(p => p.userId === userId);
        if (userCustom?.extraModules.includes(moduleId)) return true;
    }

    return false;
};

/**
 * Get user-friendly role label in Spanish
 */
export const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
        ADMIN: 'Administrador',
        PRESIDENTE: 'Presidente',
        TESORERIA: 'Tesorero/a',
        LOGISTICA: 'Logística',
        BARRA: 'Responsable Barra',
        CAJERO: 'Cajero/a',
        CAMARERO: 'Camarero/a',
        FALLERO: 'Fallero/a',
        KIOSKO_VENTA: 'TPV Venta',
        KIOSKO_CASAL: 'TPV Casal',
    };
    return labels[role] || role;
};

/**
 * Get all available modules for permissions UI
 */
export const getAllModules = () => [
    { id: 'dashboard', label: 'Inicio', category: 'core' },
    { id: 'help', label: 'Ayuda', category: 'core' },
    { id: 'inventory', label: 'Presupuesto', category: 'economy' },
    { id: 'cash', label: 'Tesorería', category: 'economy' },
    { id: 'reports', label: 'Informes', category: 'economy' },
    { id: 'purchase', label: 'Pedidos', category: 'supply' },
    { id: 'shopping', label: 'Lista Compra', category: 'supply' },
    { id: 'stock', label: 'Stock', category: 'supply' },
    { id: 'suppliers', label: 'Proveedores', category: 'supply' },
    { id: 'work-groups', label: 'Grupos Trabajo', category: 'ops' },
    { id: 'logistics', label: 'Tareas', category: 'ops' },
    { id: 'bar', label: 'Turnos', category: 'ops' },
    { id: 'bar-profit', label: 'Cierre Caja', category: 'ops' },
    { id: 'meals', label: 'Cocina', category: 'ops' },
    { id: 'hr', label: 'Censo', category: 'ops' },
    { id: 'tools', label: 'Calculadoras', category: 'tools' },
    { id: 'kiosk', label: 'Modo Kiosko', category: 'tools' },
    { id: 'settings-master', label: 'Ajustes', category: 'tools' },
];
