/**
 * metrics.js - Motor de cálculo de métricas financieras
 * Calculadora avanzada para análisis económico personal
 */

const MetricsEngine = {
    /**
     * Calcula el balance total actual
     */
    calculateTotalBalance(transactions) {
        return transactions.reduce((balance, t) => {
            return balance + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
    },

    /**
     * Calcula ingresos y gastos para un período específico
     */
    calculatePeriodTotals(transactions, startDate, endDate) {
        const periodTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });

        const income = periodTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = periodTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return { income, expenses, net: income - expenses };
    },

    /**
     * Calcula totales del mes actual
     */
    calculateMonthlyTotals(transactions) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        return this.calculatePeriodTotals(transactions, startOfMonth, endOfMonth);
    },

    /**
     * Calcula la tasa de ahorro
     */
    calculateSavingsRate(income, expenses) {
        if (income === 0) return 0;
        return ((income - expenses) / income) * 100;
    },

    /**
     * Calcula el burn rate (tasa de quema) diario
     */
    calculateBurnRate(transactions) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        const { expenses } = this.calculatePeriodTotals(
            transactions,
            startOfMonth,
            now
        );

        return expenses / daysInMonth;
    },

    /**
     * Calcula distribución por categorías
     */
    calculateCategoryDistribution(transactions, type = 'expense') {
        const filtered = transactions.filter(t => t.type === type);
        const distribution = {};

        filtered.forEach(t => {
            if (!distribution[t.category]) {
                distribution[t.category] = 0;
            }
            distribution[t.category] += t.amount;
        });

        return distribution;
    },

    /**
     * Calcula tendencia de balance (últimos 30 días vs 30 días anteriores)
     */
    calculateBalanceTrend(transactions) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recent = this.calculatePeriodTotals(transactions, thirtyDaysAgo, now);
        const previous = this.calculatePeriodTotals(transactions, sixtyDaysAgo, thirtyDaysAgo);

        if (previous.net === 0) return 0;
        return ((recent.net - previous.net) / Math.abs(previous.net)) * 100;
    },

    /**
     * Proyección de balance a 6 meses
     */
    calculateProjection(transactions, months = 6) {
        // Calcular promedio mensual de los últimos 3 meses
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

        const { income, expenses } = this.calculatePeriodTotals(
            transactions,
            threeMonthsAgo,
            now
        );

        const avgMonthlyNet = (income - expenses) / 3;
        const currentBalance = this.calculateTotalBalance(transactions);

        return currentBalance + (avgMonthlyNet * months);
    },

    /**
     * Calcula el índice de salud financiera (0-100)
     */
    calculateHealthScore(transactions) {
        let score = 50; // Base score

        const currentBalance = this.calculateTotalBalance(transactions);
        const { income, expenses } = this.calculateMonthlyTotals(transactions);
        const savingsRate = this.calculateSavingsRate(income, expenses);

        // Balance positivo (+20 puntos)
        if (currentBalance > 0) {
            score += 20;
        } else if (currentBalance < -1000) {
            score -= 20;
        }

        // Tasa de ahorro (+30 puntos máximo)
        if (savingsRate > 30) {
            score += 30;
        } else if (savingsRate > 20) {
            score += 20;
        } else if (savingsRate > 10) {
            score += 10;
        } else if (savingsRate < 0) {
            score -= 20;
        }

        // Tendencia positiva (+10 puntos)
        const trend = this.calculateBalanceTrend(transactions);
        if (trend > 0) {
            score += 10;
        } else if (trend < -10) {
            score -= 10;
        }

        // Diversificación de ingresos (bonus)
        const incomeCategories = Object.keys(
            this.calculateCategoryDistribution(transactions, 'income')
        ).length;
        if (incomeCategories > 1) {
            score += 10;
        }

        return Math.max(0, Math.min(100, score));
    },

    /**
     * Analiza tendencias temporales
     */
    analyzeTrends(transactions, days = 30) {
        const dataPoints = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const dayTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= startOfDay && tDate <= endOfDay;
            });

            const income = dayTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = dayTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            dataPoints.push({
                date: startOfDay.toISOString().split('T')[0],
                income,
                expenses,
                net: income - expenses
            });
        }

        return dataPoints;
    },

    /**
     * Detecta gastos recurrentes
     */
    detectRecurringExpenses(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        const recurring = {};

        expenses.forEach(expense => {
            const key = `${expense.category}-${Math.round(expense.amount)}`;
            if (!recurring[key]) {
                recurring[key] = {
                    category: expense.category,
                    amount: expense.amount,
                    occurrences: [],
                    description: expense.description
                };
            }
            recurring[key].occurrences.push(expense.date);
        });

        // Filtrar solo los que ocurren más de 2 veces
        return Object.values(recurring).filter(r => r.occurrences.length >= 2);
    },

    /**
     * Calcula ROI (Return on Investment) mensual
     */
    calculateROI(transactions) {
        const { income, expenses } = this.calculateMonthlyTotals(transactions);

        if (expenses === 0) return 0;
        return ((income - expenses) / expenses) * 100;
    },

    /**
     * Genera sugerencias basadas en datos
     */
    generateInsights(transactions) {
        const insights = [];
        const { income, expenses } = this.calculateMonthlyTotals(transactions);
        const savingsRate = this.calculateSavingsRate(income, expenses);
        const categoryDist = this.calculateCategoryDistribution(transactions);

        // Sugerencia sobre tasa de ahorro
        if (savingsRate < 10) {
            insights.push({
                type: 'warning',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos innecesarios.',
                icon: '⚠️'
            });
        } else if (savingsRate > 30) {
            insights.push({
                type: 'success',
                message: '¡Excelente! Estás ahorrando más del 30% de tus ingresos.',
                icon: '🎉'
            });
        }

        // Sugerencia sobre categoría con más gasto
        const topCategory = Object.entries(categoryDist)
            .sort((a, b) => b[1] - a[1])[0];

        if (topCategory && topCategory[1] > expenses * 0.4) {
            insights.push({
                type: 'info',
                message: `La categoría "${topCategory[0]}" representa el ${Math.round((topCategory[1] / expenses) * 100)}% de tus gastos.`,
                icon: 'ℹ️'
            });
        }

        return insights;
    },

    /**
     * Formatea cantidad como moneda
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    /**
     * Formatea porcentaje
     */
    formatPercent(value) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsEngine;
}
