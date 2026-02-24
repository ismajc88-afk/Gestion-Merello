'use client';

import { useState } from 'react';

type Tab = 'todos' | 'ingresos' | 'gastos' | 'sepa' | 'stripe' | 'cashless';

interface Transaction {
    id: number;
    date: string;
    concept: string;
    category: string;
    type: 'ingreso' | 'gasto';
    amount: number;
    method: 'SEPA' | 'Stripe' | 'Cashless' | 'Efectivo' | 'Transferencia';
    status: 'completado' | 'pendiente' | 'rechazado';
    fallero?: string;
}

const TRANSACTIONS: Transaction[] = [
    { id: 1, date: '10/02/2026', concept: 'Cuota Febrero', category: 'Cuotas', type: 'ingreso', amount: 85, method: 'SEPA', status: 'completado', fallero: 'María García' },
    { id: 2, date: '10/02/2026', concept: 'Cuota Febrero', category: 'Cuotas', type: 'ingreso', amount: 85, method: 'SEPA', status: 'completado', fallero: 'Pablo Martínez' },
    { id: 3, date: '10/02/2026', concept: 'Cuota Febrero', category: 'Cuotas', type: 'ingreso', amount: 85, method: 'Stripe', status: 'completado', fallero: 'Ana Torres' },
    { id: 4, date: '09/02/2026', concept: 'Factura Flores Valencia', category: 'Ofrenda', type: 'gasto', amount: 1800, method: 'Transferencia', status: 'completado' },
    { id: 5, date: '09/02/2026', concept: 'Cuota Febrero', category: 'Cuotas', type: 'ingreso', amount: 85, method: 'SEPA', status: 'pendiente', fallero: 'Carlos Ruiz' },
    { id: 6, date: '08/02/2026', concept: 'Alquiler carpa mascletà', category: 'Fiestas', type: 'gasto', amount: 450, method: 'Transferencia', status: 'completado' },
    { id: 7, date: '08/02/2026', concept: 'Tickets cena x12', category: 'Comidas', type: 'ingreso', amount: 420, method: 'Stripe', status: 'completado' },
    { id: 8, date: '07/02/2026', concept: 'Material pirotecnia extra', category: 'Pirotecnia', type: 'gasto', amount: 380, method: 'Efectivo', status: 'completado' },
    { id: 9, date: '07/02/2026', concept: 'Ventas barra sábado', category: 'Bar', type: 'ingreso', amount: 680, method: 'Cashless', status: 'completado' },
    { id: 10, date: '06/02/2026', concept: 'Recarga cashless x8', category: 'Cashless', type: 'ingreso', amount: 240, method: 'Cashless', status: 'completado' },
    { id: 11, date: '06/02/2026', concept: 'Factura electricista', category: 'Suministros', type: 'gasto', amount: 320, method: 'Transferencia', status: 'completado' },
    { id: 12, date: '05/02/2026', concept: 'Cuota Febrero', category: 'Cuotas', type: 'ingreso', amount: 85, method: 'SEPA', status: 'rechazado', fallero: 'Eva Moreno' },
    { id: 13, date: '05/02/2026', concept: 'Pago parcial Artista Fallero', category: 'Monumentos', type: 'gasto', amount: 8000, method: 'Transferencia', status: 'completado' },
    { id: 14, date: '04/02/2026', concept: 'Lotería — venta décimos', category: 'Lotería', type: 'ingreso', amount: 1200, method: 'Efectivo', status: 'completado' },
    { id: 15, date: '04/02/2026', concept: 'Cuota Febrero', category: 'Cuotas', type: 'ingreso', amount: 40, method: 'SEPA', status: 'completado', fallero: 'Laura Martínez' },
    { id: 16, date: '03/02/2026', concept: 'Seguro responsabilidad civil', category: 'Admin', type: 'gasto', amount: 890, method: 'Transferencia', status: 'completado' },
    { id: 17, date: '03/02/2026', concept: 'Ventas barra viernes', category: 'Bar', type: 'ingreso', amount: 520, method: 'Cashless', status: 'completado' },
    { id: 18, date: '02/02/2026', concept: 'Material oficina', category: 'Admin', type: 'gasto', amount: 45, method: 'Efectivo', status: 'completado' },
    { id: 19, date: '01/02/2026', concept: 'Alquiler local Febrero', category: 'Admin', type: 'gasto', amount: 800, method: 'SEPA', status: 'completado' },
    { id: 20, date: '01/02/2026', concept: 'Subvención JCF (parcial)', category: 'Subvenciones', type: 'ingreso', amount: 2500, method: 'Transferencia', status: 'completado' },
];

