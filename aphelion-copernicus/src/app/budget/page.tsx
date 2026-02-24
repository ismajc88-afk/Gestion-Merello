'use client';

import { useState } from 'react';

interface BudgetLine {
    id: number;
    partida: string;
    category: string;
    presupuesto: number;
    ejecutado: number;
    comprometido: number;
    icon: string;
}

const BUDGET_LINES: BudgetLine[] = [
    { id: 1, partida: 'Monumento Mayor', category: 'Monumentos', presupuesto: 45000, ejecutado: 38000, comprometido: 5000, icon: '🏛️' },
    { id: 2, partida: 'Monumento Infantil', category: 'Monumentos', presupuesto: 12000, ejecutado: 9500, comprometido: 1500, icon: '👧' },
    { id: 3, partida: 'Pirotecnia', category: 'Fiestas', presupuesto: 8500, ejecutado: 8000, comprometido: 0, icon: '🎆' },
    { id: 4, partida: 'Música y Bandas', category: 'Fiestas', presupuesto: 6000, ejecutado: 3200, comprometido: 2800, icon: '🎵' },
    { id: 5, partida: 'Catering y Comidas', category: 'Comidas', presupuesto: 12000, ejecutado: 4800, comprometido: 3000, icon: '🍽️' },
    { id: 6, partida: 'Iluminación', category: 'Fiestas', presupuesto: 4500, ejecutado: 4500, comprometido: 0, icon: '💡' },
    { id: 7, partida: 'Flores Ofrenda', category: 'Ofrenda', presupuesto: 2200, ejecutado: 1800, comprometido: 400, icon: '🌸' },
    { id: 8, partida: 'Indumentaria', category: 'Vestuario', presupuesto: 3500, ejecutado: 1200, comprometido: 800, icon: '👗' },
    { id: 9, partida: 'Seguros', category: 'Admin', presupuesto: 2800, ejecutado: 2800, comprometido: 0, icon: '🛡️' },
    { id: 10, partida: 'Alquiler local', category: 'Admin', presupuesto: 9600, ejecutado: 8000, comprometido: 1600, icon: '🏠' },
    { id: 11, partida: 'Suministros (luz, agua)', category: 'Admin', presupuesto: 3200, ejecutado: 2600, comprometido: 600, icon: '⚡' },
    { id: 12, partida: 'Material oficina', category: 'Admin', presupuesto: 500, ejecutado: 320, comprometido: 0, icon: '📎' },
    { id: 13, partida: 'Publicidad y cartelería', category: 'Comunicación', presupuesto: 1500, ejecutado: 900, comprometido: 300, icon: '📢' },
    { id: 14, partida: 'Actividades infantiles', category: 'Infantil', presupuesto: 2000, ejecutado: 800, comprometido: 500, icon: '🎠' },
    { id: 15, partida: 'Excursiones y viajes', category: 'Ocio', presupuesto: 3000, ejecutado: 1500, comprometido: 0, icon: '🚌' },
    { id: 16, partida: 'Imprevistos', category: 'Admin', presupuesto: 2500, ejecutado: 400, comprometido: 0, icon: '❓' },
];

const INCOME_LINES = [
    { partida: 'Cuotas Adultos', presupuesto: 69360, cobrado: 61710, icon: '👥' },
    { partida: 'Cuotas Infantil', presupuesto: 5400, cobrado: 5400, icon: '👧' },
    { partida: 'Cuotas Jubilados', presupuesto: 2400, cobrado: 2400, icon: '🧓' },
    { partida: 'Lotería', presupuesto: 8000, cobrado: 7200, icon: '🎰' },
    { partida: 'Subvención JCF', presupuesto: 5000, cobrado: 5000, icon: '🏛️' },
    { partida: 'Subvención Ayto.', presupuesto: 12000, cobrado: 6000, icon: '🏛️' },
    { partida: 'Barra / Bar', presupuesto: 15000, cobrado: 12500, icon: '🍺' },
    { partida: 'Rifas y sorteos', presupuesto: 3000, cobrado: 1800, icon: '🎟️' },
    { partida: 'Patrocinadores', presupuesto: 4000, cobrado: 2500, icon: '🤝' },
];

type View = 'gastos' | 'ingresos';

