/**
 * Use Case: RecordTransaction
 *
 * Application business rule for recording an income or expense.
 */

import { Transaction, TransactionProps } from '@/domain/entities';
import { TransactionRepository } from '@/domain/repositories';

export type RecordTransactionInput = Omit<TransactionProps, 'id' | 'createdAt'>;

export class RecordTransaction {
    constructor(private readonly transactionRepository: TransactionRepository) { }

    async execute(input: RecordTransactionInput): Promise<Transaction> {
        const transaction = Transaction.create(input);
        return this.transactionRepository.save(transaction);
    }
}
