import 'reflect-metadata';

import request from 'supertest';
import { Server } from 'http';
import { Response } from 'express';
import { Container } from 'typedi';
import { ApolloServer } from 'apollo-server-express';

import { MockEntityManager, MockRequestContext } from '../__mocks__/libraries/mikro-orm';
import { MockLogger } from '../__mocks__/utils/logger';

import { AuthServiceSpy } from '../__utils__/spies/services/auth/AuthServiceSpy';

import { createExpressServer } from '../../src/loaders/express';
import { AuthService } from '../../src/services/auth/AuthService';
import { User } from '../../src/entities/user/User';


describe('ExpressServer', () => {

    const mockApolloServer = { applyMiddleware: jest.fn() } as unknown as ApolloServer;
    let serverUnderTest: Server;

    beforeEach(async () => {
        MockEntityManager.fork.mockClear();
        MockRequestContext.mockClear();
        MockLogger.setupMocks();
        AuthServiceSpy.setupSpies();

        serverUnderTest = await createExpressServer(mockApolloServer);
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
                        AuthServiceSpy.generateRefreshToken.mockClear();
                        resolve(`${cookieName}=${cookieValue}`);
                    },
                } as unknown as Response;
                Container.get(AuthService).generateRefreshToken(mockResponse, userData);
            });
        }

        it('should responds with status 200 and new access token when refresh token\' cookie is valid', async (done) => {
            // given
            const userData = { id: 'TEST_USER_ID' };
            const validRefreshTokenCookie = await createRefreshTokenCookie(userData);

            // when
            const res = await request(serverUnderTest).post(url).set('Cookie', validRefreshTokenCookie);

            // then
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ accessToken: expect.any(String) });
            expect(AuthServiceSpy.verifyRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpy.generateRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpy.generateRefreshToken).toHaveBeenCalledWith(expect.any(Object), userData);
            expect(AuthServiceSpy.generateAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpy.generateAccessToken).toHaveBeenCalledWith(userData);
            done();
        });

        it('should responds with status 401 and JSON error object when refresh token\' cookie is invalid', async (done) => {
            // given
            const invalidRefreshTokenCookie = 'invalid=refresh_token';

            // when
            const res = await request(serverUnderTest).post(url).set('Cookie', invalidRefreshTokenCookie);

            // then
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ errorMessage: 'INVALID_REFRESH_TOKEN' });
            expect(AuthServiceSpy.verifyRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpy.generateRefreshToken).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpy.generateAccessToken).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpy.invalidateRefreshToken).toHaveBeenCalledTimes(1);
            done();
        });

    });

    it('should responds with status 404 and JSON error object', async (done) => {
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
        done();
    });

});
