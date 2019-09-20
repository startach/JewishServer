import { ObjectId } from "bson";
import { Location } from "./Location";
import { Comment } from "./Comment";
import { Like } from "./Like";

export interface Lesson {
    _id: ObjectId;
    speakerId: ObjectId;
    lessonSubject: string;
    synagogueId?: ObjectId;
    location: Location;
    address: string;
    days: number[];
    notes: string;
    likes: Like[];
    comments: Comment[];
    audience: string;
    contact_name: string;
    contact_number: string;
    isEvent: boolean;
}
