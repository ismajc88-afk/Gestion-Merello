"use client";

import { useState } from "react";
import { Folder, FileText, Download, Upload, Search, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

interface Document {
    id: number;
    name: string;
    type: "PDF" | "DOCX" | "IMG";
    category: "Actas" | "Estatutos" | "Contratos" | "Varios";
    date: string;
    size: string;
}

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Document[]>([
        { id: 1, name: "Estatutos Comisión 2024.pdf", type: "PDF", category: "Estatutos", date: "2024-01-10", size: "2.4 MB" },
        { id: 2, name: "Acta Junta General 15-feb.pdf", type: "PDF", category: "Actas", date: "2024-02-16", size: "1.1 MB" },
        { id: 3, name: "Contrato Artista Fallero.pdf", type: "PDF", category: "Contratos", date: "2023-11-05", size: "5.6 MB" },
        { id: 4, name: "Boceto Falla Infantil.jpg", type: "IMG", category: "Varios", date: "2023-10-20", size: "8.2 MB" },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">DOCUMENTACIÓN</h2>
                    <p className="text-zinc-400">Archivo digital y repositorio de la comisión.</p>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all flex items-center gap-2 border border-zinc-700">
                    <Upload className="h-5 w-5" />
                    <span>Subir Archivo</span>
                </button>
            </div>

            {/* Folder Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Actas", "Estatutos", "Contratos", "Varios"].map(folder => (
                    <div key={folder} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-zinc-800/50 cursor-pointer transition-all group">
                        <Folder className="h-12 w-12 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-white">{folder}</span>
                        <span className="text-xs text-zinc-500">{docs.filter(d => d.category === folder).length} archivos</span>
                    </div>
                ))}
            </div>

            {/* File List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Archivos Recientes</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            placeholder="Buscar documento..."
                            className="pl-10 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none w-64"
                        />
                    </div>
                </div>
                <div className="divide-y divide-zinc-800">
                    {docs.map(doc => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                    <FileText className={`h-5 w-5 ${doc.type === 'PDF' ? 'text-rose-500' : 'text-blue-500'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{doc.name}</p>
                                    <p className="text-xs text-zinc-500 flex gap-2">
                                        <span>{doc.date}</span>
                                        <span>•</span>
                                        <span>{doc.size}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase text-zinc-600 tracking-wider hidden md:block">{doc.category}</span>
                                <button className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-colors">
                                    <Download className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-colors">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
