export const haptic = {
    success: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    },
    error: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    },
    warning: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    },
    light: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
    },
    medium: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
    },
    heavy: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
    }
};
