import * as express from "express"
import { Response, Request } from "express";
import { CommentsDB } from "../dal/CommentsDB";
import { UsersDB } from "../dal/UsersDB";
import { SpeakerDB } from "../dal/SpeakerDB";
import { LessonsDB } from "../dal/LessonsDB";
import * as passport from "passport";
const tzlookup = require("tz-lookup");

export class HomeRouter {
    public router = express.Router();
    public CommentsDB: CommentsDB;
    public LessonsDB: LessonsDB;
    public SpeakerDB: SpeakerDB;
    public UsersDB: UsersDB;
    constructor() {
        this.LessonsDB = new LessonsDB();
        this.UsersDB = new UsersDB();
        this.SpeakerDB = new SpeakerDB();
        this.router.post('/around_city',passport.authenticate('jwt', { session: false }), this.aroundLessons)
        this.router.get('/today_lessons',passport.authenticate('jwt', { session: false }), this.todayLessons);
        this.router.get('/popular_lessons',passport.authenticate('jwt', { session: false }), this.popularlessons);
        this.router.get('/recent',passport.authenticate('jwt', { session: false }), this.recentLessons);
    }

    private aroundLessons = async (req: Request, res: Response) => {
        let around_lessons;
        if(req.body.limit == null){
            req.body.limit = 5;
        }
        req.body.lon = JSON.parse(req.body.lon)
        req.body.lat = JSON.parse(req.body.lat)
        try {
             around_lessons = await this.LessonsDB.getLessonsByLocation(req.body);
             for (let i = 0; i < around_lessons.length; i++) {
                around_lessons[i].speaker = await this.SpeakerDB.getById(around_lessons[i].speakerId.toString(12));
            }
                        
        } catch (e) {
            console.log(e);
            res.status(400);
            res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send(around_lessons);
    }

    private todayLessons = async (req: Request, res: Response) => {
        // @ts-ignore
        let user = await this.UsersDB.getById(req.user.id);
        let today_lessons;
        let today = new Date().getDay();
        if(user != null && user.location != null){
            try {
                let timezone = tzlookup(user.location.coordinates[1], user.location.coordinates[0])
                today = new Date(new Date().toLocaleString("en-US", {timeZone: timezone})).getDay();   
            } catch (e) {
                console.log(e)
            }
        }
        req.query.today = today;
        if(req.query.limit == null){
            req.query.limit = 5;
        } else {
            req.query.limit = JSON.parse(req.query.limit)
        }
        try {
            today_lessons = await this.LessonsDB.getTodayLessons(req.query);
            for (let i = 0; i < today_lessons.length; i++) {
                today_lessons[i].speaker = await this.SpeakerDB.getById(today_lessons[i].speakerId.toString(12));
            }
        } catch (e) {
            console.log(e)
            res.status(400);
            res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send(today_lessons);
    }

    private popularlessons = async (req: Request, res: Response) => {
        let popular_lessons;
        if(req.query.limit == null){
            req.query.limit = 5;
        } else {
            req.query.limit = JSON.parse(req.query.limit)
        }
        try {
            popular_lessons = await this.LessonsDB.getPopularLessons(req.query);
            for (let i = 0; i < popular_lessons.length; i++) {
                popular_lessons[i].speaker = await this.SpeakerDB.getById(popular_lessons[i].speakerId.toString(12));
            }
        } catch (e) {
            res.status(400);
            res.send({message: "Bad request"});
        }
        
        res.status(200);
        res.send(popular_lessons);
    }
    

    private recentLessons = async (req: Request, res: Response) => {
        let recent_lessons;
        if(req.query.limit == null){
            req.query.limit = 5;
        } else {
            req.query.limit = JSON.parse(req.query.limit)
        }
        try {
            recent_lessons = await this.LessonsDB.getRecentLessons(req.query);
            for (let i = 0; i < recent_lessons.length; i++) {
                recent_lessons[i].speaker = await this.SpeakerDB.getById(recent_lessons[i].speakerId.toString(12));
            }
        } catch (e) {
            res.status(400);
            res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send(recent_lessons);
    }
}
