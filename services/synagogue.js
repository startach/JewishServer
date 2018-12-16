const mongoose  = require('mongoose');
const Synagogue = require('../models/synagogue');

function getSynagogueById(id) {
    // Get a synagogue by mongodb generated id
    return Synagogue.findById(id).exec();
};

function getSynagoguesByQuery(query) {
    // Get a synagogue by query
    return Synagogue.find(query).exec();
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
