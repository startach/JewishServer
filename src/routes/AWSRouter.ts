import * as express from 'express';
import { Response, Request } from 'express';
import * as passport from 'passport';
const AWS = require('aws-sdk');
const uuid = require('uuid');

export class AWSRouter {
  public router = express.Router();
  public s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY || 'AKIAVMQNEANENQOQPX6R',
    secretAccessKey: process.env.AWS_SECRET_KEY || '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',
    signatureVersion: 'v4',
    region: 'eu-central-1',
  });
  constructor() {
    this.router.get(
      '/signed_url',
      // passport.authenticate('jwt', { session: false }),
      this.preSignURL,
    );
  }

  private prepareToPutObject = key =>
    new Promise((resolve, reject) => {
      this.s3.getSignedUrl(
        'putObject',
        {
          Bucket: process.env.AWS_BUCKET || 'jewish-light-central',
          Key: key,
          ACL: 'public-read',
        },
        (err, url) => {
          if (err) {
            return reject(err);
          }

          resolve({ key, url });
        },
      );
    });

  private preSignURL = async (req: Request, res: Response) => {
    console.log('okkk');
    // @ts-ignore
    let key = `images/${uuid()}`;
    const result = await this.prepareToPutObject(key);

    res.status(200);
    res.send(result);
  };
}
