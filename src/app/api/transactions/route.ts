/**
 * API Route: Transactions
 *
 * Next.js Route Handler for transaction CRUD operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordTransactionUseCase } from '@/infrastructure/di/container';
import { TransactionType, TransactionCategory } from '@/domain/entities';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const useCase = recordTransactionUseCase();
        const transaction = await useCase.execute({
            type: body.type as TransactionType,
            category: body.category as TransactionCategory,
            amount: Number(body.amount),
            description: body.description,
            date: new Date(body.date),
            memberId: body.memberId,
            receiptUrl: body.receiptUrl,
            createdBy: body.createdBy ?? 'system',
        });
        return NextResponse.json(transaction.toPlainObject(), { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
