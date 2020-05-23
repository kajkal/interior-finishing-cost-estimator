import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { AccessTokenPayload } from '../token/AccessTokenPayload';


/**
 * Enriched basic context with JWT payload.
 */
export interface AuthorizedContext extends ExpressContext {
    jwtPayload: AccessTokenPayload;
}
