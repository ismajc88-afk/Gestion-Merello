/**
 * Repository Interface: BudgetRepository
 *
 * Abstraction for Budget data persistence.
 * Part of the Domain layer — implementations live in Infrastructure.
 */

import { Budget } from '@/domain/entities';

export interface BudgetRepository {
    findById(id: string): Promise<Budget | null>;
    findByYear(year: number): Promise<Budget | null>;
    findAll(): Promise<Budget[]>;
    save(budget: Budget): Promise<Budget>;
    delete(id: string): Promise<void>;
}
