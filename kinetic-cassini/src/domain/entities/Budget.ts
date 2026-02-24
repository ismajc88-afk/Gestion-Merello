/**
 * Entity: Budget
 *
 * Represents the annual budget of the Falla.
 * Core domain entity — no external dependencies.
 */

export interface BudgetLineProps {
    id?: string;
    concept: string;
    estimatedAmount: number;
    actualAmount: number;
    type: 'INCOME' | 'EXPENSE';
}

export interface BudgetProps {
    id?: string;
    year: number;
    name: string;
    lines: BudgetLineProps[];
    approvedAt?: Date;
    createdAt: Date;
}

export class BudgetLine {
    private readonly props: BudgetLineProps;

    constructor(props: BudgetLineProps) {
        if (!props.concept || props.concept.trim().length === 0) {
            throw new Error('El concepto de la línea presupuestaria es obligatorio.');
        }
        if (props.estimatedAmount < 0) {
            throw new Error('El importe estimado no puede ser negativo.');
        }
        this.props = Object.freeze({ ...props });
    }

    get id(): string | undefined { return this.props.id; }
    get concept(): string { return this.props.concept; }
    get estimatedAmount(): number { return this.props.estimatedAmount; }
    get actualAmount(): number { return this.props.actualAmount; }
    get type(): 'INCOME' | 'EXPENSE' { return this.props.type; }
    get deviation(): number { return this.props.actualAmount - this.props.estimatedAmount; }
    get deviationPercent(): number {
        if (this.props.estimatedAmount === 0) return 0;
        return (this.deviation / this.props.estimatedAmount) * 100;
    }

    updateActual(amount: number): BudgetLine {
        return new BudgetLine({ ...this.props, actualAmount: amount });
    }

    toPlainObject(): BudgetLineProps { return { ...this.props }; }
}

export class Budget {
    private readonly props: BudgetProps;
    private readonly budgetLines: BudgetLine[];

    private constructor(props: BudgetProps) {
        Budget.validate(props);
        this.budgetLines = props.lines.map((l) => new BudgetLine(l));
        this.props = Object.freeze({ ...props });
    }

    static create(props: Omit<BudgetProps, 'createdAt' | 'lines'> & { lines?: BudgetLineProps[] }): Budget {
        return new Budget({
            ...props,
            lines: props.lines ?? [],
            createdAt: new Date(),
        });
    }

    static reconstitute(props: BudgetProps): Budget {
        return new Budget(props);
    }

    private static validate(props: BudgetProps): void {
        if (!props.year || props.year < 2000 || props.year > 2100) {
            throw new Error('El año del presupuesto no es válido.');
        }
        if (!props.name || props.name.trim().length === 0) {
            throw new Error('El nombre del presupuesto es obligatorio.');
        }
    }

    // --- Getters ---

    get id(): string | undefined { return this.props.id; }
    get year(): number { return this.props.year; }
    get name(): string { return this.props.name; }
    get lines(): BudgetLine[] { return [...this.budgetLines]; }
    get approvedAt(): Date | undefined { return this.props.approvedAt; }
    get createdAt(): Date { return this.props.createdAt; }
    get isApproved(): boolean { return this.props.approvedAt !== undefined; }

    get totalEstimatedIncome(): number {
        return this.budgetLines
            .filter((l) => l.type === 'INCOME')
            .reduce((sum, l) => sum + l.estimatedAmount, 0);
    }

    get totalEstimatedExpenses(): number {
        return this.budgetLines
            .filter((l) => l.type === 'EXPENSE')
            .reduce((sum, l) => sum + l.estimatedAmount, 0);
    }

    get estimatedBalance(): number {
        return this.totalEstimatedIncome - this.totalEstimatedExpenses;
    }

    get totalActualIncome(): number {
        return this.budgetLines
            .filter((l) => l.type === 'INCOME')
            .reduce((sum, l) => sum + l.actualAmount, 0);
    }

    get totalActualExpenses(): number {
        return this.budgetLines
            .filter((l) => l.type === 'EXPENSE')
            .reduce((sum, l) => sum + l.actualAmount, 0);
    }

    get actualBalance(): number {
        return this.totalActualIncome - this.totalActualExpenses;
    }

    // --- Domain Methods ---

    addLine(line: BudgetLineProps): Budget {
        return Budget.reconstitute({
            ...this.props,
            lines: [...this.props.lines, line],
        });
    }

    approve(): Budget {
        if (this.isApproved) {
            throw new Error('El presupuesto ya está aprobado.');
        }
        return Budget.reconstitute({
            ...this.props,
            approvedAt: new Date(),
        });
    }

    toPlainObject(): BudgetProps {
        return {
            ...this.props,
            lines: this.budgetLines.map((l) => l.toPlainObject()),
        };
    }
}
