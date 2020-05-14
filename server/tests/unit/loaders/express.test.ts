import { Container } from 'typedi';
import { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { EntityManager, RequestContext } from 'mikro-orm';

import { MockExpress, MockExpressFunction } from '../../__mocks__/libraries/express';
import { MockApolloServer } from '../../__mocks__/libraries/apollo-server-express';
import { MockLogger } from '../../__mocks__/utils/logger';

import { AuthServiceSpiesManager } from '../../__utils__/spies-managers/AuthServiceSpiesManager';

import { createExpressServer, handleRefreshTokenRequest } from '../../../src/loaders/express';
import { AuthService, JwtPayload } from '../../../src/services/AuthService';


describe('express loader', () => {

    const MockEntityManager = 'ENTITY_MANAGER_TEST_VALUE';

    beforeAll(() => {
        Container.set(EntityManager, MockEntityManager);
        Container.set(AuthService, AuthServiceSpiesManager);
    });

    beforeEach(() => {
        MockLogger.setupMocks();
        AuthServiceSpiesManager.setupSpiesAndMockImplementations();
    });

    afterEach(() => {
        MockExpressFunction.mockClear();
        MockExpress.use.mockClear();
        MockExpress.post.mockClear();
        MockExpress.listen.mockClear();

        MockApolloServer.applyMiddleware.mockClear();
    });

    it('should create Express server with correct settings', async () => {
        expect.assertions(14);

        // given
        MockExpress.listen.mockImplementation((port, callback) => {
            callback();
        });

        // when
        await createExpressServer(MockApolloServer as unknown as ApolloServer);

        // then
        expect(MockExpressFunction).toHaveBeenCalledTimes(1);
        expect(MockExpress.use).toHaveBeenCalledTimes(2);
        expect(MockExpress.use).toHaveBeenNthCalledWith(1, expect.any(Function));
        expect(MockExpress.use).toHaveBeenNthCalledWith(2, expect.any(Function));
        expect(MockExpress.post).toHaveBeenCalledTimes(1);
        expect(MockExpress.post).toHaveBeenCalledWith('/refresh_token', handleRefreshTokenRequest);

        expect(MockApolloServer.applyMiddleware).toHaveBeenCalledTimes(1);
        expect(MockApolloServer.applyMiddleware).toHaveBeenCalledWith({
            app: expect.any(Object),
            cors: false,
        });

        expect(MockExpress.listen).toHaveBeenCalledTimes(1);
        expect(MockExpress.listen).toHaveBeenCalledWith(4005, expect.any(Function));

        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith(expect.stringMatching(/Server started/));

        // test MicroORM create context function
        const microOrmCreateReqContextSpy = jest.spyOn(RequestContext, 'create').mockReturnValueOnce(undefined);
        const microOrmCreateReqContextFn = MockExpress.use.mock.calls[ 1 ][ 0 ];
        microOrmCreateReqContextFn('REQ', 'RES', 'NEXT_FN_TEST_VALUE');
        expect(microOrmCreateReqContextSpy).toHaveBeenCalledTimes(1);
        expect(microOrmCreateReqContextSpy).toHaveBeenCalledWith(MockEntityManager, 'NEXT_FN_TEST_VALUE');
    });

    describe('/refresh_token path', () => {

        let req: string;
        let res: { status: jest.Mock, json: jest.Mock };

        beforeEach(() => {
            req = 'REQUEST_TEST_VALUE';
            res = { status: jest.fn(), json: jest.fn() };
            res.status.mockReturnValue(res);
        });

        it('should generate new refresh token and return new access token if refresh token from cookie is valid', async () => {
            expect.assertions(8);

            // given
            const samplePayload = { userId: 'TEST_USER_ID' } as JwtPayload;
            const sampleAccessToken = 'ACCESS_TOKEN_TEST_VALUE';
            AuthServiceSpiesManager.verifyRefreshToken.mockReturnValue(samplePayload);
            AuthServiceSpiesManager.generateAccessToken.mockReturnValue(sampleAccessToken);

            // when
            await handleRefreshTokenRequest(req as unknown as Request, res as unknown as Response);

            // then
            expect(AuthServiceSpiesManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.verifyRefreshToken).toHaveBeenCalledWith(req);

            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledWith(res, { id: samplePayload.userId });

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({ accessToken: sampleAccessToken });
        });

        it('should throw error when refresh token is invalid', async () => {
            expect.assertions(9);

            // given
            AuthServiceSpiesManager.verifyRefreshToken.mockImplementation(() => {
                throw new Error();
            });

            // when
            await handleRefreshTokenRequest(req as unknown as Request, res as unknown as Response);

            // then
            expect(AuthServiceSpiesManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.verifyRefreshToken).toHaveBeenCalledWith(req);

            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(0);

            expect(AuthServiceSpiesManager.invalidateRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.invalidateRefreshToken).toHaveBeenCalledWith(res);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({ message: 'INVALID_REFRESH_TOKEN' });
        });

    });

});
