/**
 * Repository Interface: MemberRepository
 *
 * Abstraction for Member data persistence.
 * Part of the Domain layer — implementations live in Infrastructure.
 */

import { Member } from '@/domain/entities';

export interface MemberRepository {
    findById(id: string): Promise<Member | null>;
    findByDni(dni: string): Promise<Member | null>;
    findAll(): Promise<Member[]>;
    findActive(): Promise<Member[]>;
    save(member: Member): Promise<Member>;
    delete(id: string): Promise<void>;
    count(): Promise<number>;
}
