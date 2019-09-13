import * as express from "express";
import { Response, Request } from "express";
import { BaseRouter } from "./BaseRouter";
import { AppData } from "../model/AppData";
import { AppDataDB } from "../dal/AppDataDB";
//import * as i18n from 'i18n';

export class SplashRouter extends BaseRouter<AppData> {
    public router = express.Router();
    public AppDataDB = (<AppDataDB>this.DB);
    constructor() {
        super(new AppDataDB());
        this.router.get("/memorialText", this.memorialText);
    }

    private memorialText = async (req: Request, res: Response) => {
        let i18n = req.app.get('i18n');
        let locale = req.query.lang || 'en';
        i18n.setLocale(locale);
        
        res.status(200);
        res.send({
            splash_screen: i18n.__('splash_screen'),
            all_over_the_app: i18n.__('all_over_the_app')
        });
    };
}
