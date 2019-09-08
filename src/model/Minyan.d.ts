export interface Minyan {
    minyan: string;
    timeType: string; // exact or relative
    days: number[];
    time: string;
    before: string; // dawn...
    lastVerified: string;
}