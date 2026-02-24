"use client";

import { useApp } from "@/lib/DataContext";
import { useState } from "react";
import { Calendar as CalendarIcon, MapPin, Clock, Users, Plus, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface Event {
    id: number;
    title: string;
    date: Date;
    location: string;
    type: "Junta" | "Fiesta" | "Acto" | "Infantil";
    attendees: number;
    status: "Programado" | "Realizado" | "Cancelado";
}

export default function EventsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([
        { id: 1, title: "Junta General", date: new Date(2024, 1, 15, 20, 30), location: "Casal", type: "Junta", attendees: 45, status: "Programado" },
        { id: 2, title: "Presentación Fallera Mayor", date: new Date(2024, 1, 24, 18, 0), location: "Teatro Principal", type: "Acto", attendees: 120, status: "Programado" },
    ]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">CALENDARIO</h2>
                    <p className="text-zinc-400">Actos y Juntas del ejercicio fallero.</p>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-5 w-5" />
                    <span>Nuevo Evento</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Visual Calendar */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-zinc-400 hover:text-white">Anterior</button>
                        <h3 className="text-xl font-bold text-white capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </h3>
                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-zinc-400 hover:text-white">Siguiente</button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-zinc-500 font-bold uppercase">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => <div key={day}>{day}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {daysInMonth.map((day, idx) => {
                            const dayEvents = events.filter(e => isSameDay(e.date, day));
                            return (
                                <div key={day.toString()} className={`aspect-square rounded-xl border border-zinc-800 p-2 flex flex-col justify-between hover:bg-zinc-800/50 transition-colors ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}`}>
                                    <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'text-primary' : 'text-zinc-400'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-1 justify-end">
                                            {dayEvents.map(e => (
                                                <div key={e.id} className="h-2 w-2 rounded-full bg-primary" title={e.title} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Events List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Próximos Eventos</h3>
                    {events.map(event => (
                        <div key={event.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                                        {format(event.date, 'dd MMM yyyy', { locale: es })}
                                    </span>
                                    <h4 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${event.type === 'Junta' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                        event.type === 'Acto' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            'bg-zinc-800 text-zinc-500 border-zinc-700'
                                    }`}>
                                    {event.type}
                                </span>
                            </div>

                            <div className="space-y-2 text-zinc-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{format(event.date, 'HH:mm')}h</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{event.attendees} Confirmados</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
                                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                                    Ver Detalles
                                </button>
                                <button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold py-2 rounded-lg border border-emerald-500/20 transition-colors">
                                    Pasar Lista
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
