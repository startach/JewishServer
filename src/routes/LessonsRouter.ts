import { BaseRouter } from "./BaseRouter";
import { CommentsDB } from "../dal/CommentsDB";
import { UsersDB } from "../dal/UsersDB";
import { Response, Request, response } from "express";
import { Lesson } from "../model/Lesson";
import { LessonsDB } from "../dal/LessonsDB";
import { Comment } from "../model/Comment";
import { Location } from "../model/Location";
import { SpeakerDB } from "../dal/SpeakerDB";
import * as passport from "passport";

export class LessonsRouter extends BaseRouter<Lesson>{
    public LessonDB = (<LessonsDB>this.DB);
    public CommentsDB: CommentsDB;
    public SpeakerDB: SpeakerDB;
    public UsersDB: UsersDB;
    constructor() {
        super(new LessonsDB());
        this.UsersDB = new UsersDB();
        this.CommentsDB = new CommentsDB();
        this.SpeakerDB = new SpeakerDB();
        this.router.post('/add',passport.authenticate('jwt', { session: false }), this.addLesson);
        this.router.get('/view', passport.authenticate('jwt', { session: false }), this.viewLesson);
        this.router.get('/speaker', passport.authenticate('jwt', { session: false }), this.getSpeakers);
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
private addLesson = async (req: Request, res: Response) => {
    let errors = [];
    if(req.query.speaker == null){
        errors.push({message: "Missing speaker"})
    }
    if(req.query.lessonSubject == null){
        errors.push({message: "Missing address"})
    }
    if(req.query.location == null){
        errors.push({message: "Missing location"})
    }
    if(req.query.days == null){
        errors.push({message: "Missing Times and Dates"})
    }

    let location: Location;
    let days;
    try {
        location = JSON.parse(req.query.location);
    } catch (e) {
        errors.push({message: "Location must be JSON"})
    }
    try {
        days = JSON.parse(req.query.days);
    } catch (e) {
        errors.push({message: "Days must be valid array"})
    }
    if(req.query.notes != null && req.query.notes.length > 100){
        errors.push({message: "Description cannot exceed 100 characters"})
    }
    if(errors.length > 0){
        res.status(400);
        return res.send(errors)
    }

    req.query.speaker = {
            name: req.query.speaker,
            avatar: req.query.avatar
    }
    let speaker = await this.SpeakerDB.create(req.query.speaker);
    let lesson = {
            speaker: speaker.ops[0]._id,
            lessonSubject: req.query.lessonSubject,
            location: location,
            description: req.query.description,
            synagogueId: req.query.synagogueId,
            audience: req.query.audience,
            days: days,
            notes: req.query.notes,
            comments: req.query.comments,
    }

    // @ts-ignore
    let newLesson = await this.LessonDB.create(lesson);
    res.status(200);
    res.send({id: newLesson.ops[0]._id, message: "Lesson added successfully"})
}


private viewLesson = async (req: Request, res: Response) => {
    let lesson;
    let speaker: object;
    let comments: object;
    try {
        lesson = await this.LessonDB.getById(req.query.id); 
        
        
        lesson["speaker"] = lesson["speaker"].toString(12);
        
        speaker = await this.SpeakerDB.getById(lesson["speaker"]);
        comments = await this.CommentsDB.findByThreadId("lesson_id",req.query.id);
            console.log(comments);
            lesson.comments = comments;
        lesson["speaker"] = {
            id: speaker["_id"],
            name:speaker["name"],
            avatar: speaker["avatar"]
        }
        

        if(lesson == null){
            res.status(400);
            res.send({message: "Lesson not found"})
        } 
    } catch (e) {
        res.status(400);
        res.send({message: "Bad request"})
    }
   
    res.status(200);
    res.send(lesson);
    

}
private updateLesson = async (req: Request, res: Response) => {
        let errors = [];
        if(req.query.speaker == null){
            errors.push({message: "Missing speaker"})
        }
        if(req.query.lessonSubject == null){
            errors.push({message: "Missing address"})
        }
        if(req.query.location == null){
            errors.push({message: "Missing location"})
        }
        if(req.query.days == null){
            errors.push({message: "Missing Times and Dates"})
        }

        let location: Location;
        let days;
        try {
            location = JSON.parse(req.query.location);
        } catch (e) {
            errors.push({message: "Location must be JSON"})
        }
        try {
            days = JSON.parse(req.query.days);
        } catch (e) {
            errors.push({message: "Days must be valid array"})
        }
        if(req.query.notes != null && req.query.notes.length > 100){
            errors.push({message: "Description cannot exceed 100 characters"})
        }
        if(errors.length > 0){
            res.status(400);
            return res.send(errors)
        }
        let newLesson = {
                speaker: req.query.speaker,
                lessonSubject: req.query.lessonSubject,
                location: location,
                description: req.query.description,
                synagogueId: req.query.synagogueId,
                days: days,
                notes: req.query.notes,
                comments: req.query.comments

        };
        await this.LessonDB.updateById({id: req.query.id, updateParams: {$set: newLesson}});
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
        if(req.query.lesson_id == null){
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
            console.log(e);
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
        res.send({message: 'deleted successfully'});
    }

    private like = async (req: Request, res: Response) => {
        try {
            // @ts-ignore
            await this.LessonDB.like(req.query.lesson_id, req.user.id);
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
            await this.LessonDB.unlike(req.query.lesson_id, req.user.id);
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
            await this.UsersDB.favorite(req.query.lesson_id, req.user.id, 'lesson');
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
            await this.UsersDB.unfavorite(req.query.lesson_id, req.user.id, 'lesson');
        } catch (e) {
            console.log(e)
            res.status(400);
            return res.send({message: "Bad request"})
        }

        res.status(200);
        res.send({message: "Unfavorited successfully"});
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
            res.status(400);
            res.send({message: "Bad request"})
        }
        
        res.status(200);
        res.send(speakers);
    }
        

    
};
