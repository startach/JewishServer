const { body, param, query, validationResult} = require('express-validator/check');

module.exports.id_validation = id_validation = [
    param("id")
    .exists().withMessage("exists")
    .not().isEmpty()
    .trim()
    .isAlphanumeric()
    .isMongoId() , function(req, res, next) {
        const errors = validationResult(req);
        if(errors.array().isEmpty) {
            return res.status(500).json({error: errors.array()});
        }

        next();
    }
];

module.exports.search_validation = search_validation = [
    body("location")
    .exists()
    .not().isEmpty() , function(req, res, next){
        const errors = validationResult(req);
        if(errors.array().isEmpty){
            return res.status(500).json({error: errors.array()});
        }

        next();
    }
];

