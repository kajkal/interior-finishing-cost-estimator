import cors from 'cors';
import Express from 'express';
import { Container } from 'typedi';
import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { EntityManager, RequestContext } from 'mikro-orm';

import { config } from '../config/config';
import { logger } from '../utils/logger';
import { authChecker } from '../utils/authChecker';
import { UserResolver } from '../modules/user/UserResolver';
import { ProductResolver } from '../modules/product/ProductResolver';
import { ProjectResolver } from '../modules/project/ProjectResolver';
import { OfferResolver } from '../modules/offer/OfferResolver';


/**
 * Exported for sake of testing.
 */
export function buildGraphQLSchema(): Promise<GraphQLSchema> {
    return buildSchema({
        resolvers: [
            UserResolver,
            ProductResolver,
            ProjectResolver,
            OfferResolver,
        ],
        authChecker,
        container: Container,
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

    const em = Container.get(EntityManager);
    app.use((req, res, next) => RequestContext.create(em, next));

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(config.server.port, () => {
        logger.info(`Server started at http://localhost:${config.server.port}/graphql`);
    });
}
