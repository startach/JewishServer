import { Collection, MongoClient, ObjectID } from "mongodb";
import { SearchQuery } from "../model/searchQuery";
import { InnerQuery } from "../model/innerQuery";
import { SynagogueDBModel } from "../model/synagogueDBModel";
import { SynagogueModel } from "../model/synagogueModel";

const connectionUrl = "mongodb://startach:gG123456@ds235022.mlab.com:35022/jewish_world";

export class SynagogueDB {
    private synagoguesDB: Collection<SynagogueDBModel>;
    constructor() {
        this.initializeDB();
    }

    public getById = async (id: string) => {
        const model = await this.synagoguesDB.findOne({ "_id": ObjectID.createFromHexString(id) });
        return this.convertDBModelToSynagogue(model);
    }

    public getLessonsAndSynagoguesByCity = async (city: string) => {
        const model = await this.synagoguesDB.findOne({ "_id": ObjectID.createFromHexString(city) });
        return this.convertDBModelToSynagogue(model);
    }

    public createSynagogue = async (synagogue: SynagogueModel) => {
        const model = this.convertSynagogueToDBModel(synagogue);
        return await this.synagoguesDB.insertOne(model);
    }

    public updateSynagogueById = async (id: string, updateParams: JSON) => {
        return await this.synagoguesDB.updateOne({ "_id": ObjectID.createFromHexString(id) }, updateParams);
    }

    public deleteSynagoguebyId = async (id: string) => {
        return await this.synagoguesDB.deleteOne({ "_id": ObjectID.createFromHexString(id) });
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
                innerQuery["minyans.startTime"] = { "$gte": this.timeToFloat(query.hours[0]) };
            if (query.hours.length > 1)
                innerQuery["minyans.endTime"] = { "$lte": this.timeToFloat(query.hours[1]) };
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
                            query.lat]
                    },
                    $maxDistance: Math.round(query.max_radius * 1000),
                    $minDistance: Math.round(query.min_radius * 1000),
                }
            };

        if (Object.keys(innerQuery).some(key => !innerQuery[key]))
            return { success: false, message: "No valid query received" };

        try {
            const models = await
                this.synagoguesDB
                    .find(innerQuery)
                    .map((model) => this.convertDBModelToSynagogue(model))
                    .limit(20)
                    .toArray();
            return { success: true, message: models };
        } catch (e) {
            return { success: false, message: e };
        }
    }

    private initializeDB = async () => {
        const client = await MongoClient.connect(connectionUrl, { useNewUrlParser: true });
        this.synagoguesDB = client.db().collection("synagogues");
    }

    private timeToFloat = (time: string) => {
        if (!!time)
            return undefined;
        const [hour, minute] = time.split(':');
        return parseInt(hour) + parseInt(minute) / 60;
    }

    private floatToTime = (time: number) => {
        if (time == null) {
            return null;
        }
        let hour = new String(Math.floor(time));
        if (hour.length == 1)
            hour = "0" + hour;

        let minute = new String(Math.round((time - Math.floor(time)) * 60));
        if (minute.length == 1)
            minute = "0" + minute;

        const time_str = hour + ":" + minute;

        return time_str;
    }

    private convertDBModelToSynagogue = (model: SynagogueDBModel): SynagogueModel => {
        return {
            ...model,
            _id: model._id.toHexString(),
            minyans: model.minyans.map(minyan => ({
                ...minyan,
                startTime: this.floatToTime(minyan.startTime),
                endTime: this.floatToTime(minyan.endTime)
            }))
        };
    }

    private convertSynagogueToDBModel = (synagogue: SynagogueModel): SynagogueDBModel => {
        return {
            ...synagogue,
            _id: ObjectID.createFromHexString(synagogue._id),
            minyans: synagogue.minyans.map(minyanDB => ({
                ...minyanDB,
                startTime: this.timeToFloat(minyanDB.startTime),
                endTime: this.timeToFloat(minyanDB.endTime)
            }))
        };
    }
}
