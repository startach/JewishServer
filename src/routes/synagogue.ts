import * as express from "express";
import { SynagogueDB } from "../dal/synagogue";
const router = express.Router();
const synagoge = new SynagogueDB();

router.get("/:id", async (req, res) => {
    // Getting a synagogue by Mongodb id
    try {
        const result = await synagoge.getById(req.params.id);
        console.log(result);
        return res.status(200).json({ data: result });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }
});
// FIXME: search_validation
router.post("/search", /*search_validation,*/ async (req, res) => {
    // Getting synagogues by Synagogue fields in location by radius
    // {searchParams: params , location: {lat, lon, min_radius, max_radius}}
    try {
        const result = await synagoge.search(req.body);
        return res.status(200).json({ data: result });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post("/", async (req, res) => {
    // Creating new synagogue
    try {
        const result = await synagoge.createSynagogue(req.body.synagogue);
        return res.status(200).json({ id: result.insertedId });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.put("/:id", async (req, res) => {
    // Updating a synagogue
    // {update: {}}
    try {
        const result = await synagoge.updateSynagogueById(req.params.id, req.body.update);
        return res.status(200).json({ data: result });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.delete("/:id", async (req, res) => {
    // Deleting
    try {
        return await synagoge.deleteSynagoguebyId(req.params.id);
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
