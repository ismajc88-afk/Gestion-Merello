'use client';

import Link from 'next/link';

const MONTHLY_DATA = [
  { month: 'Mar', ingresos: 8200, gastos: 12500 },
  { month: 'Abr', ingresos: 4800, gastos: 3200 },
  { month: 'May', ingresos: 4500, gastos: 2800 },
  { month: 'Jun', ingresos: 5100, gastos: 3500 },
  { month: 'Jul', ingresos: 4200, gastos: 2100 },
  { month: 'Ago', ingresos: 3800, gastos: 1900 },
  { month: 'Sep', ingresos: 5500, gastos: 4200 },
  { month: 'Oct', ingresos: 6200, gastos: 5800 },
  { month: 'Nov', ingresos: 5800, gastos: 4100 },
  { month: 'Dic', ingresos: 7200, gastos: 6500 },
  { month: 'Ene', ingresos: 6800, gastos: 3200 },
  { month: 'Feb', ingresos: 4250, gastos: 2100 },
];

const MAX_BAR = Math.max(...MONTHLY_DATA.flatMap((d) => [d.ingresos, d.gastos]));

const MOROSOS = [
  { name: 'Eva Moreno', meses: 3, deuda: '255.00€' },
  { name: 'Andrés López', meses: 2, deuda: '170.00€' },
  { name: 'Sara Vidal', meses: 2, deuda: '170.00€' },
  { name: 'Miguel Sanz', meses: 1, deuda: '85.00€' },
  { name: 'Luis García', meses: 1, deuda: '85.00€' },
];

const ALERTS = [
  { type: 'danger', icon: '🔴', text: 'Partida "Pirotecnia" al 94% del presupuesto' },
  { type: 'warning', icon: '🟡', text: '27 cuotas de Febrero pendientes de cobro' },
  { type: 'warning', icon: '🟡', text: 'Factura Artista Fallero vence en 5 días' },
  { type: 'info', icon: '🔵', text: 'Fichero SEPA de Febrero listo para enviar' },
];

const LAST_MOVEMENTS = [
  { date: '10/02', concept: 'Cuota Feb — María García', amount: '+85.00€', type: 'ingreso' },
  { date: '09/02', concept: 'Proveedor — Flores Valencia', amount: '-1.800.00€', type: 'gasto' },
  { date: '09/02', concept: 'Cuota Feb — Pablo Martínez', amount: '+85.00€', type: 'ingreso' },
  { date: '08/02', concept: 'Alquiler carpa mascletà', amount: '-450.00€', type: 'gasto' },
  { date: '08/02', concept: 'Ticket cena — 12 pagos Stripe', amount: '+420.00€', type: 'ingreso' },
  { date: '07/02', concept: 'Material pirotecnia extra', amount: '-380.00€', type: 'gasto' },
];

const BUDGET_SUMMARY = [
  { partida: 'Monumento Mayor', presupuesto: 45000, ejecutado: 38000, color: 'var(--accent-orange)' },
  { partida: 'Monumento Infantil', presupuesto: 12000, ejecutado: 9500, color: 'var(--accent-blue)' },
  { partida: 'Pirotecnia', presupuesto: 8500, ejecutado: 8000, color: 'var(--accent-red)' },
  { partida: 'Música y Bandas', presupuesto: 6000, ejecutado: 3200, color: 'var(--accent-purple)' },
  { partida: 'Catering / Comidas', presupuesto: 12000, ejecutado: 4800, color: 'var(--accent-green)' },
];

