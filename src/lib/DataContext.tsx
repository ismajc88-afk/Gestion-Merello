"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Member {
    id: number;
    name: string;
    role: string;
    status: "Activo" | "Pendiente" | "Inactivo";
    email: string;
    phone: string;
    avatar: string;
    color: string;
    badge: string;
}

export interface Transaction {
    id: number;
    type: "income" | "expense";
    description: string;
    category: string;
    amount: number;
    date: string;
    status: "Pagado" | "Pendiente";
    memberId?: number; // Optional link to a member
}

interface AppContextType {
    members: Member[];
    transactions: Transaction[];
    addMember: (member: Omit<Member, "id">) => void;
    updateMember: (id: number, data: Partial<Member>) => void; // NEW: Update function
    addTransaction: (transaction: Omit<Transaction, "id">) => void;
    deleteTransaction: (id: number) => void;
    getFinancials: () => { income: number; expense: number; balance: number };
    getMemberFinancials: (memberId: number) => { totalPaid: number; quotaStatus: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    // --- INITIAL MOCK DATA ---
    // Using static IDs to prevent hydration mismatch (server vs client)
    const [members, setMembers] = useState<Member[]>([
        { id: 1, name: "Vicente Blasco", role: "Presidente", status: "Activo", email: "vicente@falla.com", phone: "600 123 456", avatar: "VB", color: "from-amber-500 to-orange-600", badge: "001" },
        { id: 2, name: "Maria García", role: "Fallera Mayor", status: "Activo", email: "maria@falla.com", phone: "600 234 567", avatar: "MG", color: "from-rose-500 to-pink-600", badge: "002" },
        { id: 3, name: "Pepito Grillo", role: "Infantil", status: "Pendiente", email: "pepito@falla.com", phone: "600 345 678", avatar: "PG", color: "from-blue-500 to-cyan-600", badge: "003" },
        { id: 4, name: "Lucía Pérez", role: "Vocal", status: "Activo", email: "lucia@falla.com", phone: "600 456 789", avatar: "LP", color: "from-emerald-500 to-teal-600", badge: "004" },
        { id: 5, name: "Antonio Recio", role: "Fallero", status: "Inactivo", email: "antonio@falla.com", phone: "600 567 890", avatar: "AR", color: "from-purple-500 to-violet-600", badge: "005" },
        { id: 6, name: "Carla Montero", role: "Fallera Mayor Infantil", status: "Activo", email: "carla@falla.com", phone: "600 678 901", avatar: "CM", color: "from-pink-500 to-rose-600", badge: "006" },
    ]);

    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: 101, type: "income", description: "Cuota Vicente Blasco (1er Plazo)", category: "Cuota", amount: 150, date: "2024-01-15", status: "Pagado", memberId: 1 },
        { id: 102, type: "income", description: "Lotería Navidad", category: "Lotería", amount: 1200, date: "2024-01-20", status: "Pagado" },
        { id: 103, type: "expense", description: "Adelanto Artista Fallero", category: "Monumento", amount: 5000, date: "2024-02-01", status: "Pagado" },
        { id: 104, type: "income", description: "Cuota Maria García (Completa)", category: "Cuota", amount: 350, date: "2024-02-05", status: "Pagado", memberId: 2 },
        { id: 105, type: "expense", description: "Luz y Agua Casal", category: "Casal", amount: 150, date: "2024-02-10", status: "Pagado" },
        { id: 106, type: "income", description: "Cuota Lucía Pérez (1er Plazo)", category: "Cuota", amount: 175, date: "2024-02-12", status: "Pagado", memberId: 4 },
    ]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addMember = (member: Omit<Member, "id">) => {
        const newMember = { ...member, id: Date.now() };
        setMembers(prev => [newMember, ...prev]);
    };

    // NEW: Update existing member
    const updateMember = (id: number, data: Partial<Member>) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    };

    const addTransaction = (transaction: Omit<Transaction, "id">) => {
        const newTransaction = { ...transaction, id: Date.now() };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const deleteTransaction = (id: number) => {
        setTransactions(prev => prev.filter((t) => t.id !== id));
    };

    const getFinancials = () => {
        const income = transactions.filter((t) => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
        const expense = transactions.filter((t) => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
        return { income, expense, balance: income - expense };
    };

    // Robusted: Calculate real financials for a specific member with safety checks
    const getMemberFinancials = (memberId: number) => {
        if (!memberId) return { totalPaid: 0, quotaStatus: 0 };

        const memberTransactions = transactions.filter(t => t.memberId === memberId && t.type === "income" && t.status === "Pagado");
        const totalPaid = memberTransactions.reduce((acc, curr) => acc + curr.amount, 0);
        const annualQuota = 350; // Hardcoded annual quota for v1
        return {
            totalPaid,
            quotaStatus: Math.min(100, Math.round((totalPaid / annualQuota) * 100))
        };
    };

    if (!mounted) {
        // Safe to return null or just children, but we return children to avoid layout shift
    }

    return (
        <AppContext.Provider value={{
            members,
            transactions,
            addMember,
            updateMember, // Export new function
            addTransaction,
            deleteTransaction,
            getFinancials,
            getMemberFinancials
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
