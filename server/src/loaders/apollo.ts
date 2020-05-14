import { Container } from 'typedi';
import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';

import { ProductResolver } from '../modules/product/ProductResolver';
import { ProjectResolver } from '../modules/project/ProjectResolver';
import { OfferResolver } from '../modules/offer/OfferResolver';
import { UserResolver } from '../modules/user/UserResolver';
import { authChecker } from '../utils/authChecker';


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

export async function createApolloServer(): Promise<ApolloServer> {
    return new ApolloServer({
        schema: await buildGraphQLSchema(),
        context: (expressContext) => expressContext,
    });
}
