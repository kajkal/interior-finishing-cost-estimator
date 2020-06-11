import 'reflect-metadata';

import request from 'supertest';
import { Server } from 'http';
import { Response } from 'express';
import { Container } from 'typedi';
import { ApolloServer } from 'apollo-server-express';

import { MockRequestContext } from '../__mocks__/libraries/mikro-orm';
import { MockLogger } from '../__mocks__/utils/logger';

import { AuthServiceSpiesManager } from '../__utils__/spies-managers/AuthServiceSpiesManager';

import { createExpressServer } from '../../src/loaders/express';
import { AuthService } from '../../src/services/AuthService';
import { User } from '../../src/entities/user/User';


describe('ExpressServer', () => {

    const mockApolloServer = { applyMiddleware: jest.fn() } as unknown as ApolloServer;
    let serverUnderTest: Server;

    beforeEach(() => {
        MockRequestContext.setupMocks();
        MockLogger.setupMocks();
        AuthServiceSpiesManager.setupSpies();

        serverUnderTest = createExpressServer(mockApolloServer);
    });

    afterEach(() => {
        serverUnderTest.close();
    });

    describe('/refresh_token', () => {

        const url = '/refresh_token';

        async function createRefreshTokenCookie(userData: Pick<User, 'id'>): Promise<string> {
            return new Promise((resolve) => {
                const mockResponse = {
                    cookie: (cookieName: string, cookieValue: string) => {
                        AuthServiceSpiesManager.generateRefreshToken.mockClear();
                        resolve(`${cookieName}=${cookieValue}`);
                    },
                } as unknown as Response;
                Container.get(AuthService).generateRefreshToken(mockResponse, userData);
            });
        }

        it('should responds with status 200 and new access token when refresh token\' cookie is valid', async () => {
            expect.assertions(7);

            // given
            const userData = { id: 'TEST_USER_ID' };
            const validRefreshTokenCookie = await createRefreshTokenCookie(userData);

            // when
            const res = await request(serverUnderTest).post(url).set('Cookie', validRefreshTokenCookie);

            // then
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ accessToken: expect.any(String) });
            expect(AuthServiceSpiesManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledWith(expect.any(Object), userData);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledWith(userData);
        });

        it('should responds with status 401 and JSON error object when refresh token\' cookie is invalid', async () => {
            expect.assertions(6);

            // given
            const invalidRefreshTokenCookie = 'invalid=refresh_token';

            // when
            const res = await request(serverUnderTest).post(url).set('Cookie', invalidRefreshTokenCookie);

            // then
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ errorMessage: 'INVALID_REFRESH_TOKEN' });
            expect(AuthServiceSpiesManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpiesManager.invalidateRefreshToken).toHaveBeenCalledTimes(1);
        });

    });

    it('should responds with status 404 and JSON error object', async () => {
        expect.assertions(2);

        // given
        const url = '/not-registered-path';

        // when
        const res = await request(serverUnderTest).get(url);

        // then
        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            errorMessage: 'NOT_FOUND',
            method: 'GET',
            path: url,
        });
    });

});
