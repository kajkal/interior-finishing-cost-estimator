import cors from 'cors';
import { Server } from 'http';
import { Container } from 'typedi';
import Express, { NextFunction, Request, Response } from 'express';
import { EntityManager, RequestContext } from 'mikro-orm';

import { ApolloServer } from 'apollo-server-express';
import { AuthService } from '../services/AuthService';
import { config } from '../config/config';
import { logger } from '../utils/logger';


async function handleRefreshTokenRequest(req: Request, res: Response) {
    const authService = Container.get(AuthService);
    try {
        const jwtPayload = authService.verifyRefreshToken(req);
        const userData = { id: jwtPayload.sub };
        authService.generateRefreshToken(res, userData);
        res.status(200).json({ accessToken: authService.generateAccessToken(userData) });
        logger.debug('refresh token success!'); // TODO: remove
    } catch (error) {
        authService.invalidateRefreshToken(res);
        res.status(401).json({ errorMessage: 'INVALID_REFRESH_TOKEN' });
        logger.warn(`invalid refresh token, '${error.message}'`);
    }
}

function handleNotRegisteredPath(req: Request, res: Response, next: NextFunction) {
    const notFoundError = new Error('NOT_FOUND');
    Object.defineProperty(notFoundError, 'status', { value: 404 });
    next(notFoundError);
}

function handleErrorResponse(err: any, req: Request, res: Response, _next: NextFunction) {
    logger.warn('not-found', { method: req.method, path: req.path, userAgent: req.headers[ 'user-agent' ] });
    res.status(err.status || 500).json({ errorMessage: err.message, method: req.method, path: req.path });
}

export function createExpressServer(apolloServer: ApolloServer): Promise<Server> {
    const app = Express();
    app.use(cors({
        origin: config.webClient.url,
        credentials: true,
    }));
    app.post('/refresh_token', handleRefreshTokenRequest);

    // fork em for each request
    const em = Container.get(EntityManager);
    app.use((req, res, next) => RequestContext.create(em, next));

    // attach GraphQl server
    apolloServer.applyMiddleware({ app, cors: false });

    // handle errors
    app.use(handleNotRegisteredPath);
    app.use('/', handleErrorResponse);

    return new Promise((resolve) => {
        const server = app.listen(config.server.port, () => {
            logger.info('Server started', server.address());
            resolve(server);
        });
    });
}
