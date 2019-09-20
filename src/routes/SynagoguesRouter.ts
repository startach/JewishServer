import { SynagoguesDB } from "../dal/SynagoguesDB";
import { CommentsDB } from "../dal/CommentsDB";
import { LessonsDB } from "../dal/LessonsDB";
import { UsersDB } from "../dal/UsersDB";
import { BaseRouter } from "./BaseRouter";
import { Response, Request } from "express";
import { Synagogue } from "../model/Synagogue";
import { Location } from "../model/Location";
import { Minyan } from "../model/Minyan";
import * as passport from "passport";
const KosherZmanim = require('kosher-zmanim').default;
const tzlookup = require("tz-lookup");

export class SynagoguesRouter extends BaseRouter<Synagogue>{
    public SynagogueDB = (<SynagoguesDB>this.DB);
    public CommentsDB: CommentsDB;
    public UsersDB: UsersDB;
    public LessonsDB: LessonsDB;
    constructor() {
        super(new SynagoguesDB());
        this.CommentsDB = new CommentsDB();
        this.UsersDB = new UsersDB();
        this.LessonsDB = new LessonsDB();
        this.router.get('/nosach', this.viewNosach);
        this.router.post('/add', passport.authenticate('jwt', { session: false }), this.addSynagogue);
        this.router.get('/view', passport.authenticate('jwt', { session: false }), this.viewSynagogue);
        this.router.put('/update', passport.authenticate('jwt', { session: false }), this.updateSynagogue);
        //this.router.delete('/delete', passport.authenticate('jwt', { session: false }), this.deleteSynagogue);
        this.router.post('/comment', passport.authenticate('jwt', { session: false }), this.comment);
        this.router.delete('/deleteComment', passport.authenticate('jwt', { session: false }), this.deleteComment);
        this.router.post('/like', passport.authenticate('jwt', { session: false }), this.like);
        this.router.post('/unlike', passport.authenticate('jwt', { session: false }), this.unlike);
        this.router.post('/favorite', passport.authenticate('jwt', { session: false }), this.favorite);
        this.router.post('/unfavorite', passport.authenticate('jwt', { session: false }), this.unfavorite);
    }

    private viewNosach = async (req: Request, res: Response) => {
        let i18n = req.app.get('i18n');
        let locale = req.query.lang || 'en';
        i18n.setLocale(locale);
        
        const NOSACH = [
            { "ashkenazi": i18n.__('ashkenazi') },
            { "sefard": i18n.__('sefard') },
            { "edot_hamizrah": i18n.__('edot_hamizrah') },
            { "ar\"i": i18n.__('ar\"i') },
            { "chabad": i18n.__('chabad') },
            { "temani": i18n.__('temani') }
        ];

        res.status(200);
        res.send({nosach: NOSACH});
    }

    private addSynagogue = async (req: Request, res: Response) => {
        let errors = [];
        if(req.body.name == null){
            errors.push({message: "Missing name"})
        }
        if(req.body.address == null){
            errors.push({message: "Missing address"})
        }
        if(req.body.location == null){
            errors.push({message: "Missing location"})
        }
        if(req.body.notes != null && req.body.notes.length > 1000){
            errors.push({message: "Notes cannot exceed 1000 characters"})
        }

        if(!req.body.shtiblach){
            if(req.body.minyans == null){
                errors.push({message: "Missing minyans"})
            }
            if(req.body.minyans != null){
                req.body.minyans.forEach(async (minyan) => { await this.setMinyanTime(minyan, req.body.location); })
            }
        }

        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }

