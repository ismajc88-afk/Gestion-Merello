'use client';

import { useState } from 'react';

const MONTHLY_DATA = [
    { month: 'Mar 25', ingresos: 8200, gastos: 12500 },
    { month: 'Abr', ingresos: 4800, gastos: 3200 },
    { month: 'May', ingresos: 4500, gastos: 2800 },
    { month: 'Jun', ingresos: 5100, gastos: 3500 },
    { month: 'Jul', ingresos: 4200, gastos: 2100 },
    { month: 'Ago', ingresos: 3800, gastos: 1900 },
    { month: 'Sep', ingresos: 5500, gastos: 4200 },
    { month: 'Oct', ingresos: 6200, gastos: 5800 },
    { month: 'Nov', ingresos: 5800, gastos: 4100 },
    { month: 'Dic', ingresos: 7200, gastos: 6500 },
    { month: 'Ene 26', ingresos: 6800, gastos: 3200 },
    { month: 'Feb', ingresos: 4250, gastos: 2100 },
];

const EXPENSE_CATS = [
    { name: 'Monumentos', amount: 47500, color: '#f97316' },
    { name: 'Pirotecnia', amount: 8000, color: '#ef4444' },
    { name: 'Música', amount: 3200, color: '#8b5cf6' },
    { name: 'Catering', amount: 4800, color: '#10b981' },
    { name: 'Local', amount: 8000, color: '#3b82f6' },
    { name: 'Suministros', amount: 2600, color: '#eab308' },
    { name: 'Seguros', amount: 2800, color: '#ec4899' },
    { name: 'Otros', amount: 3920, color: '#64748b' },
];

const INCOME_CATS = [
    { name: 'Cuotas', amount: 69510, color: '#10b981' },
    { name: 'Subvenciones', amount: 11000, color: '#3b82f6' },
    { name: 'Bar', amount: 12500, color: '#f97316' },
    { name: 'Lotería', amount: 7200, color: '#eab308' },
    { name: 'Otros', amount: 4300, color: '#8b5cf6' },
];

const BALANCE_EVO = [
    { m: 'Mar', s: 5200 }, { m: 'Abr', s: 6800 }, { m: 'May', s: 8500 }, { m: 'Jun', s: 10100 },
    { m: 'Jul', s: 12200 }, { m: 'Ago', s: 14100 }, { m: 'Sep', s: 15400 }, { m: 'Oct', s: 15800 },
    { m: 'Nov', s: 17500 }, { m: 'Dic', s: 18200 }, { m: 'Ene', s: 21800 }, { m: 'Feb', s: 18450 },
];

const TOP_GASTOS = [
    { c: 'Artista Fallero — Pago 3/4', a: 12000, d: '15/01/26', cat: 'Monumentos' },
    { c: 'Artista Fallero — Pago 2/4', a: 10000, d: '15/11/25', cat: 'Monumentos' },
    { c: 'Artista Fallero — Pago 1/4', a: 10000, d: '15/07/25', cat: 'Monumentos' },
    { c: 'Artista Infantil — Pago final', a: 6000, d: '20/01/26', cat: 'Monumentos' },
    { c: 'Pirotecnia — Mascletà + Castillo', a: 5500, d: '10/02/26', cat: 'Pirotecnia' },
    { c: 'Artista Fallero — Anticipado', a: 6000, d: '01/04/25', cat: 'Monumentos' },
    { c: 'Artista Infantil — Parcial', a: 3500, d: '01/09/25', cat: 'Monumentos' },
    { c: 'Pirotecnia extra', a: 2500, d: '05/02/26', cat: 'Pirotecnia' },
    { c: 'Flores Ofrenda', a: 1800, d: '09/02/26', cat: 'Ofrenda' },
    { c: 'Catering Cena Navidad', a: 1680, d: '22/12/25', cat: 'Comidas' },
];

const COMP = [
    { c: 'Ingresos totales', cur: 66350, prev: 58200 },
    { c: 'Gastos totales', cur: 51900, prev: 54800 },
    { c: 'Resultado neto', cur: 14450, prev: 3400 },
    { c: 'Cuotas cobradas', cur: 69510, prev: 62100 },
    { c: 'Nº falleros', cur: 247, prev: 235 },
    { c: 'Coste monumento/fallero', cur: 192, prev: 204 },
];

const MAX_BAR = Math.max(...MONTHLY_DATA.flatMap(d => [d.ingresos, d.gastos]));
const MAX_S = Math.max(...BALANCE_EVO.map(b => b.s));
type V = 'general' | 'gastos' | 'ingresos' | 'evolucion' | 'comparativa';

