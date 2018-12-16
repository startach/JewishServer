const { check, body, query, validationResult} = require('express-validator/check');

module.exports.id_validation = id_validation = [
    check("id")
    .exists()
    .not().isEmpty()
    .trim()
    .isAlphanumeric()
    .isMongoId() , function(req, res, next) {
        const errors = validationResult(req);
        if(errors.isEmpty()) {
            return res.status(500).json({error: errors.array()});
        }

        next();
    }
];

