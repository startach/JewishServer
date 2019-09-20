import { MongoDB } from "./MongoDB";
import { AppData } from "../model/AppData";

export class AppDataDB extends MongoDB<AppData> {
    constructor() {
        super("app_data")
    }

    public findByTitle = async (title: string) => {
        return await this.DB.findOne({title: title});
    }
}
