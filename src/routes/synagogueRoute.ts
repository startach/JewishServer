import * as express from "express";
import { SynagogueDB } from "../dal/synagogueDB";
const router = express.Router();
const synagogeDB = new SynagogueDB();

router.get("/:id", async (req, res) => {
    try {
        const result = await synagogeDB.getById(req.params.id);
        console.log(result);
        return res.status(200).json({ data: result });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e });
    }
});
router.post("/search", async (req, res) => {
    try {
        const result = await synagogeDB.search(req.body);
        return res.status(200).json({ data: result });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post("/", async (req, res) => {
    try {
        const result = await synagogeDB.createSynagogue(req.body.synagogue);
        return res.status(200).json({ id: result.insertedId });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const result = await synagogeDB.updateSynagogueById(req.params.id, req.body.update);
        return res.status(200).json({ data: result });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const result = await synagogeDB.deleteSynagoguebyId(req.params.id);
        return res.status(200).json({ data: result });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
