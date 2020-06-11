import 'reflect-metadata';

import { Container } from 'typedi';
import { Request, Response } from 'express';

import '../../__mocks__/utils/logger';

import { MockTokenService } from '../../__utils__/mocks/MockTokenService';

import { TokenService } from '../../../src/services/TokenService';
import { AuthService } from '../../../src/services/AuthService';


describe('AuthService class', () => {

    let serviceUnderTest: AuthService;

    beforeAll(() => {
        Container.set(TokenService, MockTokenService);
        serviceUnderTest = Container.get(AuthService);
    });

    beforeEach(() => {
        MockTokenService.setupMocks();
    });

    describe('refresh token', () => {

        it('should generate new refresh token and create new cookie', () => {
            // given
            MockTokenService.refreshToken.generate.mockReturnValue('MOCK_TOKEN_VALUE');
            const res = { cookie: jest.fn() } as unknown as Response;
            const userData = { id: 'TEST_USER_ID' };

            // when
            serviceUnderTest.generateRefreshToken(res, userData);

            // then
            expect(MockTokenService.refreshToken.generate).toHaveBeenCalledTimes(1);
            expect(MockTokenService.refreshToken.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
            expect(res.cookie).toHaveBeenCalledTimes(1);
            expect(res.cookie).toHaveBeenCalledWith('rt', 'MOCK_TOKEN_VALUE', expect.objectContaining({
                httpOnly: true,
                path: '/refresh_token',
            }));
        });

        it('should verify and return token payload if token from cookie is valid', () => {
            // given
            MockTokenService.refreshToken.verify.mockReturnValue({ sub: 'TEST_USER_ID', iat: -1, exp: -1 });
            const validSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { cookie: `rt=${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyRefreshToken(req);

            // then
            expect(MockTokenService.refreshToken.verify).toHaveBeenCalledTimes(1);
            expect(MockTokenService.refreshToken.verify).toHaveBeenCalledWith(validSampleToken);
            expect(extractedPayload).toMatchObject({ sub: 'TEST_USER_ID' });
        });

        it('should throw error if refresh token from cookie is invalid', () => {
            // given
            MockTokenService.refreshToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const invalidSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { cookie: `rt=${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow('INVALID_TOKEN');
            expect(MockTokenService.refreshToken.verify).toHaveBeenCalledTimes(1);
            expect(MockTokenService.refreshToken.verify).toHaveBeenCalledWith(invalidSampleToken);
        });

        it('should throw error if refresh token from cookie is missing', () => {
            // given
            MockTokenService.refreshToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const req = { headers: { cookie: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow('INVALID_TOKEN');
            expect(MockTokenService.refreshToken.verify).toHaveBeenCalledTimes(1);
            expect(MockTokenService.refreshToken.verify).toHaveBeenCalledWith(undefined);
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
            MockTokenService.accessToken.generate.mockReturnValue('MOCK_TOKEN_VALUE');
            const userData = { id: 'TEST_USER_ID' };

            // when
            const accessToken = serviceUnderTest.generateAccessToken(userData);

            // then
            expect(accessToken).toBe('MOCK_TOKEN_VALUE');
            expect(MockTokenService.accessToken.generate).toHaveBeenCalledTimes(1);
            expect(MockTokenService.accessToken.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
        });

        it('should verify and return token payload if access token from req header is valid', () => {
            // given
            MockTokenService.accessToken.verify.mockReturnValue({ sub: 'TEST_USER_ID', iat: -1, exp: -1 });
            const validSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { authorization: `Bearer ${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyAccessToken(req);

            // then
            expect(extractedPayload).toMatchObject({ sub: 'TEST_USER_ID' });
            expect(MockTokenService.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(MockTokenService.accessToken.verify).toHaveBeenCalledWith(validSampleToken);
        });

        it('should throw error if access token from req header is invalid', () => {
            // given
            MockTokenService.accessToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const invalidSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { authorization: `Bearer ${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow('INVALID_TOKEN');
            expect(MockTokenService.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(MockTokenService.accessToken.verify).toHaveBeenCalledWith(invalidSampleToken);
        });

        it('should throw error if access token from req header is missing', () => {
            // given
            MockTokenService.accessToken.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const req = { headers: { authorization: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow('INVALID_TOKEN');
            expect(MockTokenService.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(MockTokenService.accessToken.verify).toHaveBeenCalledWith(undefined);
        });

    });

});
