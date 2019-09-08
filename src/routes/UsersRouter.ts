import * as express from "express";
import { Response, Request } from "express";
import * as passport from "passport";
import { BaseRouter } from "./BaseRouter";
import { User } from "../model/User";
import { UsersDB } from "../dal/usersDB";

export class UsersRouter extends BaseRouter<User> {
    public router = express.Router();
    public UserDB = (<UsersDB>this.DB);
    constructor() {
        super(new UsersDB());
        this.router.post("/updateCity", passport.authenticate('jwt', { session: false }), this.updateCity);
        
    }

    private updateCity = async (req: Request, res: Response) => {
        let errors = [];
        if(req.query.city == null){
            errors.push({message: "Missing city"})
        }
        if(req.query.location == null){
            errors.push({message: "Missing location"});
        }
        let location = {
            type: null,
            coordinate: null
        };
        try {
            location = JSON.parse(req.query.location);
        } catch (e) {
            console.log(e)
            errors.push({message: "Location must be JSON"})
        }
        if(location.type == null){
            errors.push({message: "Missing location type"});
        }
        if(location.coordinate == null){
            errors.push({message: "Missing location coordinate"});
        }

        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }
        // @ts-ignore
        await this.UserDB.updateCity(req.id, { cityName: req.query.city, location: location });
        res.status(200);
        res.send({message: "City updated successfully"});
    }
}
