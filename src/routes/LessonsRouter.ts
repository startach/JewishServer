import { BaseRouter } from "./BaseRouter";
import { Response, Request } from "express";
import { Lesson } from "../model/Lesson";
import { LessonsDB } from "../dal/LessonsDB";

export class LessonsRouter extends BaseRouter<Lesson>{
    constructor() {
        super(new LessonsDB());
        this.router.post("/:cityName", this.getLessonsByCity);
    }

    private getLessonsByCity = async (req: Request, res: Response) => {
        await this.TryRequest(res, (<LessonsDB>this.DB).getLessonsByCity, req.params.cityName);
    };
}