        let synagogue = {
            name: req.body.name,
            address: req.body.address,
            location: req.body.location,
            nosach: req.body.nosach,
            minyans: req.body.minyans,
            externals: req.body.externals,
            shtiblach: req.body.shtiblach,
            phone_number: req.body.phone_number,
            comments: req.body.comments,
            image: req.body.image,
            lessons: req.body.lessons,
            donation_link: req.body.donation_link,
            notes: req.body.notes,
        };
        // @ts-ignore
        let newSynagogue = await this.SynagogueDB.create(synagogue);
        res.status(200);
        res.send({id: newSynagogue.ops[0]._id, message: "Synagogue added successfully"});

    };

    private viewSynagogue = async (req: Request, res: Response) => {
        let synagogue;
        let comments: object;
        let lessons: object;
        try {
            synagogue = await this.SynagogueDB.getById(req.query.id);
            comments = await this.CommentsDB.findByThreadId("synagogue_id", req.query.id);
            lessons = await this.LessonsDB.getById(req.query.id);
            console.log(comments);
            synagogue.comments = comments;
            synagogue.lessons = lessons;
            if(synagogue == null){
                res.status(400);
                res.send({message: "Synagogue not found"})
            }
            synagogue.minyans.forEach(async (minyan) => { 
                if(minyan.timeType == 'relative'){
                    await this.setMinyanTime(minyan, synagogue.location);
                }
             })
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send(synagogue);
    }

    private updateSynagogue = async (req: Request, res: Response) => {
        let errors = [];
        if(req.body.id == null){
            errors.push({message: "Missing Id"})
        }
        if(req.body.name == null){
            errors.push({message: "Missing name"})
        }
        if(req.body.address == null){
            errors.push({message: "Missing address"})
        }
        if(req.body.location == null){
            errors.push({message: "Missing location"})
        }
        if(req.body.minyans == null){
            errors.push({message: "Missing minyans"})
        }
        if(req.body.notes != null && req.body.notes.length > 1000){
            errors.push({message: "Notes cannot exceed 1000 characters"})
        }
        
        
        if(!req.body.shtiblach){
            if(req.body.minyans == null){
                errors.push({message: "Missing minyans"})
            }
            if(req.body.minyans != null){
                req.body.minyans.forEach(async (minyan) => { await this.setMinyanTime(minyan, req.body.location); })
            }
        }
        
        let newSynagogue = {
            name: req.body.name,
            address: req.body.address,
            location: req.body.location,
            nosach: req.body.nosach,
            minyans: req.body.minyans,
            externals: req.body.externals,
            phone_number: req.body.phone_number,
            comments: req.body.comments,
            image: req.body.image,
            lessons: req.body.lessons,
            donation_link: req.body.donation_link
        };

        let synagogue;
        try {
            synagogue = await this.SynagogueDB.updateById({id: req.body.id, updateParams: {$set: newSynagogue}});
        } catch (e) {
            console.log(e)
            errors.push({message: 'Bad request'})
        }

        if(synagogue != null && synagogue.matchedCount == 0){
            errors.push({message: "Synagogue not found"})
        }
        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }
        res.status(200);
        res.send({message: "Synagogue updated successfully"})

    };

    private deleteSynagogue = async (req: Request, res: Response) => {
        try {
            await this.SynagogueDB.deleteById(req.query.id);
        } catch (e) {
            res.status(400);
            res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send({message: "Synagogue deleted successfully"});
    }

    private comment = async (req: Request, res: Response) => {
        let errors = [];
        if(req.body.synagogue_id == null){
            errors.push({message: "Missing synagogue id"})
        }
        if(req.body.comment_body == null){
            errors.push({message: "Missing comment body"})
        }
        if(req.body.date == null){
            errors.push({message: "Missing Date"})
        }
        if(req.body.comment_body != null && req.body.comment_body.length > 1000){
            errors.push({message: "Cannot exceed 1000 characters"})
        }

        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }
        // @ts-ignore
        req.body.user_id = req.user.id;
        let comment;
        let comments;
        let user;
        try {
            user = await this.UsersDB.getById(req.body.user_id);
            req.body.first_name = user.first_name;
            req.body.last_name = user.last_name;
            req.body.avatar = user.avatar;
            comment = await this.CommentsDB.create(req.body);
            comments = await this.CommentsDB.findByThreadId("synagogue_id", req.body.synagogue_id); 
        } catch (e) {
            res.status(400);
            res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({comments: comments});
    }

    private deleteComment = async (req: Request, res: Response) => {
        let errors = [];
        let comment = await this.CommentsDB.getById(req.query.id);
        // @ts-ignore
        if(comment.user_id != req.user.id){
            errors.push({message: "Comment cannot be deleted."})
        }

        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }

        try {
            await this.CommentsDB.deleteById(req.query.id);
        } catch (e) {
            res.status(400);
            return res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send({message: "Comment deleted successfully"});
    }

    private like = async (req: Request, res: Response) => {
        let message: string;
        try {
            // @ts-ignore
            let q = await this.SynagogueDB.like(req.body.synagogue_id, req.user.id);
            if(q.result.nModified == 1){
                message = "Liked successfully";
            } else {
                message = "Already liked by this user.";
            }
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: message});
    }

    private unlike = async (req: Request, res: Response) => {
        let message: string;
        try {
            // @ts-ignore
            let q = await this.SynagogueDB.unlike(req.body.synagogue_id, req.user.id);
            if(q.result.nModified == 1){
                message = "Unliked successfully";
            } else {
                message = "Not liked by this user.";
            }
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: message});
    }

    private favorite = async (req: Request, res: Response) => {
        let message: string;
        try {
            // @ts-ignore
            let q = await this.UsersDB.favorite(req.body.synagogue_id, req.user.id, 'synagogue');
            if(q.result.nModified == 1){
                message = "Favorited successfully";
            } else {
                message = "Already favorited by this user.";
            }
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: message});
    }

    private unfavorite = async (req: Request, res: Response) => {
        let message: string;
        try {
            // @ts-ignore
            let q = await this.UsersDB.unfavorite(req.body.synagogue_id, req.user.id, 'synagogue');
            if(q.result.nModified == 1){
                message = "Unfavorited successfully";
            } else {
                message = "Not favorited by this user.";
            }
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: message});
    }

    private setMinyanTime = async (minyan: Minyan, location: Location) => {
        if(minyan.timeType == 'exact'){
            // @ts-ignore
            minyan.timeString = minyan.time;
            // @ts-ignore
            let t = minyan.time.split(':');
            minyan.time = (+t[0]) * 60 * 60 + (+t[1]) * 60;
        } else if(minyan.timeType == 'relative'){
            let timezone = tzlookup(location.coordinates[1], location.coordinates[0])
            const options = {
                date: new Date(),
                timeZoneId: timezone,
                locationName: timezone, //for simplicity, location is timezone
                latitude: location.coordinates[1],
                longitude: location.coordinates[0]
            }
            const kosherZmanim = new KosherZmanim(options);
            const zmanim = kosherZmanim.getZmanimJson();
            if (minyan.sun_position == 'sunrise') {
                let sunriseMinyanTime = new Date(new Date(zmanim.BasicZmanim.Sunrise).getTime() + minyan.offset * 60000);
                let hours = new Date(sunriseMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getHours();
                let minutes = new Date(sunriseMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getMinutes();
                minyan.time = hours * 60 * 60 + minutes * 60;
                minyan.timeString = new Date(minyan.time * 1000).toISOString().substr(11, 5);
                minyan.lastVerified = new Date();
            } else if(minyan.sun_position == 'sunset'){
                let sunsetMinyanTime = new Date(new Date(zmanim.BasicZmanim.Sunset).getTime() + minyan.offset * 60000);
                let hours = new Date(sunsetMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getHours();
                let minutes = new Date(sunsetMinyanTime.toLocaleString("en-US", {timeZone: timezone})).getMinutes();
                minyan.time = hours * 60 * 60 + minutes * 60;
                minyan.timeString = new Date(minyan.time * 1000).toISOString().substr(11, 5);
                minyan.lastVerified = new Date();
            }
        }
    }

}
