import * as express from "express"
import { Response, Request } from "express";
import { SynagoguesDB } from "../dal/SynagoguesDB";
import { LessonsDB } from "../dal/LessonsDB";
import { UsersDB } from "../dal/UsersDB";
import { SpeakerDB } from "../dal/SpeakerDB";
import * as passport from "passport";
const tzlookup = require("tz-lookup");

export class SearchRouter {
    public router = express.Router();
    public SynagogueDB: SynagoguesDB;
    public LessonsDB: LessonsDB;
    public UsersDB: UsersDB;
    public SpeakerDB: SpeakerDB;

    constructor() {
        this.UsersDB = new UsersDB();
        this.SynagogueDB = new SynagoguesDB();
        this.LessonsDB = new LessonsDB();
        this.SpeakerDB = new SpeakerDB();
        this.router.get('/', passport.authenticate('jwt', { session: false }), this.viewSearch);
        this.router.delete('/delete', passport.authenticate('jwt', { session: false }), this.deleteSearch);
        this.router.post('/synagogues', passport.authenticate('jwt', { session: false }), this.searchSynagogues);
        this.router.get('/autocomplete/synagogues', passport.authenticate('jwt', { session: false }), this.synagoguesAutocomplete);
        this.router.post('/speakers', passport.authenticate('jwt', { session: false }), this.searchSpeakers);
        this.router.get('/autocomplete/speakers', passport.authenticate('jwt', { session: false }), this.speakersAutocomplete);
        this.router.get('/autocomplete/lessonLocation', passport.authenticate('jwt', { session: false }), this.lessonLocationAutocomplete);
        this.router.get('/autocomplete/synagogueLocation', passport.authenticate('jwt', { session: false }), this.synagogueLocationAutocomplete);
    }

    private viewSearch = async (req: Request, res: Response) => {
        // @ts-ignore
        let user = await this.UsersDB.getById(req.user.id);
        let searchHistory = user.searchHistory || [];
        res.status(200);
        res.send(searchHistory);
    };

    private deleteSearch = async (req: Request, res: Response) => {
        // @ts-ignore
        await this.UsersDB.updateById({id: req.user.id, updateParams: {$set: {"searchHistory": []}}});
        res.status(200);
        res.send({message: "Search history deleted successfully."});
    };

    private searchSynagogues = async (req: Request, res: Response) => {
        // @ts-ignore
        let user = await this.UsersDB.getById(req.user.id);
        let today = new Date().getDay();
        // using user loc for correct day
        if(user != undefined && user.location != null){
            try {
                let timezone = tzlookup(user.location.coordinates[1], user.location.coordinates[0])
                today = new Date(new Date().toLocaleString("en-US", {timeZone: timezone})).getDay();   
            } catch (e) {
                console.log(e)
            }
        }

        req.body.today = today;
        req.body.lon = JSON.parse(req.body.lon)
        req.body.lat = JSON.parse(req.body.lat)

        

        let result = await this.SynagogueDB.search(req.body);
        res.status(200);
        res.send(result);
        req.body.date = new Date();
        req.body.type = 'synagogue';
        delete(req.body.today);
        // @ts-ignore
        await this.UsersDB.updateById({id: req.user.id, updateParams: {$push: {"searchHistory": req.body}}});
    };

    private synagoguesAutocomplete = async (req: Request, res: Response) => {
        let synagogues = await this.SynagogueDB.autocomplete(req.query.name);
        console.log(synagogues)
        res.status(200);
        // @ts-ignore
        res.send(synagogues.map((s)=> { return {_id: s._id, name: s.name, address: s.address, location: s.location }}));
    }

    private searchSpeakers = async (req: Request, res: Response) => {
        let result;
                 
        if(req.body.name != null){
            result = await this.SpeakerDB.search(req.body.name);
        }
        else if(req.body.lon != null && req.body.lat != null){
            req.body.lon = JSON.parse(req.body.lon)
            req.body.lat = JSON.parse(req.body.lat)
            result = await this.LessonsDB.search(req.body);
        }
        res.status(200);
        res.send(result);
        req.body.date = new Date();
        req.body.type = 'lesson';
        // @ts-ignore
        await this.UsersDB.updateById({id: req.user.id, updateParams: {$push: {"searchHistory": req.body}}});
    };

    private speakersAutocomplete = async (req: Request, res: Response) => {
        let speakers = await this.SpeakerDB.autocomplete(req.query.name);
        console.log(speakers)
        res.status(200);
        res.send(speakers);
    };

    private lessonLocationAutocomplete = async (req: Request, res: Response) => {
        let lessons = await this.LessonsDB.autocomplete(req.query.address);
        console.log(lessons.length)
        res.status(200);
        res.send(lessons);
    };

    private synagogueLocationAutocomplete = async (req: Request, res: Response) => {
        let synagogues = await this.SynagogueDB.addressAutocomplete(req.query.address);
        res.status(200);
        res.send(synagogues);
    };
}
