import { MongoDB } from "./MongoDB";
import { Comment } from "../model/Comment";
import { ObjectID } from "bson";

export class CommentsDB extends MongoDB<Comment> {
    constructor() {
        super("comments")
    }

    public findByThreadId = async (prop: string, id: string) => {
        let query = {};
        query[prop] = id;
        return await this.DB.find(query).toArray();
    }
}
