"use client";

import { useState } from "react";
import { Member, useApp } from "@/lib/DataContext";
import {
    ArrowUpDown,
    MoreHorizontal,
    Search,
    Filter,
    Download,
    Mail,
    ChevronLeft,
    ChevronRight,
    Shield,
    Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function MemberTable({ onSelectMember }: { onSelectMember: (member: Member) => void }) {
    const { members } = useApp();
    const [sortConfig, setSortConfig] = useState<{ key: keyof Member; direction: 'asc' | 'desc' } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("Todos");
    const [statusFilter, setStatusFilter] = useState("Todos");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter & Sort Logic
    const filteredMembers = members
        .filter(m =>
            (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (roleFilter === "Todos" || m.role === roleFilter) &&
            (statusFilter === "Todos" || m.status === statusFilter)
        )
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: keyof Member) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-4">
            {/* Visual Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, DNI, email..."
                        className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select
                        className="bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary outline-none"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="Todos">Todos los Cargos</option>
                        <option value="Fallero">Fallero</option>
                        <option value="Presidente">Presidente</option>
                        <option value="Fallera Mayor">Fallera Mayor</option>
                        <option value="Vocal">Vocal</option>
                    </select>

                    <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors border border-zinc-700">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <tr>
                            <th className="p-4 pl-6 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-2">Nombre <ArrowUpDown className="h-3 w-3" /></div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('role')}>
                                <div className="flex items-center gap-2">Cargo <ArrowUpDown className="h-3 w-3" /></div>
                            </th>
                            <th className="p-4 hidden md:table-cell">Contacto</th>
                            <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-2">Estado <ArrowUpDown className="h-3 w-3" /></div>
                            </th>
                            <th className="p-4 text-right pr-6">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {currentMembers.length > 0 ? (
                            currentMembers.map((member) => (
                                <motion.tr
                                    key={member.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="group hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                    onClick={() => onSelectMember(member)}
                                >
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xs ring-2 ring-zinc-900 group-hover:ring-zinc-700 transition-all`}>
                                                {member.avatar}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-200 group-hover:text-primary transition-colors">{member.name}</p>
                                                <p className="text-xs text-zinc-500 font-mono">ID: #{member.badge}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                            {member.role === "Presidente" && <Shield className="h-3 w-3 text-amber-500" />}
                                            {member.role === "Fallera Mayor" && <Star className="h-3 w-3 text-rose-500" />}
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <div className="flex flex-col text-xs text-zinc-400">
                                            <span className="flex items-center gap-1 hover:text-white transition-colors"><Mail className="h-3 w-3" /> {member.email}</span>
                                            {member.phone && <span className="mt-1">📞 {member.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${member.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                member.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full mr-2 ${member.status === 'Activo' ? 'bg-emerald-500' :
                                                    member.status === 'Pendiente' ? 'bg-amber-500' : 'bg-zinc-500'
                                                }`} />
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500">
                                    No se encontraron falleros con los filtros actuales.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-zinc-500">
                    Mostrando <span className="font-bold text-white">{currentMembers.length}</span> de <span className="font-bold text-white">{filteredMembers.length}</span> resultados
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
