
import { useMemo, useState } from 'react';
import { BarSession } from '../../types';
import { TrendingUp, Package, Euro, Calendar, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    barSessions: BarSession[];
    barPrices: { name: string; price: number }[];
}

interface ProductStat {
    name: string;
    totalUnits: number;
    totalRevenue: number;
    peakDay: string;
    peakUnits: number;
    sessionsCount: number;
}

type SortKey = 'totalUnits' | 'totalRevenue' | 'peakUnits';

export function BarProductHistory({ barSessions, barPrices }: Props) {
    const [sortBy, setSortBy] = useState<SortKey>('totalUnits');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [filter, setFilter] = useState('');

    const priceMap = useMemo(() => {
        const m: Record<string, number> = {};
        barPrices.forEach(p => { m[p.name.toLowerCase()] = p.price; });
        return m;
    }, [barPrices]);

    const stats = useMemo<ProductStat[]>(() => {
        const map: Record<string, ProductStat> = {};

        barSessions.forEach(session => {
            if (!session.ticketCounts) return;
            Object.entries(session.ticketCounts).forEach(([name, units]) => {
                if (!map[name]) {
                    map[name] = { name, totalUnits: 0, totalRevenue: 0, peakDay: '', peakUnits: 0, sessionsCount: 0 };
                }
                const price = priceMap[name.toLowerCase()] ?? 0;
                map[name].totalUnits += units;
                map[name].totalRevenue += units * price;
                map[name].sessionsCount += 1;
                if (units > map[name].peakUnits) {
                    map[name].peakUnits = units;
                    map[name].peakDay = session.date
                        ? new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
                        : 'Sin fecha';
                }
            });
        });

        return Object.values(map);
    }, [barSessions, priceMap]);

    const sorted = useMemo(() => {
        return [...stats]
            .filter(s => s.name.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
    }, [stats, sortBy, sortDir, filter]);

    const totalRevenue = stats.reduce((a, s) => a + s.totalRevenue, 0);
    const totalUnits = stats.reduce((a, s) => a + s.totalUnits, 0);
    const maxUnits = sorted.length > 0 ? sorted[0].totalUnits : 1;

    const toggleSort = (key: SortKey) => {
        if (sortBy === key) setsSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(key); setSortDir('desc'); }
    };

    // Fix: typo correction for setsSortDir
    function setsSortDir(fn: (d: 'desc' | 'asc') => 'desc' | 'asc') {
        setSortDir(prev => fn(prev));
    }

    const MEDAL = ['🥇', '🥈', '🥉'];

    const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
        <button
            onClick={() => toggleSort(k)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
            {label}
            {sortBy === k && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
        </button>
    );

    if (barSessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Package size={56} className="mb-4 opacity-30" />
                <p className="font-bold text-lg">Sin datos de ventas aún</p>
                <p className="text-sm mt-1">Abre sesiones de barra y registra ventas para ver el historial aquí.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard icon={<Package size={20} className="text-indigo-500" />} label="Productos distintos" value={stats.length.toString()} />
                <KpiCard icon={<TrendingUp size={20} className="text-emerald-500" />} label="Unidades totales" value={totalUnits.toLocaleString('es-ES')} />
                <KpiCard icon={<Euro size={20} className="text-amber-500" />} label="Ingresos estimados" value={`${totalRevenue.toFixed(2)}€`} />
                <KpiCard icon={<Calendar size={20} className="text-rose-500" />} label="Sesiones analizadas" value={barSessions.length.toString()} />
            </div>

            {/* Top 3 Podium */}
            {sorted.length >= 3 && (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy size={18} className="text-amber-400" />
                        <h3 className="text-white font-black text-sm uppercase tracking-widest">Top ventas</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {sorted.slice(0, 3).map((p, i) => (
                            <div key={p.name} className={`rounded-xl p-3 text-center ${i === 0 ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-white/5'}`}>
                                <div className="text-2xl mb-1">{MEDAL[i]}</div>
                                <div className="text-white font-black text-sm truncate">{p.name}</div>
                                <div className="text-slate-300 text-xs mt-1">{p.totalUnits.toLocaleString('es-ES')} u.</div>
                                <div className="text-emerald-400 text-xs">{p.totalRevenue.toFixed(0)}€</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <input
                    type="text"
                    placeholder="🔍 Buscar producto..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex gap-2 flex-wrap">
                    <SortBtn k="totalUnits" label="Por unidades" />
                    <SortBtn k="totalRevenue" label="Por ingresos" />
                    <SortBtn k="peakUnits" label="Por pico" />
                </div>
            </div>

            {/* Product List */}
            <div className="space-y-3">
                {sorted.map((p, i) => {
                    const barWidth = maxUnits > 0 ? (p.totalUnits / maxUnits) * 100 : 0;
                    return (
                        <div key={p.name} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{i < 3 ? MEDAL[i] : `#${i + 1}`}</span>
                                    <span className="font-black text-slate-800 text-sm">{p.name}</span>
                                </div>
                                <div className="flex gap-3 text-right">
                                    <div>
                                        <div className="text-xs text-slate-400 font-medium">Unidades</div>
                                        <div className="font-black text-slate-700">{p.totalUnits.toLocaleString('es-ES')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 font-medium">Ingresos</div>
                                        <div className="font-black text-emerald-600">{p.totalRevenue.toFixed(2)}€</div>
                                    </div>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                                <div
                                    className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                <span>📅 Pico: <span className="text-slate-600 font-bold">{p.peakDay || '–'}</span> ({p.peakUnits} u.)</span>
                                <span>{p.sessionsCount} sesión{p.sessionsCount !== 1 ? 'es' : ''}</span>
                            </div>
                        </div>
                    );
                })}
                {sorted.length === 0 && (
                    <p className="text-center text-slate-400 py-8 font-medium">No hay productos que coincidan con la búsqueda.</p>
                )}
            </div>
        </div>
    );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-slate-400 font-medium">{label}</span></div>
            <div className="font-black text-xl text-slate-800">{value}</div>
        </div>
    );
}
