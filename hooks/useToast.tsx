
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

// ----- Types -----
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

// ----- Context -----
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback silencioso cuando se usa fuera del provider
        return {
            toasts: [],
            addToast: () => { },
            removeToast: () => { },
            success: () => { },
            error: () => { },
            warning: () => { },
            info: () => { },
        };
    }
    return ctx;
};

// ----- Provider -----
export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts(prev => [...prev.slice(-4), { id, message, type, duration }]); // Max 5 toasts

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((msg: string) => addToast(msg, 'success', 3000), [addToast]);
    const error = useCallback((msg: string) => addToast(msg, 'error', 6000), [addToast]);
    const warning = useCallback((msg: string) => addToast(msg, 'warning', 5000), [addToast]);
    const info = useCallback((msg: string) => addToast(msg, 'info', 4000), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
        </ToastContext.Provider>
    );
};