export default function TransactionsPage() {
    const [tab, setTab] = useState<Tab>('todos');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);

    const filtered = TRANSACTIONS.filter((t) => {
        if (tab === 'ingresos' && t.type !== 'ingreso') return false;
        if (tab === 'gastos' && t.type !== 'gasto') return false;
        if (tab === 'sepa' && t.method !== 'SEPA') return false;
        if (tab === 'stripe' && t.method !== 'Stripe') return false;
        if (tab === 'cashless' && t.method !== 'Cashless') return false;
        if (search && !t.concept.toLowerCase().includes(search.toLowerCase()) && !(t.fallero?.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    });

    const totalIngresos = filtered.filter((t) => t.type === 'ingreso' && t.status === 'completado').reduce((s, t) => s + t.amount, 0);
    const totalGastos = filtered.filter((t) => t.type === 'gasto' && t.status === 'completado').reduce((s, t) => s + t.amount, 0);
    const balance = totalIngresos - totalGastos;

    const tabs: { key: Tab; label: string }[] = [
        { key: 'todos', label: `Todos (${TRANSACTIONS.length})` },
        { key: 'ingresos', label: `Ingresos (${TRANSACTIONS.filter((t) => t.type === 'ingreso').length})` },
        { key: 'gastos', label: `Gastos (${TRANSACTIONS.filter((t) => t.type === 'gasto').length})` },
        { key: 'sepa', label: 'SEPA' },
        { key: 'stripe', label: 'Stripe' },
        { key: 'cashless', label: 'Cashless' },
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">💶 Movimientos</h1>
                <p className="page-subtitle">Extracto de ingresos y gastos</p>
            </div>

            {/* Summary */}
            <div className="stats-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-icon green">📥</div>
                    <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{totalIngresos.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Ingresos (filtrado)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">📤</div>
                    <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{totalGastos.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Gastos (filtrado)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">💰</div>
                    <div className="stat-value" style={{ color: balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{balance >= 0 ? '+' : ''}{balance.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Balance</div>
                </div>
            </div>

            {/* Controls */}
            <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input className="input" placeholder="🔍 Buscar concepto o fallero..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
                <div className="tabs" style={{ marginBottom: 0 }}>
                    {tabs.map((t) => (
                        <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
                    ))}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowForm(!showForm)}>+ Registrar</button>
                    <button className="btn btn-primary">📤 Exportar CSV</button>
                </div>
            </div>

            {/* New transaction form */}
            {showForm && (
                <div className="card animate-fade-in" style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>➕ Nuevo Movimiento</h3>
                    <div className="grid-2" style={{ gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Concepto</label>
                            <input className="input" placeholder="Descripción del movimiento" />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Importe (€)</label>
                            <input className="input" type="number" placeholder="0.00" />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Tipo</label>
                            <select className="input">
                                <option>Ingreso</option>
                                <option>Gasto</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Método de pago</label>
                            <select className="input">
                                <option>SEPA</option>
                                <option>Stripe</option>
                                <option>Cashless</option>
                                <option>Efectivo</option>
                                <option>Transferencia</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Categoría</label>
                            <select className="input">
                                <option>Cuotas</option>
                                <option>Monumentos</option>
                                <option>Pirotecnia</option>
                                <option>Fiestas</option>
                                <option>Comidas</option>
                                <option>Bar</option>
                                <option>Admin</option>
                                <option>Otros</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Fecha</label>
                            <input className="input" type="date" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                        <button className="btn btn-primary">💾 Guardar</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Concepto</th>
                            <th>Categoría</th>
                            <th>Método</th>
                            <th>Fallero</th>
                            <th style={{ textAlign: 'right' }}>Importe</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t) => (
                            <tr key={t.id}>
                                <td style={{ color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>{t.date}</td>
                                <td style={{ fontWeight: 500 }}>{t.concept}</td>
                                <td><span className="badge info" style={{ fontSize: 11 }}>{t.category}</span></td>
                                <td><span className={`badge ${t.method === 'SEPA' ? 'purple' : t.method === 'Stripe' ? 'info' : t.method === 'Cashless' ? 'warning' : 'success'}`} style={{ fontSize: 11 }}>{t.method}</span></td>
                                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.fallero || '—'}</td>
                                <td style={{
                                    textAlign: 'right',
                                    fontWeight: 700,
                                    fontFamily: "'Outfit', sans-serif",
                                    color: t.type === 'ingreso' ? 'var(--accent-green)' : 'var(--accent-red)',
                                }}>
                                    {t.type === 'ingreso' ? '+' : '-'}{t.amount.toLocaleString('es-ES')}€
                                </td>
                                <td>
                                    <span className={`badge ${t.status === 'completado' ? 'success' : t.status === 'pendiente' ? 'warning' : 'danger'}`}>
                                        {t.status === 'completado' ? '✓' : t.status === 'pendiente' ? '⏳' : '✗'} {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
