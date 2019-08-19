import { ObjectId } from "bson";
import { Location } from "./Location";
import { Comment } from "./Comment";

export interface Lesson {
    _id: ObjectId;
    speakerId: ObjectId;
    lessonSubject: string;
    synagogueId?: ObjectId;
    location: Location;
    days: number[];
    notes: string;
    likes: ObjectId[];
    comments: Comment[];
}