export default function BudgetPage() {
    const [view, setView] = useState<View>('gastos');
    const [category, setCategory] = useState('Todas');

    const totalPresupuesto = BUDGET_LINES.reduce((s, b) => s + b.presupuesto, 0);
    const totalEjecutado = BUDGET_LINES.reduce((s, b) => s + b.ejecutado, 0);
    const totalComprometido = BUDGET_LINES.reduce((s, b) => s + b.comprometido, 0);
    const totalDisponible = totalPresupuesto - totalEjecutado - totalComprometido;
    const pctGlobal = Math.round((totalEjecutado / totalPresupuesto) * 100);
    const alertLines = BUDGET_LINES.filter((b) => ((b.ejecutado + b.comprometido) / b.presupuesto) >= 0.9);

    const totalIngresoPres = INCOME_LINES.reduce((s, l) => s + l.presupuesto, 0);
    const totalIngresoCob = INCOME_LINES.reduce((s, l) => s + l.cobrado, 0);

    const categories = ['Todas', ...Array.from(new Set(BUDGET_LINES.map((b) => b.category)))];
    const filteredLines = category === 'Todas' ? BUDGET_LINES : BUDGET_LINES.filter((b) => b.category === category);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📋 Presupuesto</h1>
                <p className="page-subtitle">Control presupuestario del ejercicio 2025-2026</p>
            </div>

            {/* Summary cards */}
            <div className="stats-grid animate-fade-in">
                <div className="stat-card">
                    <div className="stat-icon blue">📋</div>
                    <div className="stat-value">{totalPresupuesto.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Presupuesto Total Gastos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">📤</div>
                    <div className="stat-value">{totalEjecutado.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Ejecutado</div>
                    <div className="stat-change negative">{pctGlobal}% del presupuesto</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">📝</div>
                    <div className="stat-value">{totalComprometido.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Comprometido</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Facturas pendientes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-value">{totalDisponible.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Disponible</div>
                    <div className="stat-change positive">{Math.round((totalDisponible / totalPresupuesto) * 100)}% libre</div>
                </div>
            </div>

            {/* Alerts */}
            {alertLines.length > 0 && (
                <div className="card animate-fade-in" style={{ marginBottom: 20, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.03)' }}>
                    <h4 style={{ color: 'var(--accent-red)', marginBottom: 12 }}>🚨 Partidas en riesgo (≥90% ejecutado)</h4>
                    {alertLines.map((b) => {
                        const totalUsed = b.ejecutado + b.comprometido;
                        const pct = Math.round((totalUsed / b.presupuesto) * 100);
                        return (
                            <div key={b.id} className="alert-item alert-danger" style={{ marginBottom: 6 }}>
                                <span>{b.icon} <strong>{b.partida}</strong> — {pct}% ({totalUsed.toLocaleString('es-ES')}€ de {b.presupuesto.toLocaleString('es-ES')}€)</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View toggle */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${view === 'gastos' ? 'active' : ''}`} onClick={() => setView('gastos')}>📤 Presupuesto de Gastos</button>
                <button className={`tab ${view === 'ingresos' ? 'active' : ''}`} onClick={() => setView('ingresos')}>📥 Presupuesto de Ingresos</button>
            </div>

            {view === 'gastos' && (
                <div className="animate-fade-in">
                    {/* Category filter */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                        {categories.map((c) => (
                            <button key={c} className={`tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)} style={{ padding: '6px 14px', fontSize: 12 }}>
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Partida</th>
                                    <th>Categoría</th>
                                    <th style={{ textAlign: 'right' }}>Presupuesto</th>
                                    <th style={{ textAlign: 'right' }}>Ejecutado</th>
                                    <th style={{ textAlign: 'right' }}>Comprometido</th>
                                    <th style={{ textAlign: 'right' }}>Disponible</th>
                                    <th style={{ width: 140 }}>% Ejecución</th>
                                    <th>Desviación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLines.map((b) => {
                                    const totalUsed = b.ejecutado + b.comprometido;
                                    const disp = b.presupuesto - totalUsed;
                                    const pct = Math.round((b.ejecutado / b.presupuesto) * 100);
                                    const pctTotal = Math.round((totalUsed / b.presupuesto) * 100);
                                    const deviation = totalUsed - b.presupuesto;
                                    return (
                                        <tr key={b.id}>
                                            <td style={{ fontSize: 20 }}>{b.icon}</td>
                                            <td style={{ fontWeight: 600 }}>{b.partida}</td>
                                            <td><span className="badge info" style={{ fontSize: 11 }}>{b.category}</span></td>
                                            <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif" }}>{b.presupuesto.toLocaleString('es-ES')}€</td>
                                            <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{b.ejecutado.toLocaleString('es-ES')}€</td>
                                            <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", color: 'var(--accent-yellow)' }}>{b.comprometido > 0 ? `${b.comprometido.toLocaleString('es-ES')}€` : '—'}</td>
                                            <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", color: disp <= 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{disp.toLocaleString('es-ES')}€</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div className="progress-bar" style={{ flex: 1 }}>
                                                        <div className="progress-fill" style={{
                                                            width: `${Math.min(pct, 100)}%`,
                                                            background: pctTotal >= 100 ? 'var(--accent-red)' : pctTotal >= 90 ? 'linear-gradient(90deg, var(--accent-orange), var(--accent-red))' : undefined,
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32, color: pctTotal >= 90 ? 'var(--accent-red)' : undefined }}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                {deviation >= 0 ? (
                                                    <span className="badge danger">+{deviation.toLocaleString('es-ES')}€</span>
                                                ) : (
                                                    <span className="badge success">{deviation.toLocaleString('es-ES')}€</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border-hover)' }}>
                                    <td></td>
                                    <td style={{ fontWeight: 800 }}>TOTAL</td>
                                    <td></td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{totalPresupuesto.toLocaleString('es-ES')}€</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{totalEjecutado.toLocaleString('es-ES')}€</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'var(--accent-yellow)' }}>{totalComprometido.toLocaleString('es-ES')}€</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'var(--accent-green)' }}>{totalDisponible.toLocaleString('es-ES')}€</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="progress-bar" style={{ flex: 1 }}>
                                                <div className="progress-fill" style={{ width: `${pctGlobal}%` }} />
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 800 }}>{pctGlobal}%</span>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {view === 'ingresos' && (
                <div className="animate-fade-in">
                    <div className="stats-grid" style={{ marginBottom: 20, gridTemplateColumns: '1fr 1fr' }}>
                        <div className="stat-card">
                            <div className="stat-icon blue">📥</div>
                            <div className="stat-value">{totalIngresoPres.toLocaleString('es-ES')}€</div>
                            <div className="stat-label">Ingresos Presupuestados</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div className="stat-value">{totalIngresoCob.toLocaleString('es-ES')}€</div>
                            <div className="stat-label">Ingresos Cobrados</div>
                            <div className="stat-change positive">{Math.round((totalIngresoCob / totalIngresoPres) * 100)}% cobrado</div>
                        </div>
                    </div>
                    <div className="card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Concepto</th>
                                    <th style={{ textAlign: 'right' }}>Presupuestado</th>
                                    <th style={{ textAlign: 'right' }}>Cobrado</th>
                                    <th style={{ textAlign: 'right' }}>Pendiente</th>
                                    <th style={{ width: 140 }}>% Cobro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {INCOME_LINES.map((l, i) => {
                                    const pct = Math.round((l.cobrado / l.presupuesto) * 100);
                                    const pendiente = l.presupuesto - l.cobrado;
                                    return (
                                        <tr key={i}>
                                            <td style={{ fontSize: 20 }}>{l.icon}</td>
                                            <td style={{ fontWeight: 600 }}>{l.partida}</td>
                                            <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif" }}>{l.presupuesto.toLocaleString('es-ES')}€</td>
                                            <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'var(--accent-green)' }}>{l.cobrado.toLocaleString('es-ES')}€</td>
                                            <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", color: pendiente > 0 ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
                                                {pendiente > 0 ? `${pendiente.toLocaleString('es-ES')}€` : '—'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div className="progress-bar" style={{ flex: 1 }}>
                                                        <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))' }} />
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border-hover)' }}>
                                    <td></td>
                                    <td style={{ fontWeight: 800 }}>TOTAL</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{totalIngresoPres.toLocaleString('es-ES')}€</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'var(--accent-green)' }}>{totalIngresoCob.toLocaleString('es-ES')}€</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'var(--accent-orange)' }}>{(totalIngresoPres - totalIngresoCob).toLocaleString('es-ES')}€</td>
                                    <td>
                                        <span style={{ fontSize: 12, fontWeight: 800 }}>{Math.round((totalIngresoCob / totalIngresoPres) * 100)}%</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
