"use client";

import { Member, useApp } from "@/lib/DataContext";
import { X, Mail, Phone, MapPin, Calendar, Award, Shield, DollarSign, Wallet, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MemberDetailDrawer({
    member,
    isOpen,
    onClose,
    onEdit // New Prop
}: {
    member: Member | null,
    isOpen: boolean,
    onClose: () => void,
    onEdit?: () => void
}) {
    const { getMemberFinancials } = useApp();

    // Safe calculation to avoid crashing if member is null
    const financials = member ? getMemberFinancials(member.id) : { totalPaid: 0, quotaStatus: 0 };
    const annualQuota = 350; // In a real app this would come from global settings

    return (
        <AnimatePresence>
            {isOpen && member && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[70] flex flex-col h-full"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                    {member.avatar}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-tight">{member.name}</h2>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${member.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                                        }`}>
                                        {member.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* Section: Contact */}
                            <div>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> Contacto
                                </h3>
                                <div className="space-y-3 bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50">
                                    <div className="flex items-center justify-between group">
                                        <span className="text-sm text-zinc-400">Email</span>
                                        <span className="text-sm font-medium text-white select-all">{member.email || "No registrado"}</span>
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <span className="text-sm text-zinc-400">Teléfono</span>
                                        <span className="text-sm font-medium text-white select-all">{member.phone || "+34 600 000 000"}</span>
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <span className="text-sm text-zinc-400">Dirección</span>
                                        <span className="text-sm font-medium text-white truncate max-w-[200px]">C/ Mayor, 45, 3ºB</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Historial Fallero */}
                            <div>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Award className="h-3 w-3" /> Historial y Recompensas
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center text-center hover:bg-zinc-800/50 transition-colors cursor-default">
                                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                                            <Shield className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <span className="text-2xl font-black text-white">12</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Años Censado</span>
                                    </div>
                                    <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center text-center hover:bg-zinc-800/50 transition-colors cursor-default">
                                        <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                                            <Award className="h-4 w-4 text-rose-500" />
                                        </div>
                                        <span className="text-lg font-bold text-white">Bunyol d'Or</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Recompensa</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-sm font-bold text-white">Cargo Actual: {member.role}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        Nombrado en la Junta General del ejercicio 2024-2025. Responsable de coordinación de área.
                                    </p>
                                </div>
                            </div>

                            {/* Section: Financial Status - REAL DATA */}
                            <div>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Wallet className="h-3 w-3" /> Cuotas 2024
                                </h3>
                                <div className="bg-gradient-to-br from-zinc-900 to-black p-5 rounded-2xl border border-zinc-800 relative overflow-hidden group">

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-zinc-400 text-xs font-medium mb-1">Cuota Anual</p>
                                                <p className="text-2xl font-black text-white">{annualQuota},00 €</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold mb-1 flex items-center gap-1 justify-end ${financials.quotaStatus >= 100 ? "text-emerald-500" : "text-amber-500"
                                                    }`}>
                                                    {financials.quotaStatus >= 100 ? (
                                                        <><CheckCircle2 className="h-3 w-3" /> Pagado</>
                                                    ) : (
                                                        <><AlertCircle className="h-3 w-3" /> Pendiente</>
                                                    )}
                                                </p>
                                                <p className="text-zinc-500 text-xs">{financials.totalPaid.toFixed(2)} € ({financials.quotaStatus}%)</p>
                                            </div>
                                        </div>

                                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${financials.quotaStatus}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className={`h-full bg-gradient-to-r ${financials.quotaStatus >= 100 ? "from-emerald-500 to-emerald-400" : "from-amber-500 to-amber-400"
                                                    }`}
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-xs text-zinc-500 text-center">
                                                Has pagado <span className="text-white font-bold">{financials.totalPaid} €</span> de {annualQuota} €.
                                                {financials.quotaStatus < 100 && ` Restan ${(annualQuota - financials.totalPaid)} €.`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 backdrop-blur-md pb-8">
                            <button
                                onClick={onEdit}
                                className="w-full py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-black font-bold transition-all shadow-lg shadow-white/5 active:scale-[0.98] flex justify-center items-center gap-2"
                            >
                                <Pencil className="h-4 w-4" />
                                Editar Perfil Completo
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
