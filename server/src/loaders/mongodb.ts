import { Container } from 'typedi';
import { createConnection, useContainer } from 'typeorm';

import { config } from '../config/config';
import { logger } from '../utils/logger';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { Project } from '../entities/Project';
import { Offer } from '../entities/Offer';


export async function connectToDatabase(): Promise<void> {
    try {
        useContainer(Container);
        await createConnection({
            type: 'mongodb',
            url: config.dataBase.mongodbUrl,
            logging: (process.env.NODE_ENV === 'production') ? [ 'error' ] : 'all',
            useNewUrlParser: true,
            useUnifiedTopology: true,
            entities: [
                User,
                Product,
                Project,
                Offer,
            ],
        });
        logger.info('Successfully connected to the database.');
    } catch (error) {
        logger.error('Cannot connect to database. ', error);
        process.exit();
    }
}
