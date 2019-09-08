import { MongoDB } from "./MongoDB";
import { User } from "../model/User";
import { ObjectID } from "bson";

export class UsersDB extends MongoDB<User> {
    constructor() {
        super("users")
    }

    public findByEmail = async (email: string) => {
        return await this.DB.findOne({email: email});
    }

    public updateCity = async (id: string, data: any) => {
        return await this.DB.updateOne({ _id: ObjectID.createFromHexString(id)},
            {$set: { cityName: data.cityName, location: data.location }
        });
    }

    public favorite = async (id: string, user_id: string, type: string) => {
        return await this.DB.updateOne(
            {_id: ObjectID.createFromHexString(user_id), favorites: {$ne: {entity_id: ObjectID.createFromHexString(id), type: type}}}, 
            {$inc: {favorites_count: 1}, $push: { favorites: {entity_id: ObjectID.createFromHexString(id), type: type}}}
        );
    }

    public unfavorite = async (id: string, user_id: string, type: string) => {
        return await this.DB.updateOne(
            {_id: ObjectID.createFromHexString(user_id), favorites: {entity_id: ObjectID.createFromHexString(id), type: type}}, 
            {$inc: {favorites_count: -1}, $pull: { favorites: {entity_id: ObjectID.createFromHexString(id), type: type}}}
        );
    }
}
