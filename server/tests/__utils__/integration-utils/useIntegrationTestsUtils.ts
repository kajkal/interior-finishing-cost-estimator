import { Server } from 'http';
import request, { Request } from 'supertest';
import { ApolloServer } from 'apollo-server-express';

import { createExpressServer } from '../../../src/loaders/express';
import { createApolloServer } from '../../../src/loaders/apollo';
import { TestDatabaseManager } from './TestDatabaseManager';


export interface PostGraphQLData {
    query: string;
    variables?: {
        [ name: string ]: any;
    };
}

export interface IntegrationTestUtils {
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
        db: null!,
        apolloServer: null!,
        server: null!,
        postGraphQL: null!,
    };

    beforeAll(async () => {
        testUtils.db = await TestDatabaseManager.connect();
        testUtils.apolloServer = await createApolloServer();
    });
    afterAll(async () => {
        await testUtils.db.disconnect();
        await testUtils.apolloServer.stop();
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
