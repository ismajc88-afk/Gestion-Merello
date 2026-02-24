/**
 * Dependency Injection Container
 *
 * Wires together domain interfaces with infrastructure implementations.
 * This is the composition root — the only place that knows about concrete classes.
 */

import { InMemoryMemberRepository, InMemoryTransactionRepository } from '@/infrastructure/repositories';
import { CreateMember, ListMembers, RecordTransaction, GetTreasurySummary } from '@/application/use-cases';

// --- Singleton Repositories (persist data during dev server lifecycle) ---
const memberRepository = new InMemoryMemberRepository();
const transactionRepository = new InMemoryTransactionRepository();

// --- Use Case Factories ---
export function createMemberUseCase(): CreateMember {
    return new CreateMember(memberRepository);
}

export function listMembersUseCase(): ListMembers {
    return new ListMembers(memberRepository);
}

export function recordTransactionUseCase(): RecordTransaction {
    return new RecordTransaction(transactionRepository);
}

export function getTreasurySummaryUseCase(): GetTreasurySummary {
    return new GetTreasurySummary(transactionRepository, memberRepository);
}
