import { Container } from 'typedi';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { AuthService } from '../../../src/services/AuthService';
import { User } from '../../../src/entities/user/User';


export class RequestContextUtils {

    static createWithInvalidAccessToken(): ExpressContext {
        return {
            req: {
                headers: {
                    authorization: '',
                },
            },
        } as ExpressContext;
    }

    static createWithValidAccessToken(userData: Pick<User, 'id'>): ExpressContext {
        const jwt = Container.get(AuthService).generateAccessToken(userData);
        return {
            req: {
                headers: {
                    authorization: `Bearer ${jwt}`,
                },
            },
        } as ExpressContext;
    }

}
