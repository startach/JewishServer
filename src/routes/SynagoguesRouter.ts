import { SynagoguesDB } from "../dal/SynagoguesDB";
import { CommentsDB } from "../dal/CommentsDB";
import { UsersDB } from "../dal/UsersDB";
import { BaseRouter } from "./BaseRouter";
import { Response, Request } from "express";
import { Synagogue } from "../model/Synagogue";
import { Location } from "../model/Location";
import { Minyan } from "../model/Minyan";
import { Comment } from "../model/Comment";
import * as passport from "passport";
const KosherZmanim = require('kosher-zmanim').default;
const tzlookup = require("tz-lookup");

export class SynagoguesRouter extends BaseRouter<Synagogue>{
    public SynagogueDB = (<SynagoguesDB>this.DB);
    public CommentsDB: CommentsDB;
    public UsersDB: UsersDB;
    constructor() {
        super(new SynagoguesDB());
        this.CommentsDB = new CommentsDB();
        this.UsersDB = new UsersDB();
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
        if(req.query.name == null){
            errors.push({message: "Missing name"})
        }
        if(req.query.address == null){
            errors.push({message: "Missing address"})
        }
        if(req.query.location == null){
            errors.push({message: "Missing location"})
        }
        if(req.query.notes != null && req.query.notes.length > 1000){
            errors.push({message: "Notes cannot exceed 1000 characters"})
        }
        
        let externals: object;
        let location: Location;
        let minyans: Minyan[];

        if(req.query.externals != null){
            try {
                externals = JSON.parse(req.query.externals) 
            } catch (e) {
                errors.push({message: "Externals must be JSON"})
            }
        }

        try {
            location = JSON.parse(req.query.location);
        } catch (e) {
            errors.push({message: "Location must be JSON"})
        }

        if(!req.query.shtiblach){
            if(req.query.minyans == null){
                errors.push({message: "Missing minyans"})
            }
            if(req.query.minyans != null){
                try {
                    minyans = JSON.parse(req.query.minyans);
                    minyans.forEach(async (minyan) => { await this.setMinyanTime(minyan, location); })
                } catch (e) {
                    errors.push({message: "Minyans must be JSON"});
                }
            }
        }

        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }

        let synagogue = {
            name: req.query.name,
            address: req.query.address,
            location: location,
            nosach: req.query.nosach,
            minyans: minyans,
            externals: externals,
            shtiblach: req.query.shtiblach,
            phone_number: req.query.phone_number,
            comments: req.query.comments,
            image: req.query.image,
            lessons: req.query.lessons,
            donation_link: req.query.donation_link,
            notes: req.query.notes,
        };
        // @ts-ignore
        let newSynagogue = await this.SynagogueDB.create(synagogue);
        res.status(200);
        res.send({id: newSynagogue.ops[0]._id, message: "Synagogue added successfully"});

    };

    private viewSynagogue = async (req: Request, res: Response) => {
        let synagogue;
        let comments: object;
        try {
            synagogue = await this.SynagogueDB.getById(req.query.id);
            comments = await this.CommentsDB.findByThreadId("synagogue_id", req.query.id);
            console.log(comments);
            synagogue.comments = comments
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
        if(req.query.id == null){
            errors.push({message: "Missing Id"})
        }
        if(req.query.name == null){
            errors.push({message: "Missing name"})
        }
        if(req.query.address == null){
            errors.push({message: "Missing address"})
        }
        if(req.query.location == null){
            errors.push({message: "Missing location"})
        }
        if(req.query.minyans == null){
            errors.push({message: "Missing minyans"})
        }
        if(req.query.notes != null && req.query.notes.length > 1000){
            errors.push({message: "Notes cannot exceed 1000 characters"})
        }
        
        let externals: object;
        let location: Location;
        let minyans: Minyan[];
        
        if(req.query.externals != null){
            try {
                externals = JSON.parse(req.query.externals) 
            } catch (e) {
                errors.push({message: "Externals must be JSON"})
            }
        }
        
        try {
            location = JSON.parse(req.query.location);
        } catch (e) {
            errors.push({message: "Location must be JSON"})
        }
        
        if(req.query.minyans != null){
            try {
                minyans = JSON.parse(req.query.minyans);
                minyans.forEach(async (minyan) => { await this.setMinyanTime(minyan, location); })
            } catch (e) {
                errors.push({message: "Minyans must be JSON"})
            }
        }

        minyans.forEach(async (minyan) => {
            if(minyan.timeType == 'relative'){
                await this.setMinyanTime(minyan, location);
            }
         })
        
        let newSynagogue = {
            name: req.query.name,
            address: req.query.address,
            location: location,
            nosach: req.query.nosach,
            minyans: minyans,
            externals: externals,
            phone_number: req.query.phone_number,
            comments: req.query.comments,
            image: req.query.image,
            lessons: req.query.lessons,
            donation_link: req.query.donation_link
        };

        let synagogue;
        try {
            synagogue = await this.SynagogueDB.updateById({id: req.query.id, updateParams: {$set: newSynagogue}});
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
        if(req.query.synagogue_id == null){
            errors.push({message: "Missing synagogue id"})
        }
        if(req.query.comment_body == null){
            errors.push({message: "Missing comment body"})
        }
        if(req.query.date == null){
            errors.push({message: "Missing Date"})
        }
        if(req.query.comment_body != null && req.query.comment_body.length > 1000){
            errors.push({message: "Cannot exceed 1000 characters"})
        }

        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }
        // @ts-ignore
        req.query.user_id = req.user.id;
        let comment;
        try {
            comment = await this.CommentsDB.create(req.query);   
        } catch (e) {
            res.status(400);
            res.send({message: "Bad request"})
        }

        res.status(200);
        res.send(comment.ops[0]);
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
        try {
            // @ts-ignore
            await this.SynagogueDB.like(req.query.synagogue_id, req.user.id);
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: "Liked successfully"});
    }

    private unlike = async (req: Request, res: Response) => {
        try {
            // @ts-ignore
            await this.SynagogueDB.unlike(req.query.synagogue_id, req.user.id);
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: "Unliked successfully"});
    }

    private favorite = async (req: Request, res: Response) => {
        try {
            // @ts-ignore
            await this.UsersDB.favorite(req.query.synagogue_id, req.user.id, 'synagogue');
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: "Favorited successfully"});
    }

    private unfavorite = async (req: Request, res: Response) => {
        try {
            // @ts-ignore
            await this.UsersDB.unfavorite(req.query.synagogue_id, req.user.id, 'synagogue');
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: "Unfavorited successfully"});
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

    private getMinyanTime = async (minyan: Minyan) => {
        // @ts-ignore
        minyan.time = new Date(minyan.time * 1000).toISOString().substr(11, 5);
    }
}
