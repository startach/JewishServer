const { check, body, query, validationResult} = require('express-validator/check');

module.exports.id_validation = id_validation = [
    query("id")
    .exists()
    .not().isEmpty()
    .trim()
    .isAlphanumeric()
    .isMongoId() , function(req, res, next) {
        const errors = validationResult(req);
        if(errors) {
            return res.status(500).json({error: errors.array()});
        }

        next();
    }
];

module.exports.search_validation = search_validation = [
    
];

