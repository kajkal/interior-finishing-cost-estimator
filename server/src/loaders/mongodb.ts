import { Container } from 'typedi';
import { EntityManager, MikroORM } from 'mikro-orm';

import { config } from '../config/config';
import { logger } from '../utils/logger';
import { BaseEntity } from '../entities/BaseEntity';
import { User } from '../entities/user/User';
import { Product } from '../entities/product/Product';
import { Project } from '../entities/project/Project';
import { Offer } from '../entities/offer/Offer';
import { UserRepository } from '../repositories/UserRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { OfferRepository } from '../repositories/OfferRepository';


export async function connectToDatabase(): Promise<void> {
    try {
        const orm = await MikroORM.init({
            clientUrl: config.dataBase.mongodbUrl,
            entities: [
                BaseEntity,
                User,
                Product,
                Project,
                Offer,
            ],
            ensureIndexes: true,
            // debug: true,
        });

        Container.set(MikroORM, orm);
        Container.set(EntityManager, orm.em);
        Container.set(UserRepository, orm.em.getRepository(User));
        Container.set(ProductRepository, orm.em.getRepository(Product));
        Container.set(ProjectRepository, orm.em.getRepository(Project));
        Container.set(OfferRepository, orm.em.getRepository(Offer));

        logger.info('Successfully connected to the database.');
    } catch (error) {
        logger.error('Cannot connect to database. ', error);
        process.exit();
    }
}
