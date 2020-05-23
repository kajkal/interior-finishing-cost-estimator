import { hash } from 'argon2';
import { Container } from 'typedi';
import { MikroORM } from 'mikro-orm';
import { Db } from 'mongodb';

import { connectToDatabase } from '../../../src/loaders/mongodb';
import { Product } from '../../../src/entities/product/Product';
import { User } from '../../../src/entities/user/User';


/**
 * Class with helper functions created for integration tests
 */
export class TestDatabaseManager {

    private static orm: MikroORM;

    /**
     * Connect to test database
     */
    static async connect() {
        if (!this.orm) {
            await connectToDatabase();
            this.orm = Container.get(MikroORM);
        } else {
            await this.orm.connect();
        }
    }

    /**
     * Clear test db and disconnect
     */
    static async disconnect() {
        // @ts-ignore
        const db = this.orm.em.getConnection().getDb() as Db;
        const collections = await db.collections();
        await Promise.all(
            collections.map(async (collection) => {
                await collection.deleteMany({});
            }),
        );
        await this.orm.close();
    }

    static async populateWithUser(userData: Partial<Omit<User, 'products' | 'projects' | 'offers'>>) {
        const repository = this.orm.em.getRepository(User);
        const user = repository.create({
            ...userData,
            password: await hash(userData.password!),
        });
        await repository.persistAndFlush(user);
        return user;
    }

    static async populateWithProduct(productData: Partial<Omit<Product, 'user'>> & { user: string }) {
        const repository = this.orm.em.getRepository(Product);
        const product = repository.create(productData);
        await repository.persistAndFlush(product);
        return product;
    }

}
