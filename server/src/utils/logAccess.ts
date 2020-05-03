import { MiddlewareFn } from 'type-graphql';

import { graphQLLogger } from './logger';
import { AuthorizedContext } from './authChecker';


/**
 * TypeGraphQL middleware, used to log access to resolvers or queries.
 */
export const logAccess: MiddlewareFn<AuthorizedContext> = async ({ context, info }, next) => {
    try {
        await next();
        graphQLLogger.info({ message: 'access', info, jwtPayload: context?.jwtPayload });
    } catch (error) {
        graphQLLogger.info({ message: 'access-error', info, jwtPayload: context?.jwtPayload, error: error.message });
        throw error;
    }
};
