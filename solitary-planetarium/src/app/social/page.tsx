"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Heart, Image as ImageIcon, Briefcase, ShoppingBag, Vote, Send, ThumbsUp, MessageSquare, ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";

export default function SocialPage() {
    const [activeTab, setActiveTab] = useState("chat");

    const tabs = [
        { id: "chat", label: "Chat Interno", icon: MessageCircle },
        { id: "wall", label: "Muro Social", icon: Heart },
        { id: "polls", label: "Votaciones", icon: Vote },
        { id: "gallery", label: "Galería", icon: ImageIcon },
        { id: "directory", label: "Profesionales", icon: Briefcase },
        { id: "market", label: "Tablón", icon: ShoppingBag },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="mb-8">
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">ZONA SOCIAL</h2>
                <p className="text-zinc-400">El punto de encuentro digital de la comisión.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${activeTab === tab.id
                            ? "bg-primary text-black shadow-lg shadow-primary/20 scale-105"
                            : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 min-h-[500px]">
                {activeTab === "chat" && <ChatComponent />}
                {activeTab === "wall" && <WallComponent />}
                {activeTab === "polls" && <PollsComponent />}
                {activeTab === "gallery" && <GalleryComponent />}
                {/* Placeholders for others */}
                {["directory", "market"].includes(activeTab) && (() => {
                    const activeInfo = tabs.find(t => t.id === activeTab);
                    const Icon = activeInfo?.icon || MessageCircle;
                    return (
                        <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
                            <Icon className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-white mb-2">Módulo {activeInfo?.label}</h3>
                            <p>Funcionalidad lista para implementar.</p>
                        </div>
                    );
                })()}
            </div>
        </motion.div>
    );
}

// --- SUB-COMPONENTS ---

function GalleryComponent() {
    const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const albums = [
        { id: 1, title: "Presentación 2024", date: "24 Ene", count: 124, cover: "bg-rose-500" },
        { id: 2, title: "Cena de Navidad", date: "15 Dic", count: 45, cover: "bg-emerald-500" },
        { id: 3, title: "Acto de la Bandera", date: "09 Oct", count: 89, cover: "bg-amber-500" },
        { id: 4, title: "Playbacks Infantiles", date: "22 Nov", count: 210, cover: "bg-purple-500" },
    ];

    // Mock photos generator
    const getPhotos = (albumId: number) => Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        url: `https://picsum.photos/seed/${albumId}-${i}/400/300`, // Placeholder
        color: albumId === 1 ? 'bg-rose-900' : albumId === 2 ? 'bg-emerald-900' : 'bg-zinc-800'
    }));

    return (
        <div className="space-y-6">
            {!selectedAlbum ? (
                // ALBUMS GRID
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Upload New Album */}
                    <button className="aspect-square rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-sm">Crear Álbum</span>
                    </button>

                    {albums.map(album => (
                        <div
                            key={album.id}
                            onClick={() => setSelectedAlbum(album.id)}
                            className="group cursor-pointer space-y-2"
                        >
                            <div className={`aspect-square rounded-2xl ${album.cover} opacity-80 group-hover:opacity-100 transition-opacity relative overflow-hidden shadow-lg`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                    <h4 className="font-bold text-white leading-tight">{album.title}</h4>
                                    <p className="text-xs text-white/70">{album.count} fotos</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // PHOTOS GRID
                <div>
                    <button
                        onClick={() => setSelectedAlbum(null)}
                        className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="font-bold">Volver a Álbumes</span>
                    </button>

                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-white">{albums.find(a => a.id === selectedAlbum)?.title}</h3>
                            <p className="text-zinc-400 text-sm">{albums.find(a => a.id === selectedAlbum)?.date} • {albums.find(a => a.id === selectedAlbum)?.count} fotos</p>
                        </div>
                        <button className="px-4 py-2 bg-primary text-black font-bold rounded-xl text-sm hover:bg-amber-400">
                            Subir Fotos
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {getPhotos(selectedAlbum).map(photo => (
                            <motion.div
                                key={photo.id}
                                layoutId={`photo-${photo.id}`}
                                onClick={() => setSelectedImage(photo.url)}
                                className={`aspect-[4/3] rounded-xl ${photo.color} cursor-zoom-in hover:opacity-80 transition-opacity`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* LIGHTBOX */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <div className={`w-full max-w-4xl aspect-video rounded-lg bg-zinc-800`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ChatComponent() {
    return (
        <div className="flex h-[600px] gap-4">
            {/* Channels */}
            <div className="w-1/4 bg-zinc-950 rounded-2xl p-4 border border-zinc-800 hidden md:block">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4">Canales</h3>
                <div className="space-y-2">
                    {["General", "Junta Directiva", "Festejos", "Infantiles", "Lotería", "Fútbol"].map(c => (
                        <div key={c} className="p-2 hover:bg-zinc-900 rounded-lg cursor-pointer text-zinc-300 hover:text-white font-medium flex items-center gap-2">
                            <span className="text-zinc-600">#</span> {c}
                        </div>
                    ))}
                </div>
            </div>
            {/* Messages */}
            <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-800 font-bold text-white"># General</div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">JP</div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-white text-sm">Juan Pérez</span>
                                <span className="text-[10px] text-zinc-500">10:30 PM</span>
                            </div>
                            <p className="text-zinc-300 text-sm">¿Alguien sabe a qué hora es la reunión de mañana?</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center font-bold text-xs">MG</div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-white text-sm">María García</span>
                                <span className="text-[10px] text-zinc-500">10:32 PM</span>
                            </div>
                            <p className="text-zinc-300 text-sm">A las 20:30 en el Casal. ¡No faltéis!</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-zinc-800 flex gap-2">
                    <input className="flex-1 bg-zinc-900 rounded-xl px-4 py-2 text-white border border-zinc-800 focus:outline-none focus:border-primary" placeholder="Escribe un mensaje..." />
                    <button className="p-2 bg-primary text-black rounded-xl hover:bg-amber-400"><Send className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    )
}

function WallComponent() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-500" />
                <input className="flex-1 bg-transparent text-white placeholder:text-zinc-600 focus:outline-none" placeholder="¿Qué está pasando en la falla?" />
            </div>

            {/* Post 1 */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center font-bold">VP</div>
                    <div>
                        <p className="font-bold text-white text-sm">Vicente Pérez</p>
                        <p className="text-xs text-zinc-500">Hace 2 horas</p>
                    </div>
                </div>
                <div className="px-4 pb-2 text-zinc-300 text-sm">
                    ¡Qué gran noche la de ayer! Gracias a todos los que vinisteis a la cena de sobaquillo. Aquí os dejo una foto del equipo de cocina. 🥘
                </div>
                <div className="h-64 bg-zinc-800 flex items-center justify-center text-zinc-600">
                    <ImageIcon className="h-12 w-12 opacity-50" />
                </div>
                <div className="p-3 border-t border-zinc-800 flex gap-6">
                    <button className="flex items-center gap-2 text-zinc-400 hover:text-rose-500 text-sm font-bold"><Heart className="h-4 w-4" /> 24</button>
                    <button className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-bold"><MessageSquare className="h-4 w-4" /> 3 comentarios</button>
                </div>
            </div>
        </div>
    )
}

function PollsComponent() {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white text-lg">Menú Cena de Navidad</h3>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">ACTIVA</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">Eligid el plato principal para la cena del día 15.</p>

                <div className="space-y-3">
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center cursor-pointer hover:border-primary transition-colors">
                        <span className="text-white font-medium">Carrillada Ibérica</span>
                        <span className="text-zinc-500 text-sm">45%</span>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center cursor-pointer hover:border-primary transition-colors">
                        <span className="text-white font-medium">Salmón al Horno</span>
                        <span className="text-zinc-500 text-sm">30%</span>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center cursor-pointer hover:border-primary transition-colors">
                        <span className="text-white font-medium">Opción Vegana</span>
                        <span className="text-zinc-500 text-sm">25%</span>
                    </div>
                </div>
                <button className="w-full mt-6 bg-primary text-black font-bold py-3 rounded-xl hover:bg-amber-400">Votar</button>
            </div>
        </div>
    )
}
