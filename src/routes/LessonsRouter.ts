import { BaseRouter } from "./BaseRouter";
import { CommentsDB } from "../dal/CommentsDB";
import { UsersDB } from "../dal/UsersDB";
import { Response, Request, response } from "express";
import { Lesson } from "../model/Lesson";
import { LessonsDB } from "../dal/LessonsDB";
import { SynagoguesDB } from "../dal/SynagoguesDB";
import { Comment } from "../model/Comment";
import { Location } from "../model/Location";
import { SpeakerDB } from "../dal/SpeakerDB";
import * as passport from "passport";
import { ObjectID } from "bson";

export class LessonsRouter extends BaseRouter<Lesson>{
    public LessonDB = (<LessonsDB>this.DB);
    public CommentsDB: CommentsDB;
    public SpeakerDB: SpeakerDB;
    public UsersDB: UsersDB;
    public SynagoguesDB: SynagoguesDB;
    constructor() {
        super(new LessonsDB());
        this.UsersDB = new UsersDB();
        this.CommentsDB = new CommentsDB();
        this.SpeakerDB = new SpeakerDB();
        this.SynagoguesDB = new SynagoguesDB();
        this.router.get('/audience',passport.authenticate('jwt', { session: false }), this.getAudience);
        this.router.post('/add',passport.authenticate('jwt', { session: false }), this.addLesson);
        this.router.post('/addSpeaker',passport.authenticate('jwt', { session: false }), this.addSpeaker);
        this.router.get('/view', passport.authenticate('jwt', { session: false }), this.viewLesson);
        this.router.get('/speakers', passport.authenticate('jwt', { session: false }), this.getSpeakers);
        this.router.put('/update', passport.authenticate('jwt', { session: false }), this.updateLesson);
        this.router.delete('/delete', passport.authenticate('jwt', { session: false }), this.deleteLesson);
        this.router.get('/viewSpeaker',passport.authenticate('jwt', { session: false }), this.viewSpeaker);
        this.router.post('/comment', passport.authenticate('jwt', { session: false }), this.comment);
        this.router.delete('/deleteComment', passport.authenticate('jwt', { session: false }), this.deleteComment);
        this.router.post('/like',passport.authenticate('jwt', { session: false }),this.like);
        this.router.post('/unlike', passport.authenticate('jwt', { session: false }), this.unlike);
        this.router.post('/favorite', passport.authenticate('jwt', { session: false }), this.favorite);
        this.router.post('/unfavorite', passport.authenticate('jwt', { session: false }), this.unfavorite);
        //this.router.post('/search', passport.authenticate('jwt', { session: false }), this.search);
}

private getAudience = async (req: Request, res: Response) => {
    let i18n = req.app.get('i18n');
    let locale = req.query.lang || 'en';
    i18n.setLocale(locale);
    
    res.status(200);
    res.send({
        men: i18n.__('men'),
        women: i18n.__('women'),
        men_women: i18n.__('men_women')
    });
}

private addLesson = async (req: Request, res: Response) => {
    let errors = [];
    
    if(req.body.speakerId == null || ObjectID.isValid(req.body.speakerId) == false){
        errors.push({message: "Missing or incorrect speaker Id"})
    }
    if(req.body.lessonSubject == null){
        errors.push({message: "Missing address"})
    }
    if(req.body.location == null){
        errors.push({message: "Missing location"})
    }

    if(req.body.date == null){
        if(req.body.days == null){
            errors.push({message: "Missing Times and Dates"})
        }
    }

    if(req.body.notes != null && req.body.notes.length > 100){
        errors.push({message: "Description cannot exceed 100 characters"})
    }
    if(errors.length > 0){
        res.status(400);
        return res.send(errors)
    }

    let time;
    let timeString;
    let days = [];
    if(req.body.time){
        let t = req.body.time.split(':');
        time = (+t[0]) * 60 * 60 + (+t[1]) * 60;
    } else if(req.body.date){
        let d = req.body.date.replace('Z','');
        time = (+new Date(d).getHours()) * 60 * 60 + (+new Date(d).getMinutes()) * 60;
    }
    if(req.body.date != null && req.body.days == null){
        days.push(new Date(req.body.date.replace('Z','')).getDay());
    } else {
        days = req.body.days;
    }

    timeString = new Date(time * 1000).toISOString().substr(11, 5);

    req.body.speaker = {
            name: req.body.speaker,
            avatar: req.body.avatar
    }
    
    let lesson = {
            speakerId: req.body.speakerId,
            lessonSubject: req.body.lessonSubject,
            address: req.body.address,
            location: req.body.location,
            description: req.body.description,
            synagogueId: req.body.synagogueId,
            audience: req.body.audience,
            date: req.body.date,
            time: time,
            timeString: timeString,
            days: days,
            notes: req.body.notes,
            contact_name: req.body.contact_name,
            contact_number: req.body.contact_number
    }

    // @ts-ignore
    let newLesson = await this.LessonDB.create(lesson);
    res.status(200);
    res.send({id: newLesson.ops[0]._id, message: "Lesson added successfully"})
}

private addSpeaker = async (req: Request, res: Response) => {
    let errors = [];
    
    if(req.body.name == null){
        errors.push({message: "Missing name"})
    }

    if(errors.length > 0){
        res.status(400);
        return res.send(errors)
    }


    req.body.speaker = {
            name: req.body.speaker,
            avatar: req.body.avatar
    }
    
    let speaker = {
            name: req.body.name,
            avatar: req.body.avatar,
            about: req.body.about
    }

    // @ts-ignore
    let newSpeaker = await this.SpeakerDB.create(speaker);
    res.status(200);
    res.send({id: newSpeaker.ops[0]._id, message: "Speaker added successfully"})
}


private viewLesson = async (req: Request, res: Response) => {
    let lesson;
    let speaker: object;
    let comments: object;
    try {
        lesson = await this.LessonDB.getById(req.query.id);
        if(lesson.synagogueId != null){
            let synagogue = await this.SynagoguesDB.getById(lesson.synagogueId.toString(12));
            lesson.synagogueName = synagogue.name;
        }
        let speakerId = lesson["speakerId"].toString(12);
        speaker = await this.SpeakerDB.getById(speakerId);
        comments = await this.CommentsDB.findByThreadId("lesson_id",req.query.id);
            lesson.comments = comments;
            lesson["speaker"] = {
            name:speaker["name"],
            avatar: speaker["avatar"],
            about: speaker["about"]
        }
        lesson.time = lesson.timeString;

        if(lesson == null){
            res.status(400);
            return res.send({message: "Lesson not found"})
        } 

    } catch (e) {
        console.log(e)
        res.status(400);
        return res.send({message: "Bad request"})
    }
   
    res.status(200);
    res.send(lesson);
    

}
private updateLesson = async (req: Request, res: Response) => {
        let errors = [];
        if(req.body.speakerId == null || ObjectID.isValid(req.body.speakerId) == false){
            errors.push({message: "Missing or incorrect speaker Id"})
        }
        if(req.body.lessonSubject == null){
            errors.push({message: "Missing address"})
        }
        if(req.body.location == null){
            errors.push({message: "Missing location"})
        }
        if(req.body.date == null){
            if(req.body.days == null){
                errors.push({message: "Missing Times and Dates"})
            }
        }

        if(req.body.notes != null && req.body.notes.length > 100){
            errors.push({message: "Description cannot exceed 100 characters"})
        }
        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }

