import { useState, useMemo, useEffect } from 'react';
import { RouteStop } from '../../types';
import { Navigation, Plus, Trash2, Clock, AlertTriangle, ChevronUp, ChevronDown, Wand2, Share2, PlayCircle, CheckCircle2, Hand, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useToast } from '../../hooks/useToast';

// Fix for default Leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons per Role
const createCustomIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const ROLE_COLORS: Record<string, string> = {
    FMI: '#e879f9', // pink-400
    PI: '#60a5fa',  // blue-400
    FM: '#fb7185',  // rose-400
    P: '#818cf8',   // indigo-400
    BANDA: '#fbbf24', // amber-400
    CASAL: '#475569', // slate-600
    OTHER: '#94a3b8'  // slate-400
};

const PUERTO_SAGUNTO_CENTER: [number, number] = [39.6644, -0.2312];

interface RouteData {
    geometry: [number, number][]; // Lat, Lng
    durationSeconds: number;
    distanceMeters: number;
}

function BoundsFitter({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [positions, map]);
    return null;
}

// Haversine formula to approximate direct distance in meters
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

export function PasacallesRoute() {
    const toast = useToast();

    // --- STATE ---
    const [stops, setStops] = useState<RouteStop[]>([
        { id: '1', name: 'Casal Merello', address: 'Puerto de Sagunto', role: 'CASAL', lat: 39.6644, lng: -0.2312, durationMins: 10, status: 'PENDING' }
    ]);
    const [newStopName, setNewStopName] = useState('');
    const [newStopAddress, setNewStopAddress] = useState('');
    const [newStopRole, setNewStopRole] = useState<RouteStop['role']>('OTHER');
    const [newStopDuration, setNewStopDuration] = useState(10);
    const [startTime, setStartTime] = useState('17:00');

    const [routeSegments, setRouteSegments] = useState<Record<string, RouteData>>({});
    const [isCalculating, setIsCalculating] = useState(false);

    // Live Tracker Status
    const [isLiveMode, setIsLiveMode] = useState(false);

    // --- GEOCODING & ROUTING API ---
    const fetchCoordinates = async (address: string): Promise<[number, number] | null> => {
        try {
            const searchQuery = address.toLowerCase().includes('puerto') || address.toLowerCase().includes('sagunt')
                ? address
                : `${address}, Puerto de Sagunto, Valencia`;

            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            return null;
        } catch {
            return null;
        }
    };

    const fetchRouteSegment = async (start: [number, number], end: [number, number]): Promise<RouteData | null> => {
        try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
            const data = await res.json();
            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0];
                const geometry = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
                return {
                    geometry,
                    durationSeconds: route.duration,
                    distanceMeters: route.distance
                };
            }
            return null;
        } catch {
            return null;
        }
    };

    const calculateFullRoute = async (currentStops: RouteStop[]) => {
        setIsCalculating(true);
        const newSegments: Record<string, RouteData> = {};

        for (let i = 0; i < currentStops.length - 1; i++) {
            const start = currentStops[i];
            const end = currentStops[i + 1];
            if (start.lat && start.lng && end.lat && end.lng) {
                const key = `${start.id}-${end.id}`;
                if (routeSegments[key]) {
                    newSegments[key] = routeSegments[key];
                    continue;
                }
                const segment = await fetchRouteSegment([start.lat, start.lng], [end.lat, end.lng]);
                if (segment) {
                    newSegments[key] = segment;
                }
            }
        }
        setRouteSegments(newSegments);
        setIsCalculating(false);
    };

    useEffect(() => {
        const validStops = stops.filter(s => s.lat && s.lng);
        if (validStops.length > 1) {
            calculateFullRoute(stops);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stops]);

    // --- FORM ACTIONS ---
    const addStop = async () => {
        if (!newStopName || !newStopAddress) return;

        toast.info('Buscando dirección en el mapa...');
        const coords = await fetchCoordinates(newStopAddress);

        if (!coords) {
            toast.error('No se pudo encontrar la dirección. Usando ubicación aproximada.');
        } else {
            toast.success('Dirección encontrada');
        }

        const newStop: RouteStop = {
            id: Date.now().toString(),
            name: newStopName,
            address: newStopAddress,
            role: newStopRole,
            durationMins: newStopDuration,
            status: 'PENDING',
            lat: coords?.[0] || (PUERTO_SAGUNTO_CENTER[0] + (Math.random() * 0.01 - 0.005)),
            lng: coords?.[1] || (PUERTO_SAGUNTO_CENTER[1] + (Math.random() * 0.01 - 0.005))
        };

        setStops([...stops, newStop]);
        setNewStopName('');
        setNewStopAddress('');
        setNewStopRole('OTHER');
        setNewStopDuration(10);
    };

    const removeStop = (id: string) => setStops(stops.filter(s => s.id !== id));
    const updateStopDuration = (id: string, mins: number) => setStops(stops.map(s => s.id === id ? { ...s, durationMins: Math.max(0, mins) } : s));

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

    const optimizeRoute = () => {
        if (stops.length <= 2) return toast.info("Añade más paradas para poder optimizar la ruta.");
        toast.info('Optimizando orden de la ruta...');
        const validStops = stops.filter(s => s.lat && s.lng);
        const unmappedStops = stops.filter(s => !s.lat || !s.lng);

        if (validStops.length === 0) return;

        const startStop = validStops[0];
        let unvisited = validStops.slice(1);
        const optimizedPath: RouteStop[] = [startStop];
        let currentStop = startStop;

        while (unvisited.length > 0) {
            let nearestDist = Infinity;
            let nearestIdx = -1;
            for (let i = 0; i < unvisited.length; i++) {
                const candidate = unvisited[i];
                if (currentStop.lat && currentStop.lng && candidate.lat && candidate.lng) {
                    const dist = getHaversineDistance(currentStop.lat, currentStop.lng, candidate.lat, candidate.lng);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestIdx = i;
                    }
                }
            }
            if (nearestIdx !== -1) {
                currentStop = unvisited[nearestIdx];
                optimizedPath.push(currentStop);
                unvisited.splice(nearestIdx, 1);
            } else {
                optimizedPath.push(unvisited[0]);
                unvisited.splice(0, 1);
            }
        }
        setStops([...optimizedPath, ...unmappedStops]);
        toast.success("Ruta optimizada minimizando distancias.");
    };

    // --- LIVE TRACKING ACTIONS ---
    const startLiveMode = () => {
        setIsLiveMode(true);
        toast.success("🔴 MODO EN VIVO ACTIVADO. Controlando tiempos reales.");

        // Ensure all stops are marked as pending when starting
        setStops(stops.map((s, idx) => ({
            ...s,
            status: idx === 0 ? 'ARRIVED' : 'PENDING', // Auto-arrive first stop (Casal)
            actualArrivalTime: idx === 0 ? new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : undefined,
            actualDepartureTime: undefined
        })));
    };

    const stopLiveMode = () => {
        setIsLiveMode(false);
        toast.info("Modo En Vivo Finalizado.");
    };

    const handleAction = (id: string, action: 'ARRIVE' | 'LEAVE') => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        setStops(stops.map(s => {
            if (s.id === id) {
                if (action === 'ARRIVE') {
                    return { ...s, status: 'ARRIVED', actualArrivalTime: timeString };
                } else if (action === 'LEAVE') {
                    return { ...s, status: 'COMPLETED', actualDepartureTime: timeString };
                }
            }
            return s;
        }));
    };

    function getMinutesSinceMidnight(timeStr: string) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    function formatTime(totalMins: number) {
        return `${String(Math.floor(totalMins / 60) % 24).padStart(2, '0')}:${String(Math.floor(totalMins % 60)).padStart(2, '0')}`;
    }

    // --- DYNAMIC ENGINE (Planning vs Live ETA) ---
    const calculatedStops = useMemo(() => {
        let currentMinutes = getMinutesSinceMidnight(startTime);

        // In live mode, we need the real-world time to cascade delays
        const realNowMinutes = getMinutesSinceMidnight(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));

        let routeDistanceTotal = 0;

        const mapped = stops.map((stop, index) => {
            let projectedArrival = formatTime(currentMinutes);
            let walkMins = 0;
            let walkDist = 0;
            let delayMinutes = 0;

            // Step 1: Calculate walk to NEXT stop (used for UI)
            if (index < stops.length - 1) {
                const nextStop = stops[index + 1];
                const segment = routeSegments[`${stop.id}-${nextStop.id}`];
                if (segment) {
                    walkMins = Math.ceil(segment.durationSeconds / 60);
                    walkDist = segment.distanceMeters;
                    routeDistanceTotal += walkDist;
                } else {
                    walkMins = 15; // Fallback
                }
            }

            // Step 2: Time Logic per Status
            if (isLiveMode) {
                if (stop.status === 'COMPLETED' && stop.actualDepartureTime) {
                    // It's in the past. We arrived, spent our time, and left. 
                    // Project the next stop based on when we ACTUALLY left + the walk time.
                    projectedArrival = stop.actualArrivalTime || projectedArrival; // What we show for this stop
                    currentMinutes = getMinutesSinceMidnight(stop.actualDepartureTime) + walkMins;
                }
                else if (stop.status === 'ARRIVED' && stop.actualArrivalTime) {
                    // We are here right now!
                    projectedArrival = stop.actualArrivalTime;

                    // The time we predict leaving is Max(Right Now, Actual Arrival + Planned Duration)
                    const plannedLeaveTime = getMinutesSinceMidnight(stop.actualArrivalTime) + (stop.durationMins || 10);
                    const predictedLeave = Math.max(realNowMinutes, plannedLeaveTime);

                    // The next stop arrives when we leave this one + walk time
                    currentMinutes = predictedLeave + walkMins;
                }
                else {
                    // PENDING STOPS (Future)
                    // If real time > expected arrival, we are delayed! Push schedule back.
                    if (realNowMinutes > currentMinutes) {
                        delayMinutes = realNowMinutes - currentMinutes;
                        currentMinutes = realNowMinutes;
                        projectedArrival = formatTime(currentMinutes);
                    }
                    // Add duration and walk to carry forward to the next stop loop
                    currentMinutes += (stop.durationMins || 10) + walkMins;
                }
            } else {
                // NORMAL PLANNING MODE
                // Just add Protocol Duration + Walk Mins for the next loop
                currentMinutes += (stop.durationMins || 10) + walkMins;
            }

            return {
                ...stop,
                timeExp: projectedArrival,
                walkMinsToNext: walkMins,
                distToNext: walkDist,
                delayWarning: delayMinutes > 0 ? delayMinutes : 0
            };
        });

        return { stops: mapped, totalDistance: routeDistanceTotal };
    }, [stops, startTime, routeSegments, isLiveMode]);

    // Export Ruta to WhatsApp
    const exportToWhatsApp = () => {
        if (calculatedStops.stops.length === 0) return;
        let str = `*🎵 RUTA PASACALLES FALLERO 🎵*\n📍 Salida oficial: ${startTime}\n🚶‍♂️ Total: ${(calculatedStops.totalDistance / 1000).toFixed(2)} km\n\n`;
        calculatedStops.stops.forEach((stop, index) => {
            str += `🕒 *${stop.timeExp}* - ${stop.name}\n🏠 ${stop.address}\n`;
            if (index < calculatedStops.stops.length - 1) {
                str += `     ⬇️ (A pie: ${stop.walkMinsToNext!}m. Parada: ${stop.durationMins || 10}m)\n`;
            }
        });
        window.open(`https://wa.me/?text=${encodeURIComponent(str)}`, '_blank');
        toast.success("Abriendo WhatsApp con la ruta...");
    };

    const allRouteCoords = useMemo(() => {
        let coords: [number, number][] = [];
        for (let i = 0; i < stops.length - 1; i++) {
            const key = `${stops[i].id}-${stops[i + 1].id}`;
            if (routeSegments[key]) coords = [...coords, ...routeSegments[key].geometry];
        }
        return coords;
    }, [stops, routeSegments]);

    const allMarkerPositions = stops.filter(s => s.lat && s.lng).map(s => [s.lat, s.lng] as [number, number]);

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full animate-in fade-in duration-300">

            {/* HEADER */}
            <div className={`p-6 text-white shrink-0 flex items-center justify-between transition-colors duration-500 ${isLiveMode ? 'bg-rose-600' : 'bg-slate-900'}`}>
                <div>
                    <h3 className="text-2xl font-black uppercase mb-1 flex items-center gap-2">
                        {isLiveMode ? <><PlayCircle className="animate-pulse" /> RUTÓMETRO EN VIVO</> : <><Navigation className="text-blue-400" /> Creador de Rutas Avanzado</>}
                    </h3>
                    <div className="flex items-center gap-4">
                        <p className="text-white/80 font-medium text-sm flex items-center gap-2">
                            {isLiveMode ? 'Control real de retrasos activado' : 'Conectado a OpenStreetMap'}
                            {isCalculating && <span className="text-amber-400 flex items-center gap-1"><Clock size={12} className="animate-spin" /> Mapeando...</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block border-r border-white/20 pr-6">
                        <p className={`text-xl font-black ${isLiveMode ? 'text-white' : 'text-blue-400'}`}>
                            {(calculatedStops.totalDistance / 1000).toFixed(2)} km
                        </p>
                        <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Distancia Caminando</p>
                    </div>

                    {isLiveMode ? (
                        <button onClick={stopLiveMode} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors text-white shadow-lg font-black uppercase text-sm tracking-widest border border-slate-700">
                            Detener Viaje
                        </button>
                    ) : (
                        <button onClick={startLiveMode} className="px-6 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 rounded-xl transition-colors text-white shadow-lg font-black uppercase text-sm flex items-center gap-2">
                            <PlayCircle size={18} /> Empezar Pasacalle
                        </button>
                    )}

                    {!isLiveMode && (
                        <button onClick={exportToWhatsApp} className="p-3 bg-green-600 hover:bg-green-500 rounded-xl transition-colors text-white shadow-lg flex flex-col items-center justify-center shrink-0">
                            <Share2 size={24} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-6 flex-1 flex flex-col xl:flex-row gap-6 overflow-hidden h-full">

                {/* PANEL IZQ: FORMULARIO Y LISTA */}
                <div className="w-full xl:w-[480px] flex flex-col gap-4 shrink-0 overflow-y-auto pr-2 custom-scrollbar">

                    {!isLiveMode && (
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 text-slate-200 pointer-events-none opacity-20">
                                <Navigation size={120} />
                            </div>
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-[110px] p-2 bg-white border border-slate-200 rounded-xl font-black text-lg text-slate-700 outline-none text-center shadow-sm" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hora de Salida</span>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <input type="text" placeholder="📝 Nombre (Ej: FMI Laura)" value={newStopName} onChange={(e) => setNewStopName(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none shadow-sm" />
                                <input type="text" placeholder="📍 Dirección Completa (Ej: Calle Mayor 12)" value={newStopAddress} onChange={(e) => setNewStopAddress(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStop()} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none shadow-sm" />

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-3 outline-none shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                        <Clock size={16} className="text-slate-400" />
                                        <input type="number" min="0" value={newStopDuration} onChange={(e) => setNewStopDuration(Number(e.target.value))} className="w-full p-3 bg-transparent font-bold text-sm outline-none ml-2" placeholder="Minutos" />
                                        <span className="text-xs font-bold text-slate-400">MIN</span>
                                    </div>
                                    <button onClick={addStop} disabled={!newStopName || !newStopAddress} className="h-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors shrink-0 shadow flex items-center gap-2">
                                        Añadir <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider">
                            {isLiveMode ? 'Seguimiento en Tiempo Real' : 'Itinerario Programado'}
                        </h4>
                        {!isLiveMode && (
                            <button onClick={optimizeRoute} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors border border-indigo-200">
                                <Wand2 size={14} /> Optimizar Ruta
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 relative pb-20 mt-2">
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 z-0"></div>

                        {calculatedStops.stops.map((stop, index) => {
                            const isPending = stop.status === 'PENDING';
                            const isArrived = stop.status === 'ARRIVED';
                            const isCompleted = stop.status === 'COMPLETED';

                            return (
                                <div key={stop.id} className="relative z-10">
                                    <div className={`bg-white border text-left rounded-2xl p-3 flex shadow-sm group transition-all duration-300 ${isLiveMode && isCompleted ? 'opacity-50 border-emerald-200 grayscale' : 'border-slate-200 hover:border-blue-200'} ${isArrived ? 'ring-2 ring-amber-400 border-transparent shadow-md transform scale-[1.02]' : ''}`}>

                                        {!isLiveMode && (
                                            <div className="w-10 flex flex-col items-center gap-1 shrink-0 pt-1">
                                                <button onClick={() => moveStop(index, 'UP')} disabled={index === 0} className="text-slate-300 hover:text-blue-500 disabled:opacity-0"><ChevronUp size={16} /></button>
                                                <div className="w-4 h-4 rounded-full border-2 border-white shadow flex items-center justify-center text-[10px] font-bold text-white z-10" style={{ backgroundColor: ROLE_COLORS[stop.role || 'OTHER'] }}></div>
                                                <button onClick={() => moveStop(index, 'DOWN')} disabled={index === stops.length - 1} className="text-slate-300 hover:text-blue-500 disabled:opacity-0"><ChevronDown size={16} /></button>
                                            </div>
                                        )}

                                        {isLiveMode && (
                                            <div className="w-12 flex flex-col items-center gap-1 shrink-0 pt-3 relative">
                                                <div className={`w-6 h-6 rounded-full border-[3px] shadow-sm flex items-center justify-center text-white z-10 transition-colors ${isCompleted ? 'bg-emerald-500 border-white' : isArrived ? 'bg-amber-400 border-white animate-pulse' : 'bg-slate-200 border-white'}`}>
                                                    {isCompleted && <CheckCircle2 size={14} />}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-black shadow-sm ${isLiveMode && isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-800 text-white'}`}>
                                                        {stop.timeExp}
                                                    </span>
                                                    {isLiveMode && stop.delayWarning && stop.delayWarning > 0 && isPending && (
                                                        <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                                                            <AlertTriangle size={10} /> +{stop.delayWarning}m Retraso
                                                        </span>
                                                    )}
                                                </div>
                                                {!isLiveMode && (
                                                    <button onClick={() => removeStop(stop.id)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-rose-50 rounded"><Trash2 size={16} /></button>
                                                )}
                                            </div>

                                            <h5 className="font-bold text-slate-900 text-sm truncate">{stop.name}</h5>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{stop.address}</p>

                                            {!stop.lat && !isLiveMode && (
                                                <p className="text-[10px] text-amber-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Sin coordenadas. Revisa.</p>
                                            )}

                                            {!isLiveMode && (
                                                <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Parada:</span>
                                                    <input
                                                        type="number"
                                                        value={stop.durationMins || 0}
                                                        onChange={e => updateStopDuration(stop.id, Number(e.target.value))}
                                                        className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold font-mono text-center text-indigo-700 outline-none focus:border-indigo-400"
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-400">MIN</span>
                                                </div>
                                            )}

                                            {/* LIVE ACTION BUTTONS */}
                                            {isLiveMode && (
                                                <div className="mt-3 flex gap-2">
                                                    {isPending && (
                                                        <button onClick={() => handleAction(stop.id, 'ARRIVE')} className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition-colors">
                                                            📍 Acabamos de Llegar
                                                        </button>
                                                    )}
                                                    {isArrived && (
                                                        <div className="w-full">
                                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2 flex items-start gap-2">
                                                                <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-black text-amber-700 uppercase">Actualmente en esta casa</p>
                                                                    <p className="text-[10px] text-amber-600 font-medium">Llegada registrada a las {stop.actualArrivalTime}. Pulsad salir cuando toque marchar.</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => handleAction(stop.id, 'LEAVE')} className="w-full py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition-all shadow">
                                                                <Hand size={14} /> ¡Marchando a la siguiente!
                                                            </button>
                                                        </div>
                                                    )}
                                                    {isCompleted && (
                                                        <p className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">
                                                            Completada ({stop.actualArrivalTime} - {stop.actualDepartureTime})
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Segment Details */}
                                    {index < calculatedStops.stops.length - 1 && (
                                        <div className="pl-12 py-2 flex items-center gap-2 opacity-60">
                                            <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-lg text-slate-500 shadow-inner">
                                                <Navigation size={12} />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500">
                                                {stop.walkMinsToNext!} min andando • {(stop.distToNext! / 1000).toFixed(1)} km
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* PANEL DERECHO: MAPA INTERACTIVO LEAFLET */}
                <div className={`flex-1 rounded-[32px] overflow-hidden relative border z-0 h-[400px] xl:h-[calc(100vh-180px)] shadow-inner transition-colors ${isLiveMode ? 'border-amber-300' : 'bg-slate-100 border-slate-200'}`}>
                    <MapContainer
                        center={PUERTO_SAGUNTO_CENTER}
                        zoom={14}
                        scrollWheelZoom={true}
                        className="w-full h-full z-0"
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        {allMarkerPositions.length > 0 && <BoundsFitter positions={allMarkerPositions} />}

                        {/* Draw connecting lines */}
                        {allRouteCoords.length > 0 && (
                            <Polyline
                                positions={allRouteCoords}
                                pathOptions={{ color: isLiveMode ? '#f43f5e' : '#2563eb', weight: isLiveMode ? 5 : 4, opacity: 0.7, dashArray: isLiveMode ? undefined : '8, 8' }}
                            />
                        )}

                        {/* Draw stop pins */}
                        {calculatedStops.stops.map((stop, i) => {
                            if (!stop.lat || !stop.lng) return null;
                            const isCompleted = isLiveMode && stop.status === 'COMPLETED';

                            return (
                                <Marker
                                    key={stop.id}
                                    position={[stop.lat, stop.lng]}
                                    icon={createCustomIcon(isCompleted ? '#10b981' : ROLE_COLORS[stop.role || 'OTHER'])}
                                    opacity={isCompleted ? 0.5 : 1}
                                >
                                    <Popup className="custom-popup">
                                        <div className="text-center p-1">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Parada {i + 1} • {stop.timeExp}</p>
                                            <p className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2 px-4 shadow-sm bg-white rounded-lg">{stop.name}</p>
                                            <p className="text-xs text-slate-600 mt-2">{stop.address}</p>
                                            <p className="text-[10px] font-bold text-indigo-600 mt-1 bg-indigo-50 py-1 rounded">
                                                {isLiveMode ? (stop.status === 'COMPLETED' ? 'Completado' : 'En Ruta') : `Parada: ${stop.durationMins || 10} min`}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                    </MapContainer>
                </div>

            </div>
        </div>
    );
}
