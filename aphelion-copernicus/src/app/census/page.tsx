'use client';

import { useState } from 'react';

type Filter = 'todos' | 'pagado' | 'pendiente' | 'moroso';

const FALLEROS = [
    { id: 1, name: 'María García Torres', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'maria@email.com', phone: '612 345 678', joinYear: 2010 },
    { id: 2, name: 'Pablo Martínez López', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, false], email: 'pablo@email.com', phone: '623 456 789', joinYear: 2015 },
    { id: 3, name: 'Carlos Ruiz Sánchez', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, false, false], email: 'carlos@email.com', phone: '634 567 890', joinYear: 2018 },
    { id: 4, name: 'Lucía Fernández Gil', category: 'Infantil', cuota: 45, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'lucia@email.com', phone: '645 678 901', joinYear: 2020 },
    { id: 5, name: 'Ana Torres Pérez', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'ana@email.com', phone: '656 789 012', joinYear: 2008 },
    { id: 6, name: 'Eva Moreno Díaz', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, false, false, false], email: 'eva@email.com', phone: '667 890 123', joinYear: 2019 },
    { id: 7, name: 'Andrés López Vidal', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, false, false], email: 'andres@email.com', phone: '678 901 234', joinYear: 2016 },
    { id: 8, name: 'Sara Vidal Ruiz', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, false, false], email: 'sara@email.com', phone: '689 012 345', joinYear: 2017 },
    { id: 9, name: 'Miguel Ángel Sanz', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, false], email: 'miguel@email.com', phone: '690 123 456', joinYear: 2012 },
    { id: 10, name: 'Laura Martínez Roca', category: 'Jubilado', cuota: 40, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'laura@email.com', phone: '601 234 567', joinYear: 1995 },
    { id: 11, name: 'Francisco Pérez Gil', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'fran@email.com', phone: '612 345 001', joinYear: 2005 },
    { id: 12, name: 'Carmen Ruiz Torres', category: 'Infantil', cuota: 45, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'carmen@email.com', phone: '623 456 002', joinYear: 2021 },
    { id: 13, name: 'Luis García Mora', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, false], email: 'luis@email.com', phone: '634 567 003', joinYear: 2014 },
    { id: 14, name: 'Sandra López Díaz', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'sandra@email.com', phone: '645 678 004', joinYear: 2011 },
    { id: 15, name: 'Roberto Sanz Pérez', category: 'Adulto', cuota: 85, paid: [true, true, true, true, true, true, true, true, true, true, true, true], email: 'roberto@email.com', phone: '656 789 005', joinYear: 2009 },
];

const MONTHS_SHORT = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'];

function getStatus(paid: boolean[]): 'pagado' | 'pendiente' | 'moroso' {
    const unpaid = paid.filter((p) => !p).length;
    if (unpaid === 0) return 'pagado';
    if (unpaid >= 3) return 'moroso';
    return 'pendiente';
}

function getDebt(cuota: number, paid: boolean[]): number {
    return paid.filter((p) => !p).length * cuota;
}

export default function CensusPage() {
    const [filter, setFilter] = useState<Filter>('todos');
    const [search, setSearch] = useState('');

    const filtered = FALLEROS.filter((f) => {
        const status = getStatus(f.paid);
        if (filter !== 'todos' && status !== filter) return false;
        if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const totalFalleros = FALLEROS.length;
    const totalAdultos = FALLEROS.filter((f) => f.category === 'Adulto').length;
    const totalInfantil = FALLEROS.filter((f) => f.category === 'Infantil').length;
    const totalJubilados = FALLEROS.filter((f) => f.category === 'Jubilado').length;
    const totalDebt = FALLEROS.reduce((s, f) => s + getDebt(f.cuota, f.paid), 0);
    const totalCollected = FALLEROS.reduce((s, f) => s + f.paid.filter(Boolean).length * f.cuota, 0);
    const totalExpected = FALLEROS.reduce((s, f) => s + f.cuota * 12, 0);
    const pctCollected = Math.round((totalCollected / totalExpected) * 100);
    const morosos = FALLEROS.filter((f) => getStatus(f.paid) === 'moroso').length;
    const pendientes = FALLEROS.filter((f) => getStatus(f.paid) === 'pendiente').length;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">👥 Censo & Cuotas</h1>
                <p className="page-subtitle">Control de falleros y estado de cobro de cuotas</p>
            </div>

            {/* Stats */}
            <div className="stats-grid animate-fade-in">
                <div className="stat-card">
                    <div className="stat-icon blue">👥</div>
                    <div className="stat-value">{totalFalleros}</div>
                    <div className="stat-label">Total Censados</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{totalAdultos} adultos · {totalInfantil} infantil · {totalJubilados} jubilados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">💶</div>
                    <div className="stat-value">{totalCollected.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Cuotas Cobradas</div>
                    <div className="stat-change positive">{pctCollected}% del total anual</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">⏳</div>
                    <div className="stat-value">{totalDebt.toLocaleString('es-ES')}€</div>
                    <div className="stat-label">Pendiente de Cobro</div>
                    <div className="stat-change negative">{pendientes} pendientes · {morosos} morosos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">📊</div>
                    <div className="stat-value">{pctCollected}%</div>
                    <div className="stat-label">Tasa de Cobro</div>
                    <div className="progress-bar" style={{ marginTop: 8 }}>
                        <div className="progress-fill" style={{ width: `${pctCollected}%` }} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input className="input" placeholder="🔍 Buscar fallero..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
                <div className="tabs" style={{ marginBottom: 0 }}>
                    {[
                        { key: 'todos' as Filter, label: `Todos (${totalFalleros})` },
                        { key: 'pagado' as Filter, label: `Al día (${FALLEROS.filter((f) => getStatus(f.paid) === 'pagado').length})` },
                        { key: 'pendiente' as Filter, label: `Pendientes (${pendientes})` },
                        { key: 'moroso' as Filter, label: `Morosos (${morosos})` },
                    ].map((t) => (
                        <button key={t.key} className={`tab ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>{t.label}</button>
                    ))}
                </div>
                <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>📤 Exportar CSV</button>
            </div>

            {/* Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fallero/a</th>
                                <th>Cat.</th>
                                <th>Cuota</th>
                                {MONTHS_SHORT.map((m) => <th key={m} style={{ textAlign: 'center', fontSize: 11, padding: '8px 4px' }}>{m}</th>)}
                                <th style={{ textAlign: 'right' }}>Deuda</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((f) => {
                                const status = getStatus(f.paid);
                                const debt = getDebt(f.cuota, f.paid);
                                return (
                                    <tr key={f.id}>
                                        <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{f.name}</td>
                                        <td><span className={`badge ${f.category === 'Adulto' ? 'info' : f.category === 'Infantil' ? 'purple' : 'success'}`}>{f.category}</span></td>
                                        <td>{f.cuota}€</td>
                                        {f.paid.map((p, i) => (
                                            <td key={i} style={{ textAlign: 'center', padding: '8px 4px' }}>
                                                <span style={{ fontSize: 14 }}>{p ? '✅' : '❌'}</span>
                                            </td>
                                        ))}
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: debt > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontFamily: "'Outfit', sans-serif" }}>
                                            {debt > 0 ? `${debt}€` : '—'}
                                        </td>
                                        <td>
                                            <span className={`badge ${status === 'pagado' ? 'success' : status === 'pendiente' ? 'warning' : 'danger'}`}>
                                                {status === 'pagado' ? '✓ Al día' : status === 'pendiente' ? '⏳ Pendiente' : '🔴 Moroso'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
