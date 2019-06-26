import { Collection, Db, MongoClient, ObjectID } from "mongodb";

const connectionUrl = "mongodb://startach:gG123456@ds235022.mlab.com:35022/jewish_world";

export class SynagogueDB {
    private synagoguesDB: Collection<any>;
    constructor() {
        this.initializeDB();
    }

    public getById = async (id: string) => {
        return await this.synagoguesDB.findOne({ "_id": ObjectID.createFromHexString(id) });
    }

    public createSynagogue = async (synagogue: JSON) => {
        return await this.synagoguesDB.insertOne(synagogue);
    }

    public updateSynagogueById = async (id: string, updateParams: JSON) => {
        return await this.synagoguesDB.updateOne({ "_id": ObjectID.createFromHexString(id) }, updateParams);
    }

    public deleteSynagoguebyId = async (id: string) => {
        return await this.synagoguesDB.deleteOne({ "_id": ObjectID.createFromHexString(id) });
    }

    public search = async (query: any) => {
        const innerQuery: any = {};

        const rangeKeys: any[] = [];

        let lim = 15;

        for (const [key, v] of Object.entries(query)) {
            let value: any = v as any;
            if (value === "true") {
                value = true;
            } else if (value === "false") {
                value = false;
            } else if (value in ["none", "null"]) {
                value = null;
            }

            if (key in ["name", "address"]) {
                if (!(value instanceof String)) {
                    return { success: false, message: "Wrong Type: " + key + " type of value is: " + value };
                }

                innerQuery[key] = { $regex: ".*" + value + ".*" };
            } else if (key === "days") {
                if (!(value instanceof Array)) {
                    return { success: false, message: "Wrong Type: " + key + " type of value is: " + value };
                }

                innerQuery["minyans.days"] = { $all: value };
            } else if (key === "hours") {
                if (!(value[0] instanceof String) || !(value[1] instanceof String)) {
                    return { success: false, message: "Wrong Type: " + key };
                }

                innerQuery["minyans.startTime"] = { $gte: this.timeToFloat(value[0]) };
                innerQuery["minyans.endTime"] = { $lte: this.timeToFloat(value[1]) };
            } else if (key in ["mikve", "parking", "disabled_access", "shtiblach"]) {
                if (!(value instanceof Boolean)) {
                    return { success: false, message: "Wrong Type: " + key + " type of value is: " + value };
                }

                innerQuery["externals." + key] = value;
            } else if (key in ["lat", "lon", "min_radius", "max_radius"]) {
                if (!(value instanceof Number) && !(value instanceof Boolean)) {
                    return { success: false, message: "Wrong Type: " + key + " type of value is: " + value };
                }

                rangeKeys.push(key);
            }

            if (["lat", "lon", "min_radius", "max_radius"].every((k) => (k in rangeKeys))) {
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
                lim = 500;
            } else if ("lat" in rangeKeys || "lon" in rangeKeys ||
                "min_radius" in rangeKeys || "max_radius" in rangeKeys) {
                return { success: false, message: "Missing keys" };
            }

            try {
                const models = this.synagoguesDB.find(innerQuery).limit(lim);
                const result = models.map((model) => this.convertModelToSynagogue(model));
                return { success: true, message: result };
            } catch (e) {
                return { success: false, message: e };
            }
        }
    }

    private initializeDB = async () => {
        const client = await MongoClient.connect(connectionUrl, { useNewUrlParser: true });
        this.synagoguesDB = client.db().collection("synagogues");
    }

    private timeToFloat = (hour) => {
        // const t = datetime.datetime.strptime(hour, "%H:%M").time();
        // return t.hour + t.minute / 60;
        return null;
    }

    private floatToTime = (time) => {
        // if (time == null) {
        //     return null;
        // }
        // let hour = str(int(time));
        // if len(hour) == 1 {:
        //     hour = "0" + hour;
        // }

        // let minute = str((time - int(time)) * 60);
        // if len(minute) == 1 {:
        //     minute = "0" + minute;
        // }

        // const time_str = hour + ":" + minute;

        // return time_str;
        return null;
    }

    private convertModelToSynagogue = (model) => {
        for (const minyan of model.minyans) {
            minyan.startTime = this.floatToTime(minyan.startTime);
            try {
                minyan.endTime = this.floatToTime(minyan.endTime);
            } catch (e) {
                minyan.endTime = null;
            }
        }
        return model;
    }
}
