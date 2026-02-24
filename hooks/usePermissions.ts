import { AppConfig, UserRole, DEFAULT_ROLE_PERMISSIONS, ModulePermissions, ALL_MODULES } from '../types';

export const usePermissions = (config: AppConfig | undefined, role: UserRole | null, moduleId: string): ModulePermissions => {
    // 1. If no role or no config, fallback to default for that role or safe defaults
    if (!role) return { canView: false, canEdit: false, canViewSensitive: false };

    // 2. ADMIN always has full access to everything
    if (role === 'ADMIN') return { canView: true, canEdit: true, canViewSensitive: true };

    // 3. Get permissions for this role, falling back to defaults
    const rawPerms = config?.rolePermissions?.[role] ?? DEFAULT_ROLE_PERMISSIONS[role];

    // 4. Handle legacy string[] format -> Object format migration on the fly
    if (Array.isArray(rawPerms)) {
        const isAllowed = (rawPerms as string[]).includes(moduleId);
        return { canView: isAllowed, canEdit: isAllowed, canViewSensitive: isAllowed };
    }

    // 5. Normal Object lookup
    const permMap = rawPerms as Record<string, ModulePermissions>;
    return permMap[moduleId] ?? { canView: false, canEdit: false, canViewSensitive: false };
};
