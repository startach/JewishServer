import * as bodyParser from 'body-parser';
import * as express from 'express';
import synagogueRouter from "./routes/synagogueRoute";
import generalRouter from "./routes/generalRoute";
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
app.use('/synagogue', synagogueRouter);
app.use('/general', generalRouter);


app.listen(port, () => {
  return console.log(`server is listening on ${ port }`)
});
