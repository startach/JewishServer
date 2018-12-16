var express             = require('express');
var morgan              = require('morgan');
var mongoose            = require('mongoose');
var synagogueRouter     = require('./routes/synagogue');

var app = express();

// Mount the logger
app.use(morgan('dev'));

// Automatically parses JSON bodies of requests
// We won't use bodyParser, Express4.X^
app.use(express.urlencoded());
app.use(express.json());


// Mount the routers
app.use('/synagogue' , synagogueRouter);

// Server init
app.listen(3000, function () {
    // Assuming a local mongodb instance with the db
    // jewishTest is a test db
    mongoose.connect('mongodb://localhost/jewishTest' , { useNewUrlParser: true })
        .then(() => console.log('mongodb: connection succesful'))
        .catch((err) => console.error(err));
    console.log('express: listening on 3000');
});

