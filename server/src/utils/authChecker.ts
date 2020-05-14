import { Container } from 'typedi';
import { AuthChecker } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { AuthService, JwtPayload } from '../services/AuthService';
import { GraphQLLogger } from './logger';


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
        enrichedContent.jwtPayload = Container.get(AuthService).verifyAccessToken(context.req);
        return true;
    } catch (error) {
        Container.get(GraphQLLogger).warn({ message: 'invalid token', info });
        throw new AuthenticationError('INVALID_ACCESS_TOKEN');
    }
};
