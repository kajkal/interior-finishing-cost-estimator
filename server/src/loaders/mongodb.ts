import { Container } from 'typedi';
import { EntityManager, MikroORM } from 'mikro-orm';

import { config } from '../config/config';
import { logger } from '../utils/logger';
import { BaseEntity } from '../entities/BaseEntity';
import { User } from '../entities/user/User';
import { Product } from '../entities/product/Product';
import { Project } from '../entities/project/Project';
import { Inquiry } from '../entities/inquiry/Inquiry';
import { UserRepository } from '../repositories/UserRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { InquiryRepository } from '../repositories/InquiryRepository';


export async function connectToDatabase(): Promise<MikroORM> {
    try {
        const orm = await MikroORM.init({
            cache: { options: { cacheDir: config.dataBase.cacheDir } }, // google cloud requirement
            clientUrl: config.dataBase.mongodbUrl,
            entities: [
                BaseEntity,
                User,
                Product,
                Project,
                Inquiry,
            ],
            // ensureIndexes: true,
            // debug: true,
        });

        Container.set(MikroORM, orm);
        Container.set(EntityManager, orm.em);
        Container.set(UserRepository, orm.em.getRepository(User));
        Container.set(ProductRepository, orm.em.getRepository(Product));
        Container.set(ProjectRepository, orm.em.getRepository(Project));
        Container.set(InquiryRepository, orm.em.getRepository(Inquiry));

        logger.info('Successfully connected to the database.');
        return orm;
    } catch (error) {
        logger.error('Cannot connect to database. ', error);
        process.exit();
    }
}
