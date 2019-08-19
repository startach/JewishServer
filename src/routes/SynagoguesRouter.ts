import { SynagoguesDB } from "../dal/SynagoguesDB";
import { BaseRouter } from "./BaseRouter";
import { Response, Request } from "express";
import { Synagogue } from "../model/Synagogue";

export class SynagoguesRouter extends BaseRouter<Synagogue>{
    constructor() {
        super(new SynagoguesDB());
        this.router.post("/search", this.search);
    }

    private search = async (req: Request, res: Response) => {
        await this.TryRequest(res, (<SynagoguesDB>this.DB).search, req.body);
    };
}
