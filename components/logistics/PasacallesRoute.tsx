import { useState, useMemo } from 'react';
import { RouteStop } from '../../types';
import { Map, MapPin, Plus, Trash2, Clock, Navigation, Download } from 'lucide-react';

const STOP_DURATION_MINUTES = 10;

const ROLE_COLORS = {
    FMI: 'bg-pink-100 text-pink-700 border-pink-200',
    PI: 'bg-blue-100 text-blue-700 border-blue-200',
    FM: 'bg-rose-100 text-rose-700 border-rose-200',
    P: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    BANDA: 'bg-amber-100 text-amber-700 border-amber-200',
    CASAL: 'bg-slate-100 text-slate-700 border-slate-200',
    OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ROLE_LABELS = {
    FMI: 'Fallera Mayor Infantil',
    PI: 'Presidente Infantil',
    FM: 'Fallera Mayor',
    P: 'Presidente',
    BANDA: 'Banda de Música',
    CASAL: 'Casal Fallero',
    OTHER: 'Otra Parada'
};

export function PasacallesRoute() {
    const [stops, setStops] = useState<RouteStop[]>([
        { id: '1', name: 'Casal', address: 'Calle Principal, 1', role: 'CASAL' },
    ]);
    const [newStopName, setNewStopName] = useState('');
    const [newStopAddress, setNewStopAddress] = useState('');
    const [newStopRole, setNewStopRole] = useState<RouteStop['role']>('OTHER');
    const [startTime, setStartTime] = useState('17:00');

    const addStop = () => {
        if (!newStopName || !newStopAddress) return;
        const newStop: RouteStop = {
            id: Date.now().toString(),
            name: newStopName,
            address: newStopAddress,
            role: newStopRole
        };
        setStops([...stops, newStop]);
        setNewStopName('');
        setNewStopAddress('');
        setNewStopRole('OTHER');
    };

    const removeStop = (id: string) => {
        setStops(stops.filter(s => s.id !== id));
    };

    const moveStop = (index: number, direction: 'UP' | 'DOWN') => {
        if (direction === 'UP' && index > 0) {
            const newStops = [...stops];
            [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
            setStops(newStops);
        } else if (direction === 'DOWN' && index < stops.length - 1) {
            const newStops = [...stops];
            [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
            setStops(newStops);
        }
    };

    // Simulate time calculation based on order
    const calculatedStops = useMemo(() => {
        let currentMinutes = 0;
        if (startTime) {
            const [h, m] = startTime.split(':').map(Number);
            currentMinutes = h * 60 + m;
        }

        return stops.map((stop, index) => {
            const stopTime = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;

            // Add walking time (simulated 15 mins) + stop time for the next address
            if (index < stops.length - 1) {
                // Dummy simulated time between stops: 12 minutes walk + 10 mins photo/protocol
                currentMinutes += 12 + STOP_DURATION_MINUTES;
            }

            return {
                ...stop,
                timeExp: stopTime
            };
        });
    }, [stops, startTime]);

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300 flex flex-col h-full">
            {/* HEADER */}
            <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-6 text-white relative overflow-hidden shrink-0">
                <Map className="absolute -right-4 -top-4 w-32 h-32 opacity-20" />
                <h3 className="text-2xl font-black uppercase mb-2 relative z-10 flex items-center gap-2">
                    <Navigation /> Organizador de Recogidas
                </h3>
                <p className="text-orange-100 font-medium relative z-10 text-sm max-w-[80%]">
                    Añade las direcciones de los Representantes y la Banda, ordénalos y calcula a qué hora aproximada llegaréis a cada casa.
                </p>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row gap-8 overflow-hidden h-full">

                {/* ADD STOP FORM */}
                <div className="w-full md:w-1/3 space-y-4 shrink-0 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">Añadir Parada</h4>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">¿A quién recogemos?</label>
                                <select
                                    value={newStopRole}
                                    onChange={(e) => setNewStopRole(e.target.value as any)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition-all"
                                >
                                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nombre / Detalle</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Fallera Mayor Laura..."
                                    value={newStopName}
                                    onChange={(e) => setNewStopName(e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all placeholder:font-normal"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Dirección / Calle</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Av. Camp de Morvedre, 24"
                                    value={newStopAddress}
                                    onChange={(e) => setNewStopAddress(e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all placeholder:font-normal"
                                />
                            </div>

                            <button
                                onClick={addStop}
                                disabled={!newStopName || !newStopAddress}
                                className="w-full py-3 mt-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors"
                            >
                                <Plus size={16} /> Añadir a la ruta
                            </button>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 mt-4">
                        <h4 className="font-black text-orange-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Clock size={16} /> Configurar Horario
                        </h4>
                        <label className="text-[10px] font-bold text-orange-600/70 uppercase mb-1 block">Hora de salida desde Casal</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full p-3 bg-white border-2 border-orange-200 rounded-xl font-black text-orange-600 text-lg text-center outline-none focus:border-orange-400 transition-all"
                        />
                        <p className="text-[10px] text-orange-600/70 font-semibold mt-3 text-center">
                            El tiempo entre paradas se estima en +/- 20 mins (camino + fotos).
                        </p>
                    </div>
                </div>

                {/* ROUTE LIST */}
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-3xl p-2 md:p-6 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                            Itinerario Previsto ({calculatedStops.length} paradas)
                        </h4>
                        <button className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors">
                            <Download size={14} /> Exportar PDF
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 z-0 hidden md:block"></div>

                        {calculatedStops.map((stop, index) => (
                            <div key={stop.id} className="bg-white border text-left border-slate-200 rounded-2xl p-4 flex items-center gap-4 group relative z-10 hover:border-rose-300 transition-colors shadow-sm">

                                {/* Reorder handles */}
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button
                                        onClick={() => moveStop(index, 'UP')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => moveStop(index, 'DOWN')}
                                        disabled={index === stops.length - 1}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>

                                {/* Time & Pin */}
                                <div className="shrink-0 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center relative">
                                        <MapPin size={18} className="text-slate-400" />
                                        {index === 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
                                    </div>
                                    <div className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-black tracking-wider w-20 text-center">
                                        {stop.timeExp}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${ROLE_COLORS[stop.role || 'OTHER']}`}>
                                            {ROLE_LABELS[stop.role || 'OTHER']}
                                        </span>
                                    </div>
                                    <h5 className="font-bold text-slate-900 truncate">{stop.name}</h5>
                                    <p className="text-xs text-slate-500 truncate font-medium flex items-center gap-1 mt-0.5">
                                        <Navigation size={10} /> {stop.address}
                                    </p>
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => removeStop(stop.id)}
                                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        {calculatedStops.length === 0 && (
                            <div className="text-center py-12">
                                <Navigation className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500 font-bold">No hay paradas en la ruta.</p>
                                <p className="text-sm text-slate-400 mt-1">Añade los representantes en el panel izquierdo.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function ChevronUp(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m18 15-6-6-6 6" /></svg>; }
function ChevronDown(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6" /></svg>; }
