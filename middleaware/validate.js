const { check, body, query, validationResult} = require('express-validator/check');

module.exports = byIdValidation = [
    query("id")
    .exists()
    .not().isEmpty()
    .trim() , function(req, res, next) {
        const errors = validationResult(req);
        if(errors.isEmpty()) {
            return res.status(500).json({error: errors.array()});
        }
    }
];
