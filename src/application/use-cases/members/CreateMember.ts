/**
 * Use Case: CreateMember
 *
 * Application business rule for registering a new Fallero.
 * Depends only on domain interfaces, never on infrastructure.
 */

import { Member, MemberProps } from '@/domain/entities';
import { MemberRepository } from '@/domain/repositories';

export interface CreateMemberInput {
    firstName: string;
    lastName: string;
    dni: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate?: Date;
    category: MemberProps['category'];
}

export class CreateMember {
    constructor(private readonly memberRepository: MemberRepository) { }

    async execute(input: CreateMemberInput): Promise<Member> {
        const existingMember = await this.memberRepository.findByDni(input.dni);
        if (existingMember) {
            throw new Error(`Ya existe un fallero con el DNI ${input.dni}.`);
        }

        const member = Member.create({
            firstName: input.firstName,
            lastName: input.lastName,
            dni: input.dni,
            email: input.email,
            phone: input.phone,
            address: input.address,
            birthDate: input.birthDate,
            registrationDate: new Date(),
            isActive: true,
            category: input.category,
        });

        return this.memberRepository.save(member);
    }
}
