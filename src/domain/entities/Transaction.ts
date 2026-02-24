/**
 * Entity: Transaction
 *
 * Represents a financial transaction (income or expense) of the Falla.
 * Core domain entity — no external dependencies.
 */

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
    // Ingresos
    CUOTA = 'CUOTA',
    LOTERIA = 'LOTERIA',
    SUBVENCION = 'SUBVENCION',
    EVENTO = 'EVENTO',
    DONACION = 'DONACION',
    RIFA = 'RIFA',
    OTRO_INGRESO = 'OTRO_INGRESO',
    // Gastos
    MONUMENTO = 'MONUMENTO',
    PIROTECNIA = 'PIROTECNIA',
    MUSICA = 'MUSICA',
    CATERING = 'CATERING',
    ALQUILER = 'ALQUILER',
    SUMINISTROS = 'SUMINISTROS',
    INDUMENTARIA = 'INDUMENTARIA',
    OTRO_GASTO = 'OTRO_GASTO',
}

export interface TransactionProps {
    id?: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    description: string;
    date: Date;
    memberId?: string;
    receiptUrl?: string;
    createdBy: string;
    createdAt: Date;
}

export class Transaction {
    private readonly props: TransactionProps;

    private constructor(props: TransactionProps) {
        Transaction.validate(props);
        this.props = Object.freeze({ ...props });
    }

    static create(props: Omit<TransactionProps, 'createdAt'>): Transaction {
        return new Transaction({
            ...props,
            createdAt: new Date(),
        });
    }

    static reconstitute(props: TransactionProps): Transaction {
        return new Transaction(props);
    }

    private static validate(props: TransactionProps): void {
        if (props.amount <= 0) {
            throw new Error('El importe debe ser mayor que cero.');
        }
        if (!props.description || props.description.trim().length === 0) {
            throw new Error('La descripción de la transacción es obligatoria.');
        }
        if (!props.date) {
            throw new Error('La fecha de la transacción es obligatoria.');
        }
        if (!props.createdBy || props.createdBy.trim().length === 0) {
            throw new Error('El creador de la transacción es obligatorio.');
        }
    }

    // --- Getters ---

    get id(): string | undefined {
        return this.props.id;
    }

    get type(): TransactionType {
        return this.props.type;
    }

    get category(): TransactionCategory {
        return this.props.category;
    }

    get amount(): number {
        return this.props.amount;
    }

    get signedAmount(): number {
        return this.props.type === TransactionType.INCOME
            ? this.props.amount
            : -this.props.amount;
    }

    get description(): string {
        return this.props.description;
    }

    get date(): Date {
        return this.props.date;
    }

    get memberId(): string | undefined {
        return this.props.memberId;
    }

    get receiptUrl(): string | undefined {
        return this.props.receiptUrl;
    }

    get createdBy(): string {
        return this.props.createdBy;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get isIncome(): boolean {
        return this.props.type === TransactionType.INCOME;
    }

    get isExpense(): boolean {
        return this.props.type === TransactionType.EXPENSE;
    }

    // --- Domain Methods ---

    attachReceipt(receiptUrl: string): Transaction {
        return Transaction.reconstitute({ ...this.props, receiptUrl });
    }

    toPlainObject(): TransactionProps {
        return { ...this.props };
    }
}
