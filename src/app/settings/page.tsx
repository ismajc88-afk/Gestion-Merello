'use client';

import { useState } from 'react';

type Tab = 'ejercicio' | 'categorias' | 'proveedores' | 'auditoria';

const PROVEEDORES = [
    { nombre: 'Artista Fallero Latorre', tipo: 'Artista', cif: 'B12345678', contacto: 'Vicente Latorre', tel: '612 000 002', total: '45.000€', pagado: '38.000€', estado: 'Contratado' },
    { nombre: 'Pirotecnia Caballer', tipo: 'Pirotécnico', cif: 'B23456789', contacto: 'Juan Caballer', tel: '612 000 001', total: '8.500€', pagado: '8.000€', estado: 'Contratado' },
    { nombre: 'Banda El Patriarca', tipo: 'Música', cif: 'G34567890', contacto: 'Director', tel: '612 000 003', total: '6.000€', pagado: '3.200€', estado: 'Contratado' },
    { nombre: 'Flores Valencia', tipo: 'Ofrenda', cif: 'B45678901', contacto: 'Rosa Martín', tel: '612 000 004', total: '2.200€', pagado: '1.800€', estado: 'Contratado' },
    { nombre: 'Catering La Fallera', tipo: 'Catering', cif: 'B56789012', contacto: 'Amparo Sánchez', tel: '612 000 005', total: '12.000€', pagado: '4.800€', estado: 'Negociando' },
    { nombre: 'Electricidad Sáez', tipo: 'Suministros', cif: 'B67890123', contacto: 'Pedro Sáez', tel: '612 000 006', total: '4.500€', pagado: '4.500€', estado: 'Pagado' },
];

const AUDIT_LOG = [
    { ts: '10/02/2026 19:45', user: 'Tesorera', action: 'Generó fichero SEPA — Feb 2026', type: 'Finanzas' },
    { ts: '10/02/2026 18:30', user: 'Presidente', action: 'Modificó presupuesto Pirotecnia', type: 'Edición' },
    { ts: '09/02/2026 22:15', user: 'Secretario', action: 'Exportó censo completo a CSV', type: 'Datos' },
    { ts: '09/02/2026 16:00', user: 'Tesorera', action: 'Registró gasto — Flores Valencia', type: 'Finanzas' },
    { ts: '08/02/2026 11:20', user: 'Tesorera', action: 'Marcó cuota pagada — María García', type: 'Cobros' },
    { ts: '07/02/2026 09:30', user: 'Presidente', action: 'Aprobó presupuesto ejercicio', type: 'Aprobación' },
    { ts: '06/02/2026 14:15', user: 'Tesorera', action: 'Envió recordatorio morosos (5)', type: 'Comunicación' },
    { ts: '05/02/2026 10:00', user: 'Admin', action: 'Alta nuevo fallero — Roberto Sanz', type: 'Censo' },
];

const EXPENSE_CATEGORIES = ['Monumentos', 'Pirotecnia', 'Música', 'Catering', 'Iluminación', 'Ofrenda', 'Indumentaria', 'Seguros', 'Alquiler', 'Suministros', 'Material', 'Publicidad', 'Infantil', 'Excursiones', 'Imprevistos'];
const INCOME_CATEGORIES = ['Cuotas Adulto', 'Cuotas Infantil', 'Cuotas Jubilado', 'Lotería', 'Subvención JCF', 'Subvención Ayto.', 'Barra/Bar', 'Rifas', 'Patrocinadores', 'Otros'];

