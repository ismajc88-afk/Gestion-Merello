/**
 * Repository Interface: TransactionRepository
 *
 * Abstraction for Transaction data persistence.
 * Part of the Domain layer — implementations live in Infrastructure.
 */

import { Transaction, TransactionType } from '@/domain/entities';

export interface TransactionFilters {
    type?: TransactionType;
    memberId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface TransactionRepository {
    findById(id: string): Promise<Transaction | null>;
    findAll(filters?: TransactionFilters): Promise<Transaction[]>;
    findByMemberId(memberId: string): Promise<Transaction[]>;
    save(transaction: Transaction): Promise<Transaction>;
    delete(id: string): Promise<void>;
    getTotalByType(type: TransactionType, dateFrom?: Date, dateTo?: Date): Promise<number>;
}