        let time;
        let timeString;
        let days = [];
        if(req.body.time){
            let t = req.body.time.split(':');
            time = (+t[0]) * 60 * 60 + (+t[1]) * 60;
        } else if(req.body.date){
            let d = req.body.date.replace('Z','');
            time = (+new Date(d).getHours()) * 60 * 60 + (+new Date(d).getMinutes()) * 60;
        }
        if(req.body.date != null && req.body.days == null){
            days.push(new Date(req.body.date.replace('Z','')).getDay());
        } else {
            days = req.body.days;
        }
        timeString = new Date(time * 1000).toISOString().substr(11, 5);

        let newLesson = {
            speakerId: req.body.speakerId,
            lessonSubject: req.body.lessonSubject,
            address: req.body.address,
            location: req.body.location,
            description: req.body.description,
            synagogueId: req.body.synagogueId,
            audience: req.body.audience,
            date: req.body.date,
            time: time,
            timeString: timeString,
            days: days,
            notes: req.body.notes,
            contact_name: req.body.contact_name,
            contact_number: req.body.contact_number,
            isEvent: req.body.isEvent
        };
        await this.LessonDB.updateById({id: req.body.id, updateParams: {$set: newLesson}});
        res.status(200);
        res.send({message: "Lesson updated successfully"})
    };


    private deleteLesson = async (req: Request, res: Response) => {
        try {
            await this.LessonDB.deleteById(req.query.id);
        } catch (e) {
            res.status(400);
            res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: "Lesson deleted successfully"});
    }

    private comment = async (req: Request, res: Response) => {
        let errors = [];
        if(req.body.lesson_id == null){
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
            comments = await this.CommentsDB.findByThreadId("lesson_id", req.body.lesson_id); 
        } catch (e) {
            res.status(400);
            res.send({message: "Bad request"});
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
        res.send({message: 'deleted successfully'});
    }

    private like = async (req: Request, res: Response) => {
        let message: string;
        try {
            // @ts-ignore
            let q = await this.LessonDB.like(req.body.lesson_id, req.user.id);
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
            let q = await this.LessonDB.unlike(req.body.lesson_id, req.user.id);
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
            let q = await this.UsersDB.favorite(req.body.lesson_id, req.user.id, 'lesson');
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
            let q = await this.UsersDB.unfavorite(req.body.lesson_id, req.user.id, 'lesson');
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

    private viewSpeaker = async (req: Request, res: Response) => {
        let speaker: object;      
        try {
             speaker = await this.SpeakerDB.getById(req.query.id);
        }catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send(speaker);
    }

    private getSpeakers = async (req: Request, res: Response) => {
        let speakers;
        try {
            speakers = await this.SpeakerDB.getAll();
        } catch (e) {
            console.log(e)
            res.status(400);
            res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send(speakers);
    }
        

    
};
