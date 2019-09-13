import * as express from "express";
import { Response, Request } from "express";
import * as passport from "passport";
import * as jwt from 'jsonwebtoken';
import { BaseRouter } from "./BaseRouter";
import { User } from "../model/User";
import { UsersDB } from "../dal/usersDB";

export class AuthRouter extends BaseRouter<User> {
    public router = express.Router();
    public UserDB = (<UsersDB>this.DB);
    // just for test
    private JWT_SECRET = process.env.JWT_SECRET || "secret";
    constructor() {
        super(new UsersDB());
        this.router.post("/facebook/token", passport.authenticate('facebook-token', {session: false}), this.facebookTokenAuth);
        this.router.post("/google/token", passport.authenticate('google-token', {session: false}), this.googleTokenAuth);
    }

    private facebookTokenAuth = async (req, res) => {
        let user = {
            fb_id: req.user._json.id,
            first_name: req.user._json.first_name,
            last_name: req.user._json.last_name,
            email: req.user._json.email,
            avatar: req.user._json.picture.data.url
        };
        const result = await this.UserDB.findByEmail(user.email);
        
        if(result != null){
            const payload = {id: result._id, email: user.email};
            // @ts-ignore
            user._id = result._id;
            const token = jwt.sign(payload, this.JWT_SECRET);
            return res.send({token: token, user: user});    
        }
        // @ts-ignore
        const newUser = await this.UserDB.create(user);
        // @ts-ignore
        user._id = newUser.ops[0]._id;
        // @ts-ignore
        const payload = {id: user._id, email: user.email};
        const token = jwt.sign(JSON.stringify(payload), this.JWT_SECRET);
        res.send({token: token, user: user});
    }

    private googleTokenAuth = async (req, res) => {
        let user = {
            g_id: req.user._json.id,
            first_name: req.user._json.given_name,
            last_name: req.user._json.family_name,
            email: req.user._json.email,
            avatar: req.user._json.picture
        };
        const result = await this.UserDB.findByEmail(user.email);
        
        if(result != null){
            const payload = {id: result._id, email: user.email};
            // @ts-ignore
            user._id = result._id;
            const token = jwt.sign(payload, this.JWT_SECRET);
            return res.send({token: token, user: user});    
        }
        
        // @ts-ignore
        const newUser = await this.UserDB.create(user);
        // @ts-ignore
        user._id = newUser.ops[0]._id;
        // @ts-ignore
        const payload = {id: user._id, email: user.email};
        const token = jwt.sign(JSON.stringify(payload), this.JWT_SECRET);
        res.send({token: token, user: user});
    }
}
