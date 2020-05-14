import cors from 'cors';
import { Container } from 'typedi';
import Express, { Request, Response } from 'express';
import { EntityManager, RequestContext } from 'mikro-orm';

import { ApolloServer } from 'apollo-server-express';
import { AuthService } from '../services/AuthService';
import { config } from '../config/config';
import { Logger } from '../utils/logger';


/**
 * Exported for sake of testing.
 */
export async function handleRefreshTokenRequest(req: Request, res: Response) {
    const authService = Container.get(AuthService);
    try {
        const jwtPayload = authService.verifyRefreshToken(req);
        const userData = { id: jwtPayload.userId };
        authService.generateRefreshToken(res, userData);
        res.status(200).json({ accessToken: authService.generateAccessToken(userData) });
        Container.get(Logger).debug('refresh token success!'); // TODO: remove
    } catch (error) {
        authService.invalidateRefreshToken(res);
        res.status(401).json({ message: 'INVALID_REFRESH_TOKEN' });
        Container.get(Logger).warn(`invalid refresh token, '${error.message}'`);
    }
}

export async function createExpressServer(apolloServer: ApolloServer) {
    const app = Express();
    app.use(cors({
        origin: config.server.corsOrigin,
        credentials: true,
    }));
    app.post('/refresh_token', handleRefreshTokenRequest);

    const em = Container.get(EntityManager);
    app.use((req, res, next) => RequestContext.create(em, next));

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(config.server.port, () => {
        Container.get(Logger).info(`Server started at http://localhost:${config.server.port}/graphql`);
    });
}
