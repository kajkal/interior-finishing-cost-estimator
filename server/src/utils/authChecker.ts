import { Container } from 'typedi';
import { AuthChecker } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { JwtPayload, JwtService } from '../services/JwtService';
import { graphQLLogger } from './logger';


/**
 * Enriched basic context with JWT payload.
 */
export interface AuthorizedContext extends ExpressContext {
    jwtPayload: JwtPayload;
}

/**
 * TypeGraphQL authorization checker.
 * If JWT is valid -> request context is enriched with JWT payload object.
 *
 * @throws will throw an error if request is not properly authenticated.
 */
export const authChecker: AuthChecker<ExpressContext> = ({ context, info }, _roles): boolean => {
    try {
        const enrichedContent = context as AuthorizedContext;
        enrichedContent.jwtPayload = Container.get(JwtService).verify(context);
        return true;
    } catch (error) {
        graphQLLogger.warn({ message: 'invalid token', info });
        throw new AuthenticationError('INVALID_TOKEN');
    }
};
