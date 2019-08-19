import * as express from "express";
import { Response, Request } from "express";
import { MongoDB } from "../dal/MongoDB";

export class BaseRouter<T> {
    public router = express.Router();

    protected DB: MongoDB<T>;

    constructor(DB: MongoDB<T>) {
        this.DB = DB;
        this.intializeRoutes();
    }

    private intializeRoutes() {
        this.router.get("/:id", this.getById);
        this.router.post("/", this.create);
        this.router.put("/:id", this.update);
        this.router.delete("/:id", this.delete);
    }

    private getById = async (req: Request, res: Response) => {
        await this.TryRequest(res, this.DB.getById, req.params.id);
    };

    private create = async (req: Request, res: Response) => {
        await this.TryRequest(res, this.DB.create, req.body.synagogue);
    };

    private update = async (req: Request, res: Response) => {
        await this.TryRequest(res, this.DB.updateById, { id: req.params.id, updateParams: req.body.update });
    };

    private delete = async (req: Request, res: Response) => {
        await this.TryRequest(res, this.DB.deleteById, req.params.id);
    };

    protected TryRequest = async (res: Response, func: (props: any) => Promise<any>, props: any) => {
        try {
            const result = await func(props);
            return res.status(200).json({ data: result });
        } catch (e) {
            return res.status(500).json({ error: JSON.stringify(e) });
        }
    };
}