function DonutChart({ cats, total }: { cats: { name: string; amount: number; color: string }[]; total: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
                width: 200, height: 200, borderRadius: '50%', margin: '20px 0', position: 'relative',
                background: `conic-gradient(${cats.map((c, i) => {
                    const st = cats.slice(0, i).reduce((s, x) => s + (x.amount / total) * 360, 0);
                    return `${c.color} ${st}deg ${st + (c.amount / total) * 360}deg`;
                }).join(',')})`,
            }}>
                <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 800 }}>{total.toLocaleString('es-ES')}€</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {cats.map(c => (
                    <span key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                        {c.name}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function ReportsPage() {
    const [view, setView] = useState<V>('general');
    const tI = MONTHLY_DATA.reduce((s, m) => s + m.ingresos, 0);
    const tG = MONTHLY_DATA.reduce((s, m) => s + m.gastos, 0);
    const tEC = EXPENSE_CATS.reduce((s, c) => s + c.amount, 0);
    const tIC = INCOME_CATS.reduce((s, c) => s + c.amount, 0);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📈 Informes & Estadísticas</h1>
                <p className="page-subtitle">Análisis financiero del ejercicio 2025-2026</p>
            </div>
            <div className="tabs" style={{ marginBottom: 24 }}>
                {([['general', '📊 Resumen'], ['gastos', '📤 Gastos'], ['ingresos', '📥 Ingresos'], ['evolucion', '📈 Evolución'], ['comparativa', '🔄 Comparativa']] as [V, string][]).map(([k, l]) => (
                    <button key={k} className={`tab ${view === k ? 'active' : ''}`} onClick={() => setView(k)}>{l}</button>
                ))}
            </div>

            {view === 'general' && (
                <div className="animate-fade-in">
                    <div className="stats-grid">
                        <div className="stat-card"><div className="stat-icon green">📥</div><div className="stat-value">{tI.toLocaleString('es-ES')}€</div><div className="stat-label">Total Ingresos</div></div>
                        <div className="stat-card"><div className="stat-icon orange">📤</div><div className="stat-value">{tG.toLocaleString('es-ES')}€</div><div className="stat-label">Total Gastos</div></div>
                        <div className="stat-card"><div className="stat-icon blue">💰</div><div className="stat-value" style={{ color: 'var(--accent-green)' }}>+{(tI - tG).toLocaleString('es-ES')}€</div><div className="stat-label">Resultado Neto</div></div>
                        <div className="stat-card"><div className="stat-icon purple">📊</div><div className="stat-value">{Math.round((tG / tI) * 100)}%</div><div className="stat-label">Ratio Gasto/Ingreso</div></div>
                    </div>
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 className="section-title" style={{ marginBottom: 24 }}>📊 Ingresos vs Gastos Mensuales</h3>
                        <div className="chart-bar-group">
                            {MONTHLY_DATA.map(d => (
                                <div key={d.month} className="chart-bar-col">
                                    <div className="chart-bar-pair">
                                        <div className="chart-bar income" style={{ height: `${(d.ingresos / MAX_BAR) * 160}px` }} title={`${d.ingresos}€`} />
                                        <div className="chart-bar expense" style={{ height: `${(d.gastos / MAX_BAR) * 160}px` }} title={`${d.gastos}€`} />
                                    </div>
                                    <span className="chart-bar-label">{d.month}</span>
                                </div>
                            ))}
                        </div>
                        <div className="chart-legend">
                            <span className="chart-legend-item"><span className="chart-legend-dot income" />Ingresos</span>
                            <span className="chart-legend-item"><span className="chart-legend-dot expense" />Gastos</span>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="section-title" style={{ marginBottom: 16 }}>📋 Detalle Mensual</h3>
                        <table className="data-table"><thead><tr><th>Mes</th><th style={{ textAlign: 'right' }}>Ingresos</th><th style={{ textAlign: 'right' }}>Gastos</th><th style={{ textAlign: 'right' }}>Resultado</th></tr></thead>
                            <tbody>{MONTHLY_DATA.map((d, i) => {
                                const r = d.ingresos - d.gastos; return (
                                    <tr key={i}><td style={{ fontWeight: 500 }}>{d.month}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--accent-green)', fontFamily: "'Outfit'" }}> +{d.ingresos.toLocaleString('es-ES')}€</td>
                                        <td style={{ textAlign: 'right', color: 'var(--accent-red)', fontFamily: "'Outfit'" }}>-{d.gastos.toLocaleString('es-ES')}€</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: "'Outfit'", color: r >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{r >= 0 ? '+' : ''}{r.toLocaleString('es-ES')}€</td></tr>);
                            })}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'gastos' && (
                <div className="animate-fade-in">
                    <div className="grid-2" style={{ marginBottom: 24 }}>
                        <div className="card"><h3 className="section-title">Distribución de Gastos</h3><DonutChart cats={EXPENSE_CATS} total={tEC} /></div>
                        <div className="card"><h3 className="section-title">Desglose</h3>
                            {EXPENSE_CATS.map(c => {
                                const p = Math.round((c.amount / tEC) * 100); return (
                                    <div key={c.name} className="budget-row"><div className="budget-row-header"><span>{c.name}</span><span style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{c.amount.toLocaleString('es-ES')}€</span></div>
                                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${p}%`, background: c.color }} /></div>
                                        <div className="budget-row-footer"><span>{p}%</span></div></div>);
                            })}
                        </div>
                    </div>
                    <div className="card"><h3 className="section-title" style={{ marginBottom: 16 }}>🔝 Top 10 Gastos</h3>
                        <table className="data-table"><thead><tr><th>#</th><th>Concepto</th><th>Cat.</th><th>Fecha</th><th style={{ textAlign: 'right' }}>Importe</th></tr></thead>
                            <tbody>{TOP_GASTOS.map((g, i) => (
                                <tr key={i}><td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>#{i + 1}</td><td style={{ fontWeight: 500 }}>{g.c}</td><td><span className="badge info">{g.cat}</span></td><td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{g.d}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: "'Outfit'", color: 'var(--accent-red)' }}>-{g.a.toLocaleString('es-ES')}€</td></tr>))}</tbody></table>
                    </div>
                </div>
            )}

            {view === 'ingresos' && (
                <div className="animate-fade-in grid-2">
                    <div className="card"><h3 className="section-title">Distribución de Ingresos</h3><DonutChart cats={INCOME_CATS} total={tIC} /></div>
                    <div className="card"><h3 className="section-title">Desglose</h3>
                        {INCOME_CATS.map(c => {
                            const p = Math.round((c.amount / tIC) * 100); return (
                                <div key={c.name} className="budget-row"><div className="budget-row-header"><span>{c.name}</span><span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent-green)' }}>{c.amount.toLocaleString('es-ES')}€</span></div>
                                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${p}%`, background: c.color }} /></div>
                                    <div className="budget-row-footer"><span>{p}%</span></div></div>);
                        })}
                    </div>
                </div>
            )}

            {view === 'evolucion' && (
                <div className="animate-fade-in">
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 className="section-title" style={{ marginBottom: 24 }}>📈 Evolución del Saldo</h3>
                        <div style={{ position: 'relative' }}>
                            <svg viewBox="0 0 600 200" preserveAspectRatio="none" style={{ width: '100%', height: 200 }}>
                                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(249,115,22,0.3)" /><stop offset="100%" stopColor="rgba(249,115,22,0)" /></linearGradient></defs>
                                <path d={`M ${BALANCE_EVO.map((b, i) => `${(i / 11) * 600},${200 - (b.s / MAX_S) * 180}`).join(' L ')} L 600,200 L 0,200 Z`} fill="url(#ag)" />
                                <path d={`M ${BALANCE_EVO.map((b, i) => `${(i / 11) * 600},${200 - (b.s / MAX_S) * 180}`).join(' L ')}`} fill="none" stroke="var(--accent-orange)" strokeWidth="2.5" />
                                {BALANCE_EVO.map((b, i) => (<circle key={i} cx={(i / 11) * 600} cy={200 - (b.s / MAX_S) * 180} r="4" fill="var(--accent-orange)" stroke="var(--bg-primary)" strokeWidth="2" />))}
                            </svg>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                {BALANCE_EVO.map(b => (<span key={b.m} style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.m}</span>))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'comparativa' && (
                <div className="animate-fade-in">
                    <div className="card"><table className="data-table"><thead><tr><th>Concepto</th><th style={{ textAlign: 'right' }}>2024-25</th><th style={{ textAlign: 'right' }}>2025-26</th><th style={{ textAlign: 'right' }}>Var.</th><th style={{ textAlign: 'right' }}>%</th></tr></thead>
                        <tbody>{COMP.map((c, i) => {
                            const d = c.cur - c.prev; const p = c.prev ? Math.round((d / c.prev) * 100) : 0; const pos = c.c.includes('Gastos') ? d <= 0 : d >= 0; return (
                                <tr key={i}><td style={{ fontWeight: 600 }}>{c.c}</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit'", color: 'var(--text-secondary)' }}>{c.prev.toLocaleString('es-ES')}</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit'", fontWeight: 700 }}>{c.cur.toLocaleString('es-ES')}</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit'", color: pos ? 'var(--accent-green)' : 'var(--accent-red)' }}>{d >= 0 ? '+' : ''}{d.toLocaleString('es-ES')}</td>
                                    <td style={{ textAlign: 'right' }}><span className={`badge ${pos ? 'success' : 'danger'}`}>{p >= 0 ? '+' : ''}{p}%</span></td></tr>);
                        })}</tbody></table>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button className="btn btn-secondary">📋 Exportar CSV</button>
                <button className="btn btn-primary">📄 Generar Informe PDF</button>
            </div>
        </div>
    );
}
