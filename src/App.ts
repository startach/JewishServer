import * as express from 'express';
import { Express } from 'express';
import router from "./routes/synagogue";

class App {
  public express: Express

  constructor() {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes(): void {
    this.express.use('/synagogue', router)
  }
}

export default new App().express
