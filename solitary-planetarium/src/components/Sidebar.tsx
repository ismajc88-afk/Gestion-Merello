"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Settings,
    Menu,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Zap,
    MessageCircle, // Social
    Shield, // Admin
    Truck, // Logistics
    Briefcase, // Finance
    Gamepad2 // Entertainment
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
    { name: "Censo", href: "/members", icon: Users },
    { name: "Social", href: "/social", icon: MessageCircle }, // HUB
    { name: "Administración", href: "/administration", icon: Shield }, // HUB
    { name: "Logística", href: "/logistics", icon: Truck }, // HUB
    { name: "Finanzas PRO", href: "/finance-pro", icon: Briefcase }, // HUB
    { name: "Diversión", href: "/entertainment", icon: Gamepad2 }, // HUB
    { name: "Ajustes", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Close mobile menu on path change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Trigger - Only visible on small screens */}
            <button
                className="fixed top-4 left-4 z-50 p-2.5 bg-zinc-900 md:hidden rounded-lg border border-zinc-800 text-white shadow-xl hover:bg-zinc-800 transition-colors"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle Menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-zinc-800 bg-black/95 backdrop-blur-xl md:sticky md:top-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={cn("flex items-center h-20 px-6 border-b border-zinc-800/50", isCollapsed ? "justify-center px-2" : "justify-between")}>
                        {!isCollapsed ? (
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <Zap className="h-5 w-5 text-black fill-current" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white tracking-wide leading-none">GESTIÓN</h1>
                                    <p className="text-[10px] text-primary font-bold tracking-[0.2em] leading-none">FALLERA</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Zap className="h-5 w-5 text-black fill-current" />
                            </div>
                        )}

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex bg-zinc-900 border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all absolute -right-3 top-8 shadow-md"
                        >
                            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto custom-scrollbar">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all relative",
                                        isActive
                                            ? "text-white bg-zinc-900/50"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/30",
                                        isCollapsed ? "justify-center px-0" : ""
                                    )}
                                    title={isCollapsed ? item.name : ""}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_#f59e0b]" />
                                    )}

                                    <item.icon
                                        className={cn(
                                            "h-5 w-5 flex-shrink-0 transition-transform duration-300",
                                            isActive ? "text-primary scale-110" : "group-hover:text-zinc-200",
                                            isCollapsed ? "mr-0" : "mr-3"
                                        )}
                                    />

                                    {!isCollapsed && (
                                        <span className="truncate">{item.name}</span>
                                    )}

                                    {!isCollapsed && isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Profile */}
                    <div className="p-4 border-t border-zinc-800/50 mt-auto">
                        <div className={cn(
                            "flex items-center p-2 rounded-xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 hover:border-white/10 cursor-pointer transition-all group",
                            isCollapsed ? "justify-center" : ""
                        )}>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-500 flex items-center justify-center shrink-0">
                                <span className="font-bold text-[10px] text-white">TF</span>
                            </div>

                            {!isCollapsed && (
                                <div className="ml-3 overflow-hidden flex-1">
                                    <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">Tesorería</p>
                                    <p className="text-xs text-zinc-500 truncate">El Campanar</p>
                                </div>
                            )}

                            {!isCollapsed && (
                                <button className="ml-2 text-zinc-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/10">
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
