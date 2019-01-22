const mongoose  = require('mongoose');
const Synagogue = require('../models/synagogue');

function getSynagogueById(id) {
    // Get a synagogue by mongodb generated id
    return Synagogue.findById(id).exec();
};

function getSynagoguesByQuery(query) {
    // FIXME: HACK HACK HACK
    // Get a synagogue by query
    searchQuery = {};

    location = query;
    
    //searchParams = query.searchParams ? query.searchParams : null;

    //if(location && searchParams) return;

    //if(!searchParams){
        //searchQuery = searchParams;
    //}
    const coordinates = [parseFloat(location.lon), parseFloat(location.lat)];
    console.log(`Coordinates ${coordinates}`);
    const maxRadius = parseInt(location.max_radius)
    console.log(`maxRadius ${maxRadius}`);
    const minRadius = parseInt(location.min_radius)
    console.log(`minRadius ${minRadius}`);

    if(location) {
        searchQuery.location = {
            "$near" : {
                "$geometry" : {
                    "type" : "Point",
                    "coordinates" : coordinates
                },
                "$maxDistance" : maxRadius * 1000,
                "$minDistance" : minRadius * 1000
            }
        };
    }
    
    console.log(`searchQuery ${searchQuery}`);
    return Synagogue.find(searchQuery).exec();
};

function createSynagogue(synagogue) {
    return Synagogue.create(synagogue);
}

function updateSynagogueById(id, updateParams) {
    // Update a synagogue parameters by mongodb generated id
    return Synagogue.findOneAndUpdate({_id: id}, updateParams).exec();
};

function deleteSynagoguebyId(id) {
    return Synagogue.findByIdAndDelete(id).exec();
};

module.exports.getSynagogueById     = getSynagogueById;
module.exports.getSynagoguesByQuery = getSynagoguesByQuery;
module.exports.updateSynagogueById  = updateSynagogueById;
module.exports.deleteSynagoguebyId  = deleteSynagoguebyId;
module.exports.createSynagogue      = createSynagogue;
