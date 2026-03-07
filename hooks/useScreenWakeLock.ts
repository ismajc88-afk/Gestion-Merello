import { useState, useCallback, useEffect } from 'react';
import { useToast } from './useToast';

export const useScreenWakeLock = () => {
    const [isLocked, setIsLocked] = useState(false);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
    const { success, error } = useToast();

    const releaseLock = useCallback(async () => {
        if (wakeLock) {
            try {
                await wakeLock.release();
                setWakeLock(null);
                setIsLocked(false);
                // toast.info("Pantalla desbloqueada (Ahorro de energía en curso)");
            } catch (err) {
                console.error(err);
            }
        }
    }, [wakeLock]);

    const requestLock = useCallback(async () => {
        try {
            if ('wakeLock' in navigator) {
                const lock = await navigator.wakeLock.request('screen');
                setWakeLock(lock);
                setIsLocked(true);
                success("💡 Pantalla SIEMPRE ENCENDIDA activada");

                lock.addEventListener('release', () => {
                    setIsLocked(false);
                    setWakeLock(null);
                    console.log('Wake Lock released');
                });
            } else {
                error("Tu navegador no soporta el modo 'Pantalla Siempre Encendida'");
            }
        } catch (err) {
            console.error(err);
            error("No se pudo activar el modo pantalla. Asegúrate de tener batería suficiente.");
        }
    }, [success, error]);

    const toggleLock = useCallback(() => {
        if (isLocked) {
            releaseLock();
        } else {
            requestLock();
        }
    }, [isLocked, releaseLock, requestLock]);

    // Re-acquire lock if page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isLocked && !wakeLock) {
                await requestLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLock) wakeLock.release();
        };
    }, [isLocked, wakeLock, requestLock]);

    return { isLocked, toggleLock };
};
