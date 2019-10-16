import { ObjectId } from "bson";
import { Location } from "./Location";
import { Minyan } from "./Minyan";
import { Like } from "./Like";

export interface Synagogue {
    name: string;
    address: string;
    location: Location;
    nosach: string;
    minyans: Minyan[];
    externals: {
        mikve: boolean;
        parking: boolean;
        disabled_access: boolean;
    };
    shtiblach: boolean;
    phone_number: string[];
    comments: Comment[];
    image: any;
    lessons: ObjectId[];
    donation_link: string;
    notes: string;
    likes: Like[];
    likes_count: number;
    last_updated: Date;
}