export default function DashboardPage() {
  const totalIngresos = MONTHLY_DATA.reduce((s, m) => s + m.ingresos, 0);
  const totalGastos = MONTHLY_DATA.reduce((s, m) => s + m.gastos, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Dashboard Tesorería</h1>
        <p className="page-subtitle">Ejercicio 2025-2026 · Resumen financiero en tiempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid animate-fade-in">
        <div className="stat-card">
          <div className="stat-icon green">💶</div>
          <div className="stat-value">18.450€</div>
          <div className="stat-label">Saldo Actual</div>
          <div className="stat-change positive">↑ +2.150€ vs mes anterior</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📥</div>
          <div className="stat-value">{totalIngresos.toLocaleString('es-ES')}€</div>
          <div className="stat-label">Ingresos Ejercicio</div>
          <div className="stat-change positive">89% del presupuesto</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📤</div>
          <div className="stat-value">{totalGastos.toLocaleString('es-ES')}€</div>
          <div className="stat-label">Gastos Ejercicio</div>
          <div className="stat-change negative">72% del presupuesto</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-value">89%</div>
          <div className="stat-label">Cobro Cuotas Feb</div>
          <div className="stat-change negative">27 pendientes</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        {/* Chart: Ingresos vs Gastos 12 meses */}
        <div className="card animate-fade-in animate-fade-in-delay-1">
          <h3 className="section-title" style={{ marginBottom: 20 }}>📊 Ingresos vs Gastos (12 meses)</h3>
          <div className="chart-bar-group">
            {MONTHLY_DATA.map((d) => (
              <div key={d.month} className="chart-bar-col">
                <div className="chart-bar-pair">
                  <div className="chart-bar income" style={{ height: `${(d.ingresos / MAX_BAR) * 140}px` }} title={`${d.ingresos.toLocaleString('es-ES')}€`} />
                  <div className="chart-bar expense" style={{ height: `${(d.gastos / MAX_BAR) * 140}px` }} title={`${d.gastos.toLocaleString('es-ES')}€`} />
                </div>
                <span className="chart-bar-label">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span className="chart-legend-item"><span className="chart-legend-dot income" /> Ingresos</span>
            <span className="chart-legend-item"><span className="chart-legend-dot expense" /> Gastos</span>
          </div>
        </div>

        {/* Alertas */}
        <div className="card animate-fade-in animate-fade-in-delay-2">
          <h3 className="section-title" style={{ marginBottom: 16 }}>🚨 Alertas Financieras</h3>
          <div className="alert-list">
            {ALERTS.map((a, i) => (
              <div key={i} className={`alert-item alert-${a.type}`}>
                <span className="alert-icon">{a.icon}</span>
                <span>{a.text}</span>
              </div>
            ))}
          </div>

          <h3 className="section-title" style={{ marginTop: 24, marginBottom: 16 }}>⚠️ Top Morosos</h3>
          {MOROSOS.map((m, i) => (
            <div key={i} className="moroso-item">
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.meses} {m.meses === 1 ? 'mes' : 'meses'} sin pagar</div>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--accent-red)' }}>{m.deuda}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Summary */}
      <div className="card animate-fade-in animate-fade-in-delay-3" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="section-title" style={{ margin: 0 }}>📋 Resumen Presupuesto</h3>
          <Link href="/budget" className="btn btn-ghost" style={{ fontSize: 13 }}>Ver completo →</Link>
        </div>
        {BUDGET_SUMMARY.map((b, i) => {
          const pct = Math.round((b.ejecutado / b.presupuesto) * 100);
          return (
            <div key={i} className="budget-row">
              <div className="budget-row-header">
                <span className="budget-row-name">{b.partida}</span>
                <span className="budget-row-amounts">
                  <span style={{ color: pct >= 90 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{b.ejecutado.toLocaleString('es-ES')}€</span>
                  <span style={{ color: 'var(--text-muted)' }}> / {b.presupuesto.toLocaleString('es-ES')}€</span>
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${pct}%`,
                  background: pct >= 90 ? 'linear-gradient(90deg, var(--accent-red), var(--accent-orange))' : `linear-gradient(90deg, ${b.color}, ${b.color}88)`,
                }} />
              </div>
              <div className="budget-row-footer">
                <span>{pct}% ejecutado</span>
                <span>Disponible: {(b.presupuesto - b.ejecutado).toLocaleString('es-ES')}€</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Movements */}
      <div className="card animate-fade-in animate-fade-in-delay-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}>💶 Últimos Movimientos</h3>
          <Link href="/transactions" className="btn btn-ghost" style={{ fontSize: 13 }}>Ver todos →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th style={{ textAlign: 'right' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {LAST_MOVEMENTS.map((m, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{m.date}</td>
                <td>{m.concept}</td>
                <td style={{
                  textAlign: 'right',
                  fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  color: m.type === 'ingreso' ? 'var(--accent-green)' : 'var(--accent-red)',
                }}>
                  {m.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
