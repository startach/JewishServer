import * as bodyParser from 'body-parser';
import * as express from 'express';
import router from "./routes/synagogueRoute";
import { serve, setup } from 'swagger-ui-express';
import swaggerDocument from './swagger'

const port = process.env.PORT || 3000

const app = express();

//swagger
app.use('/swagger', serve, setup(swaggerDocument));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/synagogue', router);


app.listen(port, (err: any) => {
  if (err) {
    return console.log(err)
  }

  return console.log(`server is listening on ${ port }`)
});
