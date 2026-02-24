/**
 * Infrastructure: InMemoryTransactionRepository
 *
 * In-memory implementation of TransactionRepository.
 * Used for development and testing.
 */

import { Transaction, TransactionProps, TransactionType } from '@/domain/entities';
import { TransactionRepository, TransactionFilters } from '@/domain/repositories';

export class InMemoryTransactionRepository implements TransactionRepository {
    private transactions: Map<string, TransactionProps> = new Map();

    async findById(id: string): Promise<Transaction | null> {
        const data = this.transactions.get(id);
        return data ? Transaction.reconstitute(data) : null;
    }

    async findAll(filters?: TransactionFilters): Promise<Transaction[]> {
        let results = Array.from(this.transactions.values());

        if (filters?.type) {
            results = results.filter((t) => t.type === filters.type);
        }
        if (filters?.memberId) {
            results = results.filter((t) => t.memberId === filters.memberId);
        }
        if (filters?.dateFrom) {
            results = results.filter((t) => new Date(t.date) >= filters.dateFrom!);
        }
        if (filters?.dateTo) {
            results = results.filter((t) => new Date(t.date) <= filters.dateTo!);
        }

        return results.map((d) => Transaction.reconstitute(d));
    }

    async findByMemberId(memberId: string): Promise<Transaction[]> {
        return this.findAll({ memberId });
    }

    async save(transaction: Transaction): Promise<Transaction> {
        const data = transaction.toPlainObject();
        const id = data.id ?? crypto.randomUUID();
        const saved = { ...data, id };
        this.transactions.set(id, saved);
        return Transaction.reconstitute(saved);
    }

    async delete(id: string): Promise<void> {
        this.transactions.delete(id);
    }

    async getTotalByType(type: TransactionType, dateFrom?: Date, dateTo?: Date): Promise<number> {
        const transactions = await this.findAll({ type, dateFrom, dateTo });
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    }
}
