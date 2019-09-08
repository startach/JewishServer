import * as express from "express";
import { Response, Request } from "express";
import { BaseRouter } from "./BaseRouter";
import { AppData } from "../model/AppData";
import { AppDataDB } from "../dal/AppDataDB";

export class SplashRouter extends BaseRouter<AppData> {
    public router = express.Router();
    public AppDataDB = (<AppDataDB>this.DB);
    constructor() {
        super(new AppDataDB());
        this.router.get("/memorialText", this.memorialText);
    }

    private memorialText = async (req: Request, res: Response) => {
        let result = await this.AppDataDB.findByTitle('memorial');
        let memorialText: any;
        if(result == null){
            memorialText = {
                splash_screen: "",
                all_over_the_app: "",
            }
        } else {
            memorialText = result;
        }
        
        res.status(200);
        res.send({splash_screen: memorialText.splash_screen, all_over_the_app: memorialText.all_over_the_app});
    };
}
