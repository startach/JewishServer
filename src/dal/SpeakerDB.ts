import { MongoDB } from "./MongoDB";
import { Speaker } from "../model/Speaker";


export class SpeakerDB extends MongoDB<Speaker> {
    constructor() {
        super("speakers")
    }

    public getAll = async () => {
        return await this.DB.find().toArray();
    }
    
}