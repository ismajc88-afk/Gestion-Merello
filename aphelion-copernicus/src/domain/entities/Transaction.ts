export interface Transaction {
    id: string;
    memberId: string;
    type: 'ingreso' | 'gasto' | 'cuota' | 'recarga_cashless';
    concept: string;
    amount: number;
    date: string;
    status: 'completado' | 'pendiente' | 'rechazado' | 'reembolsado';
    paymentMethod: 'sepa' | 'stripe' | 'cashless' | 'efectivo';
}

export function calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((acc, t) => {
        if (t.status !== 'completado') return acc;
        return t.type === 'ingreso' || t.type === 'cuota' || t.type === 'recarga_cashless'
            ? acc + t.amount
            : acc - t.amount;
    }, 0);
}

export function getMonthlyIncome(transactions: Transaction[], month: number, year: number): number {
    return transactions
        .filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year && t.status === 'completado' && (t.type === 'ingreso' || t.type === 'cuota');
        })
        .reduce((acc, t) => acc + t.amount, 0);
}
