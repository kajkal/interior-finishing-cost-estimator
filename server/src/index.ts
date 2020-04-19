import express from 'express';
import { config } from './config';
import { logger } from './loaders/logger';


const app = express();

app.listen(config.port, (error) => {
    if (error) {
        logger.error(error);
    } else {
        logger.info(`Server is listening on ${config.port}.`);
    }
});

logger.silly('hello world!');
