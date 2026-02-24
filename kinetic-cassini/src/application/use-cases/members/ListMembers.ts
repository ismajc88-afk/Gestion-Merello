/**
 * Use Case: ListMembers
 *
 * Application business rule for listing all Falleros.
 */

import { Member } from '@/domain/entities';
import { MemberRepository } from '@/domain/repositories';

export class ListMembers {
    constructor(private readonly memberRepository: MemberRepository) { }

    async execute(onlyActive = false): Promise<Member[]> {
        if (onlyActive) {
            return this.memberRepository.findActive();
        }
        return this.memberRepository.findAll();
    }
}
