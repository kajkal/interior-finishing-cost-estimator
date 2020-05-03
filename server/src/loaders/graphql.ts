import cors from 'cors';
import Express from 'express';
import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';

import { UserResolver } from '../modules/user/UserResolver';
import { authChecker } from '../utils/authChecker';
import { config } from '../config/config';
import { logger } from '../utils/logger';


/**
 * Exported for sake of testing.
 */
export function buildGraphQLSchema(): Promise<GraphQLSchema> {
    return buildSchema({
        resolvers: [ UserResolver ],
        authChecker,
    });
}

export async function createGraphQLServer() {
    const apolloServer = new ApolloServer({
        schema: await buildGraphQLSchema(),
        context: (expressContext) => expressContext,
    });

    const app = Express();
    app.use(
        cors({
            origin: config.server.corsOrigin,
            credentials: true,
        }),
    );

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(config.server.port, () => {
        logger.info(`Server started at http://localhost:${config.server.port}/graphql`);
    });
}
