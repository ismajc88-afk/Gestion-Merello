/**
 * Infrastructure: InMemoryMemberRepository
 *
 * In-memory implementation of MemberRepository.
 * Used for development and testing — will be replaced by a DB adapter.
 */

import { Member, MemberProps } from '@/domain/entities';
import { MemberRepository } from '@/domain/repositories';

export class InMemoryMemberRepository implements MemberRepository {
    private members: Map<string, MemberProps> = new Map();

    async findById(id: string): Promise<Member | null> {
        const data = this.members.get(id);
        return data ? Member.reconstitute(data) : null;
    }

    async findByDni(dni: string): Promise<Member | null> {
        for (const data of this.members.values()) {
            if (data.dni === dni) {
                return Member.reconstitute(data);
            }
        }
        return null;
    }

    async findAll(): Promise<Member[]> {
        return Array.from(this.members.values()).map((d) => Member.reconstitute(d));
    }

    async findActive(): Promise<Member[]> {
        return Array.from(this.members.values())
            .filter((d) => d.isActive)
            .map((d) => Member.reconstitute(d));
    }

    async save(member: Member): Promise<Member> {
        const data = member.toPlainObject();
        const id = data.id ?? crypto.randomUUID();
        const saved = { ...data, id };
        this.members.set(id, saved);
        return Member.reconstitute(saved);
    }

    async delete(id: string): Promise<void> {
        this.members.delete(id);
    }

    async count(): Promise<number> {
        return this.members.size;
    }
}
