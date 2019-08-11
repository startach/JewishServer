import * as express from "express";
import { SynagogueDB } from "../dal/synagogueDB";
const router = express.Router();
const synagogeDB = new SynagogueDB();

router.get("home/:cityName", async (req, res) => {
    try {
        const result = await synagogeDB.getLessonsAndSynagoguesByCity(req.params.cityName);
        console.log(result);
        return res.status(201).json({ data: result });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }
});

export default router;
