import * as express from "express"
import { Response, Request } from "express";
import { SynagoguesDB } from "../dal/SynagoguesDB";
import { LessonsDB } from "../dal/LessonsDB";
import { UsersDB } from "../dal/UsersDB";

export class SearchRouter {
    public router = express.Router();
    public SynagogueDB: SynagoguesDB;
    public LessonsDB: LessonsDB;
    public UsersDB: UsersDB;
    // public defaultFilters = {
    //     sortBy: 'nearby',
    //     timeRange: {
    //         min: '00:00',
    //         max: '23:59'
    //     },
    //     radius: 1, // km
    //     type: 'speaker'
    // }
    constructor() {
        this.UsersDB = new UsersDB();
        this.SynagogueDB = new SynagoguesDB();
        this.LessonsDB = new LessonsDB();
        this.router.get('/', this.viewSearch);
        this.router.post('/synagogues', this.searchSynagogues);
        this.router.get('/autocomplete/synagogues', this.synagoguesAutocomplete);
    }

    private viewSearch = async (req: Request, res: Response) => {
        // @ts-ignore
        let user = await this.UsersDB.getById(req.user.id);
        let searchHistory = user.searchHistory;
        res.status(200);
        res.send(searchHistory);
    };

    private searchSynagogues = async (req: Request, res: Response) => {
        req.query.lon = JSON.parse(req.query.lon)
        req.query.lat = JSON.parse(req.query.lat)

        let result = await this.SynagogueDB.search(req.query);
        res.status(200);
        res.send(result);
    };

    private synagoguesAutocomplete = async (req: Request, res: Response) => {
        let synagogues = await this.SynagogueDB.autocomplete(req.query.name);
        console.log(synagogues)
        res.status(200);
        res.send(synagogues);
    }
}
