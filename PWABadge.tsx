import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export function PWABadge() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-white border-2 border-indigo-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-4 max-w-sm">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="font-black text-indigo-900 uppercase text-sm">Actualización Disponible</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">Hay una nueva versión de la aplicación lista para instalar.</p>
                </div>
                <button onClick={() => setNeedRefresh(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                </button>
            </div>
            <button
                onClick={() => updateServiceWorker(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
                <RefreshCw size={14} />
                Recargar y Actualizar
            </button>
        </div>
    );
}
