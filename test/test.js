var Synagogue = require("../models/synagogue");
var services = require("../services/synagogue");

var data = [
    {
        name: '1',
        address: 'b',
        location: {},
        nosach: 'c',
        phone_number: '21212',
        // externals: [{}],
        // minyans: [{}],
        // lessons: [{}],
        image: 'aaaaa',
        comments: 'wow'
    },
    {
        name: '2',
        address: 'b',
        location: {},
        nosach: 'c',
        phone_number: '21212',
        externals: {
            mikve: true,
            parking: true,
            disabled_access: true,
            shtiblach: true,
        },
        // minyans: [{}],
        // lessons: [{}],
        image: 'aaaaa',
        comments: 'wow'
    }
];

function seed() {
    data.forEach(function(seed) {
        const result = services.createSynagogue(seed);
        console.log(result);
    });
}

function clean() {
    Synagogue.deleteMany({} , function(err){
        if(err) {
            console.log("Error deleting false data")
        } else {
            console.log("DB Cleaned");
        }
    });
}

async function get() {
    try{
        const result = await services.getSynagogueById("5c02b0b661043943b060b58d");
        console.log("GET");
        console.log(result);
    } catch(e) {
        console.log(e);
    }
}

async function getAll(){
    try {
        const result = await Synagogue.find({} , function(err, synagogue){}).exec();
        console.log(result);
    } catch(e) {
        console.log(e);
    }
}


async function deleteById(){
    try {
        const result = await services.deleteSynagoguebyId("5c02b0b661043943b060b58d");
        console.log(result);
    } catch(e) {
        console.log(e);
    }
}

async function updateById() {
    try {
        const result = await services.updateSynagogueById("5c02b0b661043943b060b58d" , {name: "UPDATED"});
        console.log(result);
    }
    catch(e) {
        console.log(e);
    }
}

module.exports.seed = seed;
module.exports.clean = clean;
module.exports.get = get;
module.exports.getAll = getAll;
module.exports.deleteById = deleteById;
module.exports.updateById = updateById;