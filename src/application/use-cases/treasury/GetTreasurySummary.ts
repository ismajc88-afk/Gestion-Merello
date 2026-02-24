/**
 * Use Case: GetTreasurySummary
 *
 * Application business rule for retrieving a summary of income, expense, and balance.
 */

import { TransactionType } from '@/domain/entities';
import { TransactionRepository, MemberRepository } from '@/domain/repositories';

export interface TreasurySummary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    memberCount: number;
}

export class GetTreasurySummary {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly memberRepository: MemberRepository,
    ) { }

    async execute(): Promise<TreasurySummary> {
        const [totalIncome, totalExpenses, memberCount] = await Promise.all([
            this.transactionRepository.getTotalByType(TransactionType.INCOME),
            this.transactionRepository.getTotalByType(TransactionType.EXPENSE),
            this.memberRepository.count(),
        ]);

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            memberCount,
        };
    }
}
