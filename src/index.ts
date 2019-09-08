import * as bodyParser from 'body-parser';
import * as express from 'express';
import { SynagoguesRouter } from "./routes/SynagoguesRouter";
import { LessonsRouter } from "./routes/LessonsRouter";
import { AuthRouter } from './routes/AuthRouter';
import { SplashRouter } from './routes/SplashRouter';
import { UsersRouter } from './routes/UsersRouter';
import * as passport from 'passport';
import "reflect-metadata";
import * as swagger from "swagger-express-ts";

const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const port = process.env.PORT || 80
// for dev testing
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '2935448396471284';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || 'f1d0564d7e08123bcb5059a4902796d9';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '619926981615-lt15dp89dd2k94gfhp9sn3uh99v04e1n.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env || 'HMUxEImtSSuD-nTxBvGCZV8U';
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const app = express();

app.use(passport.initialize());

//swagger
app.use('/api-docs/swagger', express.static('swagger'));
app.use('/api-docs/swagger/assets', express.static('node_modules/swagger-ui-dist'));

app.use(bodyParser.json());
app.use(swagger.express(
  {
    definition: {
      info: {
        title: "synagogue rest api",
        version: "1.0"
      },
      externalDocs: {
        url: "synagogue/"
      }
      // Models can be defined here
    }
  }
));

passport.use(new FacebookTokenStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    profileFields: ['id', 'email', 'name', 'gender', 'picture.type(large)']
  },
  function(accessToken, refreshToken, user, done) {
    done(null, user);
  }
));

passport.use(new GoogleTokenStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET
},
function(accessToken, refreshToken, profile, done) {
  done(null,profile);
}
));

app.use(function(err, req, res, next) {
  if(err){
    console.log(err)
  }  
})
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey   : JWT_SECRET,
  passReqToCallback: true
},
function (req, jwtPayload, done) {
  req.id = jwtPayload.id;
  req.userEmail = jwtPayload.email;
  done(null, jwtPayload);
}
));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', new SplashRouter().router);
app.use('/auth', new AuthRouter().router);
app.use('/synagogue', new SynagoguesRouter().router);
app.use('/lesson', new LessonsRouter().router);
app.use('/users', new UsersRouter().router);


app.listen(port, () => {
  return console.log(`server is listening on ${ port }`)
});
