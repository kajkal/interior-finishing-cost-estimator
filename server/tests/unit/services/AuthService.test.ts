import 'reflect-metadata';

import { Container } from 'typedi';
import { Request, Response } from 'express';

import { TokenServiceSpiesManager } from '../../__utils__/spies-managers/TokenServiceSpiesManager';
import '../../__mocks__/utils/logger';

import { AuthService } from '../../../src/services/AuthService';


describe('AuthService class', () => {

    let serviceUnderTest: AuthService;

    beforeAll(() => {
        serviceUnderTest = Container.get(AuthService);
    });

    beforeEach(() => {
        TokenServiceSpiesManager.setupSpiesAndMockImplementations();
    });

    describe('refresh token', () => {

        it('should generate new refresh token and create new cookie', () => {
            // given
            TokenServiceSpiesManager.refreshToken.generate.mockReturnValue('MOCK_TOKEN_VALUE');
            const res = { cookie: jest.fn() } as unknown as Response;
            const userData = { id: 'TEST_USER_ID' };

            // when
            serviceUnderTest.generateRefreshToken(res, userData);

            // then
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
            expect(res.cookie).toHaveBeenCalledTimes(1);
            expect(res.cookie).toHaveBeenCalledWith('rt', 'MOCK_TOKEN_VALUE', expect.objectContaining({
                httpOnly: true,
                path: '/refresh_token',
            }));
        });

        it('should verify and return token payload if token from cookie is valid', () => {
            // given
            TokenServiceSpiesManager.refreshToken.verify.mockReturnValue({ sub: 'TEST_USER_ID', iat: -1, exp: -1 });
            const validSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { cookie: `rt=${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyRefreshToken(req);

            // then
            expect(TokenServiceSpiesManager.refreshToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.refreshToken.verify).toHaveBeenCalledWith(validSampleToken);
            expect(extractedPayload).toMatchObject({ sub: 'TEST_USER_ID' });
        });

        it('should throw error if refresh token from cookie is invalid', () => {
            // given
            TokenServiceSpiesManager.refreshToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const invalidSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { cookie: `rt=${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow('INVALID_TOKEN');
            expect(TokenServiceSpiesManager.refreshToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.refreshToken.verify).toHaveBeenCalledWith(invalidSampleToken);
        });

        it('should throw error if refresh token from cookie is missing', () => {
            // given
            TokenServiceSpiesManager.refreshToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const req = { headers: { cookie: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow('INVALID_TOKEN');
            expect(TokenServiceSpiesManager.refreshToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.refreshToken.verify).toHaveBeenCalledWith(undefined);
        });

        it('should invalidate cookie with refresh token', () => {
            // given
            const res = { cookie: jest.fn() } as unknown as Response;

            // when
            serviceUnderTest.invalidateRefreshToken(res);

            // then
            expect(res.cookie).toHaveBeenCalledTimes(1);
            expect(res.cookie).toHaveBeenCalledWith('rt', '', expect.objectContaining({
                httpOnly: true,
                path: '/refresh_token',
                maxAge: 0,
            }));
        });

    });

    describe('access token', () => {

        it('should generate new access token', () => {
            // given
            TokenServiceSpiesManager.accessToken.generate.mockReturnValue('MOCK_TOKEN_VALUE');
            const userData = { id: 'TEST_USER_ID' };

            // when
            const accessToken = serviceUnderTest.generateAccessToken(userData);

            // then
            expect(accessToken).toBe('MOCK_TOKEN_VALUE');
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
        });

        it('should verify and return token payload if access token from req header is valid', () => {
            // given
            TokenServiceSpiesManager.accessToken.verify.mockReturnValue({ sub: 'TEST_USER_ID', iat: -1, exp: -1 });
            const validSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { authorization: `Bearer ${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyAccessToken(req);

            // then
            expect(extractedPayload).toMatchObject({ sub: 'TEST_USER_ID' });
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledWith(validSampleToken);
        });

        it('should throw error if access token from req header is invalid', () => {
            // given
            TokenServiceSpiesManager.accessToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const invalidSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { authorization: `Bearer ${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow('INVALID_TOKEN');
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledWith(invalidSampleToken);
        });

        it('should throw error if access token from req header is missing', () => {
            // given
            TokenServiceSpiesManager.accessToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const req = { headers: { authorization: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow('INVALID_TOKEN');
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledWith(undefined);
        });

    });

});
