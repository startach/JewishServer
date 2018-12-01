var express     = require("express");
var router      = express.Router();

var services    = require("../services/synagogue");

router.get("/:id" , async function(req, res){
    // Getting a synagogue by Mongodb id
    try {
        const result = await services.getSynagogueById(req.query.id);
        return res.status(200).json(result);
    } catch(e) {
        return res.status(500).json(e);
    }
});

router.get("/location" , function(req, res){
    // Getting synagogues in a specific location
    // Can and will be used with Radius or other params 
});

router.post("/" , async function(req, res){
    // Creating new synagogue
    try {
        const result = await services.createSynagogue(req.body.synagogue);
        return res.status(200).json({id: result._id});
    } catch(e) {
        return res.status(500).json(e);
    }
});

router.put("/:id" , async function(req, res){
    // Updating a synagogue
    //{id: ID, update: {PARAMS}}
    try {
        const result = await services.updateSynagogueById(req.body.id, req.body.update);
        return res.status(200).json(result);
    } catch(e) {
        return res.status(500).json(e);
    }
});

router.delete("/:id" , async function(req, res){
    // Deleting
    try {
        return await services.deleteSynagoguebyId(req.query.id);
    } catch(e) {
        return res.status(500).json(e);
    }
});

router.use(function(err, req, res, next){
    // Express error handler

});

module.exports = router;