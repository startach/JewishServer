import { MongoDB } from "./MongoDB";
import { Comment } from "../model/Comment";
import { ObjectID } from "bson";

export class CommentsDB extends MongoDB<Comment> {
    constructor() {
        super("comments")
    }

    public findByThreadId = async (id: string) => {
        return await this.DB.find({synagogue_id: id}).toArray();
    }
}
