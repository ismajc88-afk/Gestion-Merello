'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { icon: '📊', label: 'Dashboard', href: '/' },
    { icon: '👥', label: 'Censo & Cuotas', href: '/census' },
    { icon: '📋', label: 'Presupuesto', href: '/budget' },
    { icon: '💶', label: 'Movimientos', href: '/transactions' },
    { icon: '📈', label: 'Informes', href: '/reports' },
    { icon: '⚙️', label: 'Configuración', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">💰</div>
                <div>
                    <div className="sidebar-title">Tesorería</div>
                    <div className="sidebar-subtitle">Falla · Control Financiero</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">Gestión</div>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                        <span className="nav-item-icon">{item.icon}</span>
                        <span className="nav-item-label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-avatar">TF</div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">Tesorero/a</div>
                    <div className="sidebar-user-role">Ejercicio 2025-2026</div>
                </div>
            </div>
        </aside>
    );
}
