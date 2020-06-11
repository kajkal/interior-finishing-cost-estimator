import { Db } from 'mongodb';
import { hash } from 'argon2';
import { MikroORM, wrap } from 'mikro-orm';

import { connectToDatabase } from '../../../src/loaders/mongodb';
import { Product } from '../../../src/entities/product/Product';
import { User } from '../../../src/entities/user/User';
import { generator } from '../generator';


/**
 * Class with helper functions created for integration tests
 */
export class TestDatabaseManager {

    private constructor(private orm: MikroORM) {
    }

    /**
     * Connect to test database
     */
    static async connect() {
        return new this(await connectToDatabase());
    }

    /**
     * Clear test db and disconnect
     */
    async disconnect() {
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


    /**
     * User
     */
    async populateWithUser(partialUserData?: Partial<Omit<User, 'products' | 'projects' | 'offers'>>): Promise<User & { unencryptedPassword: string }> {
        const userData = {
            name: generator.name(),
            email: generator.email(),
            password: generator.string({ length: 8 }),
            isEmailAddressConfirmed: false,
            ...partialUserData,
        };

        const user = new User();
        wrap(user).assign({ ...userData, password: await hash(userData.password) }, { em: this.orm.em });
        await this.orm.em.persistAndFlush(user);

        return Object.assign(user, { unencryptedPassword: userData.password });
    }


    /**
     * Product
     */
    async populateWithProduct(userId: string, partialProductData?: Partial<Omit<Product, 'user'>>): Promise<Product> {
        const productData = {
            user: userId,
            name: generator.word(),
            ...partialProductData,
        };

        const product = new Product();
        wrap(product).assign(productData, { em: this.orm.em });
        await this.orm.em.persistAndFlush(product);

        return product;
    }

}
