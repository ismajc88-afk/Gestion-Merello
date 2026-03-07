export class PerformanceMonitor {
    private metrics: Record<string, number[]> = {};

    measure(name: string, fn: () => void) {
        const start = performance.now();
        try {
            fn();
        } finally {
            const duration = performance.now() - start;
            this.log(name, duration);
        }
    }

    async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const start = performance.now();
        try {
            return await fn();
        } finally {
            const duration = performance.now() - start;
            this.log(name, duration);
        }
    }

    log(name: string, duration: number) {
        if (!this.metrics[name]) this.metrics[name] = [];
        this.metrics[name].push(duration);

        if (import.meta.env.DEV && duration > 50) {
            console.warn(`[Perf] 🐢 ${name} took ${duration.toFixed(2)}ms`);
        }
    }

    getReport() {
        const report: Record<string, string> = {};
        Object.keys(this.metrics).forEach(key => {
            const values = this.metrics[key];
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            report[key] = `${avg.toFixed(2)}ms (samples: ${values.length})`;
        });
        return report;
    }
}

export const monitor = new PerformanceMonitor();
