import * as bodyParser from 'body-parser';
import * as express from 'express';
import { SynagoguesRouter } from "./routes/SynagoguesRouter";
import { LessonsRouter } from "./routes/LessonsRouter";
import "reflect-metadata";
import * as swagger from "swagger-express-ts";

const port = process.env.PORT || 80

const app = express();

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/synagogue', new SynagoguesRouter().router);
app.use('/lesson', new LessonsRouter().router);


app.listen(port, () => {
  return console.log(`server is listening on ${ port }`)
});
