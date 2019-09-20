import { Lesson } from "../model/Lesson";
import { SearchQuery } from "../model/SearchQuery";
import { InnerQuery } from "../model/InnerQuery";
import { MongoDB } from "./MongoDB";
import { ObjectID } from "bson";

export class LessonsDB extends MongoDB<Lesson> {
    constructor() {
        super("lessons")
    }

    public like = async (lesson_id: string, user_id: string) => {
        return await this.DB.updateOne(
            {_id: ObjectID.createFromHexString(lesson_id), likes: {$ne: ObjectID.createFromHexString(user_id)}},
            {$inc: {likes_count: 1}, $push: { likes: ObjectID.createFromHexString(user_id)}}
        );
    }

    public unlike = async (lesson_id: string, user_id: string) => {
        return await this.DB.updateOne(
            {_id: ObjectID.createFromHexString(lesson_id), likes: ObjectID.createFromHexString(user_id)},
            {$inc: {likes_count: -1}, $pull: { likes: ObjectID.createFromHexString(user_id)}}
        );
    }

    public getLessonsByLocation = async (query) => {
        // @ts-ignore
        var innerQuery: InnerQuery = {};

        if (!!query.lat && !!query.lon)
            innerQuery.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            query.lon,
                            query.lat
                        ]
                    },
                    $minDistance: 0,
                    $maxDistance: 10000,
                }
            };

        if (Object.keys(innerQuery).some(key => !innerQuery[key]))
            return { success: false, message: "No valid query received" };
            
        return await this.DB
            .find(innerQuery)
            .limit(query.limit)
            .toArray();
    }
   
    public getTodayLessons = async (query) => {
        return await this.DB.find({days: query.today}).limit(query.limit).toArray();
    }

    public getRecentLessons = async (query) => {
        return await this.DB.find({}).sort({_id:-1}).limit(query.limit).toArray();
    }

    public getPopularLessons = async (query) => {
        return await this.DB.find({}).sort({likes_count:-1}).limit(query.limit).toArray();
    }

    public search = async (query: SearchQuery) => {
        //@ts-ignore
        const innerQuery: InnerQuery = {};

        if (!!query.lat && !!query.lon && !!query.min_radius && !!query.max_radius)
            innerQuery.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            query.lon,
                            query.lat
                        ]
                    },
                    $maxDistance: Math.round(query.max_radius * 1000),
                    $minDistance: Math.round(query.min_radius * 1000),
                }
            };

        if (Object.keys(innerQuery).some(key => !innerQuery[key]))
            return { success: false, message: "No valid query received" };

        return await this.DB
            .find(innerQuery)
            .limit(20)
            .toArray();
    }
    
    public autocomplete = async (address: string) => {
        return await this.DB.find({address: {"$regex":".*" + address + ".*", "$options": 'i'}}).project({_id: 1, address: 1, location: 1}).toArray();
    }
}
