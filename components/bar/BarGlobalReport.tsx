import React from 'react';
import { Award, Beer, TrendingUp, X } from 'lucide-react';
import {
    Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line, CartesianGrid
} from 'recharts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    advancedStats: {
        evolutionData: any[];
        // Add other stats if needed in this report, currently only evolutionData is used in the snippet shown in modal
        // Wait, the modal also had other sections potentially?
        // In the original file, the modal showed "Evolución Financiera".
    };
    netProfit: number;
    totalRevenue: number;
    totalBottleCost: number;
}

export const BarGlobalReport: React.FC<Props> = ({
    isOpen, onClose, advancedStats
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8 animate-in slide-in-from-bottom-10">
            <div className="max-w-5xl mx-auto bg-white min-h-screen rounded-[48px] shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-8 right-8 p-4 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-full transition-all z-50"><X size={24} /></button>

                <div className="p-12 md:p-20 bg-slate-900 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-widest mb-6">
                            <Award size={14} className="text-yellow-400" /> Informe de Rendimiento
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">Barra<br /><span className="text-indigo-500">Analytics</span></h2>
                    </div>
                    <Beer size={400} className="absolute -right-20 -bottom-20 opacity-5 rotate-12 text-white" />
                </div>

                <div className="p-12 md:p-20 space-y-20">

                    <section>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-4"><TrendingUp className="text-indigo-600" /> Evolución Financiera</h3>
                        <div className="h-80 w-full bg-slate-50 rounded-[40px] p-8 border border-slate-100">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={advancedStats.evolutionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="revenue" fill="#cbd5e1" barSize={20} radius={[10, 10, 10, 10]} name="Ingresos" />
                                    <Line type="monotone" dataKey="accumulated" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} name="Beneficio Acumulado" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Additional sections can be added here */}
                </div>
            </div>
        </div>
    );
};
