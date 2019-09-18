import { MongoDB } from "./MongoDB";
import { Speaker } from "../model/Speaker";
import { SearchQuery } from "../model/SearchQuery";
import { InnerQuery } from "../model/InnerQuery";


export class SpeakerDB extends MongoDB<Speaker> {
    constructor() {
        super("speakers")
    }

    public getAll = async () => {
        return await this.DB.find().toArray();
    }
    public autocomplete = async (name: string) => {
        return await this.DB.find({name: {"$regex":".*" + name + ".*", "$options": 'i'}}).toArray();
    }

    public search = async (query: SearchQuery) => {
        // @ts-ignore
        const innerQuery: InnerQuery = {};

        if (!!query.name)
            innerQuery.name = { "$regex": ".*" + query.name + ".*" };
        if (Object.keys(innerQuery).some(key => !innerQuery[key]))
            return { success: false, message: "No valid query received" };

        return await this.DB
            .find(innerQuery)
            .limit(20)
            .toArray();
    }
}