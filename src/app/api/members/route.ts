/**
 * API Route: Members
 *
 * Next.js Route Handler for member CRUD operations.
 * Acts as an Interface Adapter between HTTP and Application Use Cases.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMemberUseCase, listMembersUseCase } from '@/infrastructure/di/container';
import { MemberCategory } from '@/domain/entities';

export async function GET() {
    try {
        const useCase = listMembersUseCase();
        const members = await useCase.execute();
        const data = members.map((m) => m.toPlainObject());
        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const useCase = createMemberUseCase();
        const member = await useCase.execute({
            firstName: body.firstName,
            lastName: body.lastName,
            dni: body.dni,
            email: body.email,
            phone: body.phone,
            address: body.address,
            birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
            category: body.category as MemberCategory,
        });
        return NextResponse.json(member.toPlainObject(), { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
