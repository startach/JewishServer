import { SearchQuery } from "../model/SearchQuery";
import { InnerQuery } from "../model/InnerQuery";
import { Synagogue } from "../model/Synagogue";
import { MongoDB } from "./MongoDB";
import { ObjectID } from "bson";

export class SynagoguesDB extends MongoDB<Synagogue> {
    constructor() {
        super("synagogues");
    }

    public like = async (synagogue_id: string, user_id: string) => {
        return await this.DB.updateOne(
            {_id: ObjectID.createFromHexString(synagogue_id), likes: {$ne: ObjectID.createFromHexString(user_id)}},
            {$inc: {likes_count: 1}, $push: { likes: ObjectID.createFromHexString(user_id)}}
        );
    }

    public unlike = async (synagogue_id: string, user_id: string) => {
        return await this.DB.updateOne(
            {_id: ObjectID.createFromHexString(synagogue_id), likes: ObjectID.createFromHexString(user_id)},
            {$inc: {likes_count: -1}, $pull: { likes: ObjectID.createFromHexString(user_id)}}
        );
    }

    public autocomplete = async (name: string) => {
        return await this.DB.find({name: {"$regex":".*" + name + ".*", "$options": 'i'}}).project({_id: 1, name: 1, address: 1, location: 1}).toArray();
    }

    public search = async (query: SearchQuery) => {
        // @ts-ignore
        const innerQuery: InnerQuery = {};
        let sort: object;

        if (!!query.name){
            innerQuery.name = { "$regex": ".*" + query.name + ".*", "$options": 'i'};
        }

        innerQuery["$or"] = [{"shtiblach":true}];

        if(!!query.startTime && !!query.endTime){
            let start:any = query.startTime.split(':');
            start = (+start[0]) * 60 * 60 + (+start[1]) * 60;
            let end:any = query.endTime.split(':');
            end = (+end[0]) * 60 * 60 + (+end[1]) * 60;
            
            innerQuery["$or"].push({"minyans.time": { "$lte": end, "$gte": start }});
            innerQuery["minyans.days"] = query.today;
        }

        if(!!query.sortBy){
            if(query.sortBy == 'time'){
                sort = {"sort": {"minyans.time":1}}
            }
        }

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
                    $minDistance: Math.round(query.min_radius * 1000),
                    $maxDistance: Math.round(query.max_radius * 1000),
                }
            };

        if (Object.keys(innerQuery).some(key => !innerQuery[key]))
            return { success: false, message: "No valid query received" };

        return await this.DB
            .find(innerQuery, sort)
            .limit(20)
            .toArray();
    }

    public addressAutocomplete = async (address: string) => {
        return await this.DB.find({address: {"$regex":".*" + address + ".*", "$options": 'i'}}).project({_id: 1, name: 1, address: 1, location: 1}).toArray();
    }
}
