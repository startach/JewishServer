import { ObjectID } from "bson";
import { MongoClient, Collection } from "mongodb";

//const connectionUrl = "mongodb://startach:gG123456@ds235022.mlab.com:35022/jewish_world";
const connectionUrl = "mongodb://localhost:27017/jewish_world";

export class MongoDB<T> {
    protected DB: Collection<T>;

    constructor(collentionName: string) {
        this.initializeDB(collentionName);
    }

    public getAll = async () => {
        return await this.DB.find({}).toArray();
    }

    public getById = async (id: string) => {
        return await this.DB.findOne({ "_id": ObjectID.createFromHexString(id) });
    }

    public create = async (model: T) => {
        return await this.DB.insertOne(model);
    }

    public updateById = async ({ id, updateParams }: { id: string, updateParams: object }) => {
        return await this.DB.updateOne({ "_id": ObjectID.createFromHexString(id) }, updateParams);
    }

    public deleteById = async (id: string) => {
        return await this.DB.deleteOne({ "_id": ObjectID.createFromHexString(id) });
    }

    private initializeDB = async (collectionName: string) => {
        const client = await MongoClient.connect(connectionUrl, { useNewUrlParser: true });
        this.DB = client.db().collection(collectionName);
    }
}