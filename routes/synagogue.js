var express         = require("express");
var router          = express.Router();
var services        = require("../services/synagogue");
var id_validation   = require("../middleaware/validate").id_validation;

router.get("/:id", id_validation, async function(req, res){
    // Getting a synagogue by Mongodb id
    try {
        const result = await services.getSynagogueById(req.query.id);
        return res.status(200).json({data: result});
    } catch(e) {
        return res.status(500).json({error: e});
    }
});

router.get("/search" , async function(req, res){
    // Getting synagogues by filters
    try {
        const result = await services.getSynagoguesByQuery(req.body.filter);
        return res.status(200).json({result: result});
    } catch(e) {
        return res.status(500).json({error: e});
    }
});

router.post("/" , async function(req, res){
    // Creating new synagogue
    try {
        const result = await services.createSynagogue(req.body.synagogue);
        return res.status(200).json({id: result._id});
    } catch(e) {
        return res.status(500).json({error :e});
    }
});

router.put("/:id" , id_validation, async function(req, res){
    // Updating a synagogue
    //{id: ID, update: {PARAMS}}
    try {
        const result = await services.updateSynagogueById(req.body.id, req.body.update);
        return res.status(200).json(result);
    } catch(e) {
        return res.status(500).json({error :e});
    }
});

router.delete("/:id" , id_validation, async function(req, res){
    // Deleting
    try {
        return await services.deleteSynagoguebyId(req.query.id);
    } catch(e) {
        return res.status(500).json({error :e});
    }
});

router.use(function(err, req, res, next){
    // Express error handler

});

module.exports = router;