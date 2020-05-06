import { User } from '../../src/entities/user/User';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { JwtService } from '../../src/services/JwtService';


export class RequestContextUtils {

    static createWithInvalidCookie(): ExpressContext {
        return {
            req: {
                headers: {
                    cookie: '',
                },
            },
        } as ExpressContext;
    }

    static createWithValidCookie(user: Pick<User, 'id'>): ExpressContext {
        // get valid jwt:
        let jwtCookieName;
        let jwtCookieValue;
        new JwtService().generate({
            res: {
                cookie: (cookieName: string, cookieValue: string) => {
                    jwtCookieName = cookieName;
                    jwtCookieValue = cookieValue;
                },
            },
        } as ExpressContext, user);

        // create context
        const jwtCookie = `${jwtCookieName}=${jwtCookieValue}`;
        return {
            req: {
                headers: {
                    cookie: jwtCookie,
                },
            },
        } as ExpressContext;
    }

}
