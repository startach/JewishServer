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
app.listen(8080, function () {
    // Assuming a local mongodb instance with the db
    // jewishTest is a test db
    mongoose.connect('mongodb://startach:gG123456@ds235022.mlab.com:35022/jewish_world' , { useNewUrlParser: true })
        .then(() => console.log('mongodb: connection succesful'))
        .catch((err) => console.error(err));
    console.log('express: listening on 3000');
});

