import { Server } from 'http';
import { MikroORM } from 'mikro-orm';
import request, { Request } from 'supertest';
import { ApolloServer } from 'apollo-server-express';

import { createExpressServer } from '../../../src/loaders/express';
import { connectToDatabase } from '../../../src/loaders/mongodb';
import { createApolloServer } from '../../../src/loaders/apollo';
import { TestDatabaseManager } from './TestDatabaseManager';
import { config } from '../../../src/config/config';


export interface PostGraphQLData {
    query: string;
    variables?: {
        [ name: string ]: any;
    };
}

export interface IntegrationTestUtils {
    orm: MikroORM;
    db: TestDatabaseManager;
    apolloServer: ApolloServer;
    server: Server;
    postGraphQL: (data: PostGraphQLData) => Request;
}

/**
 * Function with utils used in GraphQL integration tests.
 * Note: do not destructure config object.
 */
export function useIntegrationTestsUtils(): IntegrationTestUtils {
    const testUtils: IntegrationTestUtils = {
        orm: null!,
        db: null!,
        apolloServer: null!,
        server: null!,
        postGraphQL: null!,
    };

    beforeAll(async () => {
        testUtils.orm = await connectToDatabase();
        testUtils.db = await TestDatabaseManager.connect(config.dataBase.mongodbUrl);
        testUtils.apolloServer = await createApolloServer();
    });
    afterAll(async () => {
        await testUtils.apolloServer.stop();
        await testUtils.db.clear();
        await testUtils.db.disconnect();
        await testUtils.orm.close();
    });

    beforeEach(async () => {
        testUtils.server = await createExpressServer(testUtils.apolloServer);
        testUtils.postGraphQL = (data: PostGraphQLData) => {
            return request(testUtils.server).post('/graphql').send(data);
        };
    });
    afterEach(() => {
        testUtils.server.close();
    });

    return testUtils;
}
