"use client";

import { Users, UserPlus, Search, Filter, MoreHorizontal, Mail, Phone, Award, X, Check, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { MemberDistribution } from "@/components/MemberCharts";
import { useApp, Member } from "@/lib/DataContext";
import * as Dialog from "@radix-ui/react-dialog";
import { MemberTable } from "@/components/MemberTable";
import { MemberDetailDrawer } from "@/components/MemberDetailDrawer";

export default function MembersPage() {
    const { addMember, updateMember } = useApp();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Member>>({
        name: "", role: "Fallero", status: "Activo", email: "", color: "from-blue-500 to-blue-600", avatar: ""
    });

    // Reset form when opening Add Modal
    useEffect(() => {
        if (isAddModalOpen) {
            setFormData({ name: "", role: "Fallero", status: "Activo", email: "", color: "from-blue-500 to-blue-600", avatar: "" });
        }
    }, [isAddModalOpen]);

    // Populate form when opening Edit Modal
    useEffect(() => {
        if (isEditModalOpen && selectedMember) {
            setFormData({ ...selectedMember });
        }
    }, [isEditModalOpen, selectedMember]);

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const nextBadge = String(Date.now()).slice(-4);

        addMember({
            name: formData.name!,
            role: formData.role || "Fallero",
            status: (formData.status as "Activo" | "Pendiente" | "Inactivo") || "Activo",
            email: formData.email || "",
            phone: "",
            avatar: initials,
            color: formData.color || "from-blue-500 to-blue-600",
            badge: nextBadge
        });

        setIsAddModalOpen(false);
    };

    const handleUpdateMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMember || !formData.name) return;

        updateMember(selectedMember.id, formData);

        // Update local selected member to reflect changes immediately in the drawer
        setSelectedMember(prev => prev ? { ...prev, ...formData } as Member : null);
        setIsEditModalOpen(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col xl:flex-row gap-6 items-start justify-between">
                <div className="flex-1 space-y-4 w-full">
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">CENSO <span className="text-primary">2024</span></h2>
                        <p className="text-zinc-400 max-w-lg text-lg">Gestión integral de la comisión. Control de cargos, recompensas y estado administrativo.</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap gap-3 pt-2"
                    >
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 z-10"
                        >
                            <UserPlus className="h-5 w-5" />
                            Nuevo Alta
                        </button>
                    </motion.div>
                </div>

                <div className="w-full xl:w-[400px]">
                    <MemberDistribution />
                </div>
            </div>

            {/* Main Content */}
            <MemberTable onSelectMember={setSelectedMember} />

            {/* Drawer with Edit Callback */}
            <MemberDetailDrawer
                member={selectedMember}
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                onEdit={() => setIsEditModalOpen(true)} // Connected!
            />

            {/* SHARED MODAL COMPONENT (Abstracted inline for speed, but could be separate) */}
            {/* ADD MODAL */}
            <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] z-[70] shadow-2xl focus:outline-none">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Nuevo Fallero</h3>
                                <p className="text-zinc-500 text-sm">Añade un nuevo miembro al censo.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <MemberForm onSubmit={handleAddMember} data={formData} setData={setFormData} submitLabel="Guardar Fallero" />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* EDIT MODAL */}
            <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80]" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] z-[90] shadow-2xl focus:outline-none">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Editar Fallero</h3>
                                <p className="text-zinc-500 text-sm">Modifica los datos del censo.</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <MemberForm onSubmit={handleUpdateMember} data={formData} setData={setFormData} submitLabel="Guardar Cambios" icon={Save} />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </motion.div>
    );
}

// Reusable Form Component to avoid code duplication
function MemberForm({ onSubmit, data, setData, submitLabel, icon: Icon = Check }: any) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                <input
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                    placeholder="Ej. Vicente Blasco Ibáñez"
                    value={data.name}
                    onChange={e => setData({ ...data, name: e.target.value })}
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Cargo</label>
                    <div className="relative">
                        <select
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none appearance-none font-medium cursor-pointer hover:bg-zinc-900 transition-colors"
                            value={data.role}
                            onChange={e => setData({ ...data, role: e.target.value })}
                        >
                            <option>Fallero</option>
                            <option>Presidente</option>
                            <option>Fallera Mayor</option>
                            <option>Vocal</option>
                            <option>Infantil</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Estado</label>
                    <div className="relative">
                        <select
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none appearance-none font-medium cursor-pointer hover:bg-zinc-900 transition-colors"
                            value={data.status}
                            onChange={e => setData({ ...data, status: e.target.value as any })}
                        >
                            <option>Activo</option>
                            <option>Pendiente</option>
                            <option>Inactivo</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                <input
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    placeholder="ejemplo@email.com"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                />
            </div>

            <button type="submit" className="w-full py-4 bg-primary text-black font-black text-lg rounded-xl hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 flex justify-center items-center gap-3 shadow-lg shadow-primary/20">
                <Icon className="h-6 w-6" />
                {submitLabel}
            </button>
        </form>
    )
}
