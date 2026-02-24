
import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, Toast, ToastType } from '../hooks/useToast';

const toastConfig: Record<ToastType, { icon: React.ElementType; bg: string; border: string; text: string; iconColor: string }> = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-emerald-950/90',
        border: 'border-emerald-500/30',
        text: 'text-emerald-200',
        iconColor: 'text-emerald-400'
    },
    error: {
        icon: XCircle,
        bg: 'bg-rose-950/90',
        border: 'border-rose-500/30',
        text: 'text-rose-200',
        iconColor: 'text-rose-400'
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-950/90',
        border: 'border-amber-500/30',
        text: 'text-amber-200',
        iconColor: 'text-amber-400'
    },
    info: {
        icon: Info,
        bg: 'bg-blue-950/90',
        border: 'border-blue-500/30',
        text: 'text-blue-200',
        iconColor: 'text-blue-400'
    }
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const config = toastConfig[toast.type];
    const IconComponent = config.icon;

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true));

        // Animate out before removal
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => setIsVisible(false), toast.duration - 300);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [toast.duration]);

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl
        transition-all duration-300 ease-out max-w-sm w-full
        ${config.bg} ${config.border}
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
      `}
        >
            <IconComponent size={18} className={`shrink-0 ${config.iconColor}`} />
            <p className={`text-sm font-bold flex-1 ${config.text}`}>{toast.message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onRemove(toast.id), 300);
                }}
                className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
                <X size={14} className="text-white/40" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9000] flex flex-col-reverse gap-2 items-center pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
};
