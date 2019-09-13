export interface Minyan {
    minyan: string;
    timeType: string; // exact or relative
    days: number[];
    time: number;
    timeString: string;
    offset: number; // minutes
    sun_position: string; // sunset or sunrise
    lastVerified: Date;
}