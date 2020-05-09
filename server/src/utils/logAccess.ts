import { Container } from 'typedi';
import { MiddlewareFn } from 'type-graphql';

import { GraphQLLogger } from './logger';
import { AuthorizedContext } from './authChecker';


/**
 * TypeGraphQL middleware, used to log access to resolvers or queries.
 */
export const logAccess: MiddlewareFn<AuthorizedContext> = async ({ context, info }, next) => {
    try {
        await next();
        Container.get(GraphQLLogger).info({ message: 'access', info, jwtPayload: context?.jwtPayload });
    } catch (error) {
        Container.get(GraphQLLogger).info({ message: 'access-error', info, jwtPayload: context?.jwtPayload, error: error.message });
        throw error;
    }
};
