import 'dotenv/config';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import api from '@/api';

import config from '@/config';
import firebase from '@/lib/firebase';
import RedisCache from '@/lib/redisCache';
import autorizationMiddleware from '@/middleware/authorization-middleware';

import initializeDb from './db';
import MQTT from './lib/mqtt';
import { startCronJobs } from './cronAggregate';

const app = express();

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.express.corsHeaders
  })
);

app.use(
  bodyParser.json({
    limit: config.express.bodyLimit
  })
);

app.use(autorizationMiddleware);

const client = new RedisCache();
const mqtt = new MQTT();
const env = process.env.NODE_ENV ?? '';

firebase.getInstance();
// connect to db
initializeDb()
  .then((db?: mongoose.Connection) => {
    if (!db) {
      console.error('database not connected');
      return;
    }

    if (env.toLowerCase() === 'production') {
      startCronJobs();
    }

    // api router
    app.use('/api', api({ config, client, db }));

    const port = process.env.PORT || config.express.port;

    app.listen(port);

    mqtt.connect();

    console.log(`Started on port ${port}`);
  })
  .catch(err => {
    console.error(err);
    mqtt.closeConnection();
  });

export default app;