export default function SettingsPage() {
    const [tab, setTab] = useState<Tab>('ejercicio');

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">⚙️ Configuración</h1>
                <p className="page-subtitle">Parámetros del sistema de tesorería</p>
            </div>
            <div className="tabs" style={{ marginBottom: 24 }}>
                {([['ejercicio', '📅 Ejercicio'], ['categorias', '🏷️ Categorías'], ['proveedores', '🤝 Proveedores'], ['auditoria', '🔒 Auditoría']] as [Tab, string][]).map(([k, l]) => (
                    <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
                ))}
            </div>

            {tab === 'ejercicio' && (
                <div className="animate-fade-in" style={{ maxWidth: 600 }}>
                    <div className="card">
                        <h3 style={{ marginBottom: 20 }}>📅 Ejercicio Fiscal Activo</h3>
                        {[
                            ['Ejercicio actual', '2025-2026'],
                            ['Fecha inicio', '15/03/2025'],
                            ['Fecha fin', '19/03/2026 (Cremà)'],
                            ['Cuota mensual adulto', '85,00 €'],
                            ['Cuota mensual infantil', '45,00 €'],
                            ['Cuota mensual jubilado', '40,00 €'],
                            ['Día cobro SEPA', '5 de cada mes'],
                            ['IBAN de la falla', 'ES12 1234 5678 9012 3456 7890'],
                        ].map(([label, value], i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 14 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                <span style={{ fontWeight: 600 }}>{value}</span>
                            </div>
                        ))}
                        <button className="btn btn-secondary" style={{ marginTop: 16 }}>✏️ Editar Parámetros</button>
                    </div>
                </div>
            )}

            {tab === 'categorias' && (
                <div className="animate-fade-in grid-2">
                    <div className="card">
                        <h3 style={{ marginBottom: 16 }}>📤 Categorías de Gasto</h3>
                        {EXPENSE_CATEGORIES.map((c, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 14 }}>
                                <span>{c}</span>
                                <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 12 }}>✏️</button>
                            </div>
                        ))}
                        <button className="btn btn-secondary" style={{ marginTop: 12, fontSize: 13 }}>+ Añadir categoría</button>
                    </div>
                    <div className="card">
                        <h3 style={{ marginBottom: 16 }}>📥 Categorías de Ingreso</h3>
                        {INCOME_CATEGORIES.map((c, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 14 }}>
                                <span>{c}</span>
                                <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 12 }}>✏️</button>
                            </div>
                        ))}
                        <button className="btn btn-secondary" style={{ marginTop: 12, fontSize: 13 }}>+ Añadir categoría</button>
                    </div>
                </div>
            )}

            {tab === 'proveedores' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 className="section-title" style={{ margin: 0 }}>🤝 CRM de Proveedores</h3>
                        <button className="btn btn-primary">+ Nuevo Proveedor</button>
                    </div>
                    <div className="card">
                        <table className="data-table">
                            <thead><tr><th>Proveedor</th><th>Tipo</th><th>CIF</th><th>Contacto</th><th style={{ textAlign: 'right' }}>Total</th><th style={{ textAlign: 'right' }}>Pagado</th><th>Estado</th></tr></thead>
                            <tbody>{PROVEEDORES.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                                    <td><span className="badge info">{p.tipo}</span></td>
                                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.cif}</td>
                                    <td style={{ fontSize: 13 }}>{p.contacto}<br /><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.tel}</span></td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit'", fontWeight: 600 }}>{p.total}</td>
                                    <td style={{ textAlign: 'right', fontFamily: "'Outfit'", color: 'var(--accent-green)' }}>{p.pagado}</td>
                                    <td><span className={`badge ${p.estado === 'Pagado' ? 'success' : p.estado === 'Contratado' ? 'info' : 'warning'}`}>{p.estado}</span></td>
                                </tr>))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'auditoria' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 className="section-title" style={{ margin: 0 }}>🔒 Log de Auditoría</h3>
                        <button className="btn btn-secondary">📤 Exportar</button>
                    </div>
                    <div className="card">
                        <table className="data-table">
                            <thead><tr><th>Timestamp</th><th>Usuario</th><th>Acción</th><th>Tipo</th></tr></thead>
                            <tbody>{AUDIT_LOG.map((l, i) => (
                                <tr key={i}>
                                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{l.ts}</td>
                                    <td style={{ fontWeight: 500 }}>{l.user}</td>
                                    <td>{l.action}</td>
                                    <td><span className={`badge ${l.type === 'Finanzas' ? 'success' : l.type === 'Cobros' ? 'info' : l.type === 'Edición' ? 'warning' : 'purple'}`}>{l.type}</span></td>
                                </tr>))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
