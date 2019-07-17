export interface SynagogueModel {
    _id: string;
    name: string;
    address: string;
    location: {
        type: string;
        coordinates: number[];
    };
    nosach: string;
    minyans: {
        minyan: string;
        days: number[];
        startTime: string;
        endTime?: string;
        lastVerified: string;
    }[];
    externals: {
        mikve: boolean;
        parking: boolean;
        disabled_access: boolean;
        shtiblach: boolean;
    };
    phone_number: string[];
    comments: string;
    image: any;
    lessons: any[];
}