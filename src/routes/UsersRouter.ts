import * as express from "express";
import { Response, Request } from "express";
import * as passport from "passport";
import { BaseRouter } from "./BaseRouter";
import { User } from "../model/User";
import { UsersDB } from "../dal/UsersDB";

export class UsersRouter extends BaseRouter<User> {
    public router = express.Router();
    public UserDB = (<UsersDB>this.DB);
    constructor() {
        super(new UsersDB());
        this.router.post("/updateCity", passport.authenticate('jwt', { session: false }), this.updateCity);
        
    }

    private updateCity = async (req: Request, res: Response) => {
        let errors = [];
        if(req.body.city == null){
            errors.push({message: "Missing city"});
        }
        
        if(req.body.coordinates == null){
            errors.push({message: "Missing coordinates"});
        }

        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }

        let location = {
            type: "Point",
            coordinates: req.body.coordinates
        };

        // @ts-ignore
        await this.UserDB.updateCity(req.id, { cityName: req.body.city, location: location });
        res.status(200);
        res.send({message: "City updated successfully"});
    }
}
