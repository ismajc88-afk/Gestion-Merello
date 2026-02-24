/**
 * API Route: Treasury Summary
 *
 * Returns aggregated financial data for the dashboard.
 */

import { NextResponse } from 'next/server';
import { getTreasurySummaryUseCase } from '@/infrastructure/di/container';

export async function GET() {
    try {
        const useCase = getTreasurySummaryUseCase();
        const summary = await useCase.execute();
        return NextResponse.json(summary);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
