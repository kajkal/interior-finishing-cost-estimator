import 'reflect-metadata';
import { hash } from 'argon2';
import { MongoClient, ObjectID } from 'mongodb';

import { generateSlugBase } from '../../../src/utils/generateUniqueSlug';
import { Product } from '../../../src/entities/product/Product';
import { Project } from '../../../src/entities/project/Project';
import { Inquiry } from '../../../src/entities/inquiry/Inquiry';
import { User } from '../../../src/entities/user/User';
import { generator } from '../generator';


export interface UserData extends Omit<User, 'id' | 'products' | 'projects' | 'inquiries' | 'bookmarkedInquiries'> {
    bookmarkedInquiries?: string[];
}

export interface ProductData extends Omit<Product, 'id' | 'user'> {
    user: ObjectID;
}

export interface ProjectData extends Omit<Project, 'id' | 'user'> {
    user: ObjectID;
}

export interface InquiryData extends Omit<Inquiry, 'id' | 'user'> {
    user: ObjectID;
}

/**
 * Class with helper functions created for integration/e2e tests
 */
export class TestDatabaseManager {

    private constructor(private client: MongoClient) {
    }

    static async connect(clientUrl: string) {
        return new this(await MongoClient.connect(clientUrl, { useUnifiedTopology: true }));
    }

    async disconnect() {
        await this.client.close();
    }

    async clear() {
        const db = this.client.db();
        const collections = await db.collections();
        await Promise.all(
            collections.map(async (collection) => {
                await collection.deleteMany({});
            }),
        );
    }


    /**
     * User
     */
    async populateWithUser(partialUserData?: Partial<UserData>): Promise<User & { unencryptedPassword: string }> {
        const name = generator.name();
        const unencryptedPassword = partialUserData?.password || generator.string({ length: 8 });
        const encryptedPassword = await hash(unencryptedPassword);
        const userData: Omit<UserData, '_id'> = {
            createdAt: new Date(),
            name,
            slug: generateSlugBase(name),
            email: generator.email(),
            isEmailAddressConfirmed: false,
            hidden: false,
            profileDescription: null,
            location: null,
            ...partialUserData,
            password: encryptedPassword,
        };

        const collection = this.client.db().collection('users');
        const { ops: [ insertedUser ] } = await collection.insertOne(userData);
        return Object.assign(insertedUser, { id: insertedUser._id.toString(), unencryptedPassword });
    }


    /**
     * Product
     */
    async populateWithProduct(userId: string, partialProductData?: Partial<ProductData>): Promise<Product> {
        const productData: Omit<ProductData, '_id'> = {
            createdAt: new Date(),
            user: new ObjectID(userId),
            name: generator.word({ length: 5 }),
            description: `[{"sample":"${generator.sentence()}"}]`,
            ...partialProductData,
        };

        const collection = this.client.db().collection('products');
        const { ops: [ insertedProduct ] } = await collection.insertOne(productData);
        return Object.assign(insertedProduct, { id: insertedProduct._id.toString() });
    }


    /**
     * Project
     */
    async populateWithProject(userId: string, partialProjectData?: Partial<ProjectData>): Promise<Project> {
        const name = generator.sentence({ words: 5 }).replace(/\./g, '');
        const projectData: Omit<ProjectData, '_id'> = {
            createdAt: new Date(),
            user: new ObjectID(userId),
            name,
            slug: generateSlugBase(name),
            ...partialProjectData,
        };

        const collection = this.client.db().collection('projects');
        const { ops: [ insertedProject ] } = await collection.insertOne(projectData);
        return Object.assign(insertedProject, { id: insertedProject._id.toString() });
    }


    /**
     * Inquiry
     */
    async populateWithInquiry(userId: string, partialInquiryData?: Partial<InquiryData>): Promise<Inquiry> {
        const inquiryData: Omit<InquiryData, '_id'> = {
            createdAt: new Date(),
            user: new ObjectID(userId),
            title: generator.sentence({ words: 5 }),
            description: `[{"sample":"${generator.sentence()}"}]`,
            location: generator.location(),
            category: generator.inquiryCategory(),
            ...partialInquiryData,
        };

        const collection = this.client.db().collection('inquiries');
        const { ops: [ insertedInquiry ] } = await collection.insertOne(inquiryData);
        return Object.assign(insertedInquiry, { id: insertedInquiry._id.toString() });
    }


    /**
     * to fix problems with Cypress serialization
     */
    toJSON() {
        return 'TestDatabaseManager';
    }

}
