import * as bodyParser from 'body-parser';
import * as express from 'express';
import { SynagoguesRouter } from "./routes/SynagoguesRouter";
import { LessonsRouter } from "./routes/LessonsRouter";
import { AuthRouter } from './routes/AuthRouter';
import { HomeRouter } from './routes/HomeRouter';
import { SplashRouter } from './routes/SplashRouter';
import { UsersRouter } from './routes/UsersRouter';
import { SearchRouter } from './routes/SearchRouter';
import * as passport from 'passport';
import "reflect-metadata";
import * as swagger from "swagger-express-ts";
import { updateMinyan } from './update_minyan';
import * as i18n from 'i18n';
import * as path from "path";

const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-id-token'); //GoogleTokenStrategy = require('passport-google-token').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();

const port = process.env.PORT || 80;

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

//config for internationalization
i18n.configure({
  locales:['en', 'iw'],
  directory: path.resolve(process.cwd(), 'src/locales')
});

app.set('i18n', i18n);

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
  //clientSecret: GOOGLE_CLIENT_SECRET
},
function(parsedToken, googleId, done) {
  done(null, parsedToken.payload);
}
));

app.use((err, req, res, next) => {
  //catch incorrect json err
  // @ts-ignore
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error(err);
      return res.sendStatus(400);
  }

  next();
});

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
app.use('/home', new HomeRouter().router);
app.use('/auth', new AuthRouter().router);
app.use('/synagogue', new SynagoguesRouter().router);
app.use('/lesson', new LessonsRouter().router);
app.use('/users', new UsersRouter().router);
app.use('/search', new SearchRouter().router);

setTimeout(() => { updateMinyan(); }, 3000)

app.listen(port, () => {
  return console.log(`server is listening on ${ port }`)
});
