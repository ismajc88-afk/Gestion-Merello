export interface Member {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    joinYear: number;
    birthDate: string;
    category: 'adulto' | 'infantil' | 'jubilado';
    status: 'activo' | 'baja' | 'pendiente';
    familyId?: string;
    clothingSize?: string;
    allergies: string[];
    xpPoints: number;
}

export function calculateBunyolYears(joinYear: number, currentYear: number): number {
    return currentYear - joinYear;
}

export function getBunyolCategory(years: number): string {
    if (years >= 25) return "Bunyol d'Or";
    if (years >= 15) return "Bunyol de Plata";
    if (years >= 5) return "Bunyol de Bronze";
    return "Sin bunyol";
}

export function calculateFamilyDiscount(familyMemberCount: number, totalYears: number): number {
    if (familyMemberCount >= 4 && totalYears >= 50) return 20;
    if (familyMemberCount >= 3 && totalYears >= 30) return 15;
    if (familyMemberCount >= 2) return 10;
    return 0;
}
