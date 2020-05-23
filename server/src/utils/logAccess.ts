import { MiddlewareFn } from 'type-graphql';

import { AuthorizedContext } from '../types/context/AuthorizedContext';
import { logger } from './logger';


/**
 * TypeGraphQL middleware, used to log access to resolvers or queries.
 */
export const logAccess: MiddlewareFn<AuthorizedContext> = async ({ context, info }, next) => {
    try {
        await next();
        logger.info({ message: 'access', info, jwtPayload: context?.jwtPayload });
    } catch (error) {
        logger.info({ message: 'access-error', info, jwtPayload: context?.jwtPayload, error: error.message });
        throw error;
    }
};
