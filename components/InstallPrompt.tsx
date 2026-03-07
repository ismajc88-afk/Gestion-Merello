import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return; // Don't show again for 7 days
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ PWA installed');
            setIsInstalled(true);
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
        setShowPrompt(false);
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-10 md:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 rounded-3xl shadow-2xl border-2 border-white/20">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight">¡Instala Merello!</h3>
                        <p className="text-xs text-white/80 font-medium mt-1">
                            Acceso rápido desde tu pantalla de inicio
                        </p>
                    </div>
                </div>

                <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                        <span className="font-bold">Funciona sin internet</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                        <span className="font-bold">Más rápido que el navegador</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                        <span className="font-bold">Ocupa menos espacio</span>
                    </div>
                </div>

                <button
                    onClick={handleInstall}
                    className="w-full bg-white text-indigo-700 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                    <Download size={20} />
                    Instalar Ahora
                </button>
            </div>
        </div>
    );
};
