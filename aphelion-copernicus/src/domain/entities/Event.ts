export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'reunion' | 'fiesta' | 'ensayo' | 'ofrenda' | 'mascletà' | 'otro';
    attendees: string[];
    maxCapacity?: number;
    mandatory: boolean;
}

export function isUpcoming(event: Event): boolean {
    return new Date(event.date) > new Date();
}

export function getAttendanceRate(event: Event, totalMembers: number): number {
    return Math.round((event.attendees.length / totalMembers) * 100);
}

export function getDaysUntilPlanta(fromDate: Date = new Date()): number {
    const year = fromDate.getFullYear();
    let planta = new Date(year, 2, 15);
    if (fromDate > planta) {
        planta = new Date(year + 1, 2, 15);
    }
    const diff = planta.getTime() - fromDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
