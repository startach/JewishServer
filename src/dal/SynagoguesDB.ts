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

    public search = async (query: SearchQuery) => {
        const innerQuery: InnerQuery = {};

        if (!!query.name)
            innerQuery.name = { "$regex": ".*" + query.name + ".*" };
        if (!!query.address)
            innerQuery.address = { "$regex": ".*" + query.address + ".*" };
        if (!!query.days)
            innerQuery["minyans.days"] = { "$all": query.days };
        if (!!query.hours) {
            if (query.hours.length > 0)
                innerQuery["minyans.startTime"] = { "$gte": query.hours[0] };
            if (query.hours.length > 1)
                innerQuery["minyans.endTime"] = { "$lte": query.hours[1] };
        }
        if (!!query.mikve)
            innerQuery["externals.mikve"] = query.mikve;
        if (!!query.parking)
            innerQuery["externals.parking"] = query.parking;
        if (!!query.disabled_access)
            innerQuery["externals.disabled_access"] = query.disabled_access;
        if (!!query.shtiblach)
            innerQuery["externals.shtiblach"] = query.shtiblach;

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
}
