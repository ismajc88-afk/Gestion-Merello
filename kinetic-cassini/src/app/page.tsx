'use client';

import { useEffect, useState } from 'react';

interface TreasurySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  memberCount: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateStr));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<TreasurySummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    memberCount: 0,
  });
  const [members, setMembers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, membersRes] = await Promise.all([
          fetch('/api/treasury'),
          fetch('/api/members'),
        ]);
        if (summaryRes.ok) {
          setSummary(await summaryRes.json());
        }
        if (membersRes.ok) {
          setMembers(await membersRes.json());
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="main-container">
      {/* Page Header */}
      <div className="page-header animate-in">
        <h1 className="page-title">Panel de Control</h1>
        <p className="page-subtitle">
          Vista general de tu Falla · {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card income animate-in animate-delay-1">
          <div className="stat-icon income">📈</div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {loading ? '—' : formatCurrency(summary.totalIncome)}
          </div>
          <div className="stat-label">Ingresos totales</div>
        </div>

        <div className="glass-card stat-card expense animate-in animate-delay-2">
          <div className="stat-icon expense">📉</div>
          <div className="stat-value" style={{ color: '#f87171' }}>
            {loading ? '—' : formatCurrency(summary.totalExpenses)}
          </div>
          <div className="stat-label">Gastos totales</div>
        </div>

        <div className="glass-card stat-card balance animate-in animate-delay-3">
          <div className="stat-icon balance">💰</div>
          <div className="stat-value">
            {loading ? '—' : formatCurrency(summary.balance)}
          </div>
          <div className="stat-label">Balance actual</div>
        </div>

        <div className="glass-card stat-card members animate-in animate-delay-4">
          <div className="stat-icon members">👥</div>
          <div className="stat-value" style={{ color: '#22d3ee' }}>
            {loading ? '—' : summary.memberCount}
          </div>
          <div className="stat-label">Falleros registrados</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Members Table */}
        <div className="glass-card table-container animate-in animate-delay-3">
          <div className="table-header">
            <h2 className="table-title">Falleros Recientes</h2>
            <button className="btn btn-primary">
              <span>+</span> Nuevo Fallero
            </button>
          </div>

          {members.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 8).map((member) => (
                  <tr key={member.id as string}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {member.firstName as string} {member.lastName as string}
                    </td>
                    <td>{member.dni as string}</td>
                    <td>
                      <span className="badge active">{member.category as string}</span>
                    </td>
                    <td>
                      <span className="badge active">
                        <span className="pulse-dot" style={{ marginRight: '0.4rem' }}></span>
                        Activo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👤</div>
              <p className="empty-state-text">
                Aún no hay falleros registrados
              </p>
              <button className="btn btn-primary">
                <span>+</span> Registrar primer fallero
              </button>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="glass-card activity-feed animate-in animate-delay-4">
          <div className="table-header">
            <h2 className="table-title">Actividad Reciente</h2>
          </div>

          <div className="activity-item">
            <div className="activity-dot info"></div>
            <div>
              <p className="activity-text">
                <strong>Sistema iniciado</strong> · Falla ERP preparado para la gestión
              </p>
              <p className="activity-time">Ahora</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-dot income"></div>
            <div>
              <p className="activity-text">
                Registra <strong>ingresos y gastos</strong> de tu Falla
              </p>
              <p className="activity-time">Empezar</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-dot expense"></div>
            <div>
              <p className="activity-text">
                Gestiona <strong>presupuestos</strong> y controla desviaciones
              </p>
              <p className="activity-time">Pendiente</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-dot info"></div>
            <div>
              <p className="activity-text">
                Organiza <strong>eventos</strong> y actividades de la comisión
              </p>
              <p className="activity-time">Pendiente</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
