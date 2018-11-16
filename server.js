var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


var app = express();

// Automatically parses JSON bodies of requests
app.use(bodyParser.json());

// Server init
app.listen(3000, function () {
    // Assuming a local mongodb instance with the db 
    mongoose.connect('mongodb://localhost/')
        .then(() => console.log('mongodb: connection succesful'))
        .catch((err) => console.error(err));
    console.log('express: listening on 3000');
});

