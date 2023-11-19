import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import 'dotenv/config'
import { RootRouter } from './routes/RootRouter';
import helmet from 'helmet';

export class App {
  private static instance: Express

  static getInstance() {
    if(!App.instance){
      App.instance = express()
      App.instance.use(bodyParser.urlencoded({ extended: false }))
      App.instance.use(bodyParser.json())
      App.instance.use(cors())
      App.instance.use(helmet())
      App.instance.use(RootRouter.getRouter())
    }
    return App.instance;
  }

}