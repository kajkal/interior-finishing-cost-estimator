import 'reflect-metadata';

import { Container } from 'typedi';
import { Request, Response } from 'express';

import '../../../__mocks__/utils/logger';

import { AccessTokenManagerSpy } from '../../../__utils__/spies/services/auth/AccessTokenManagerSpy';
import { RefreshTokenManagerSpy } from '../../../__utils__/spies/services/auth/RefreshTokenManagerSpy';

import { AuthService } from '../../../../src/services/auth/AuthService';


describe('AuthService class', () => {

    let serviceUnderTest: AuthService;

    beforeAll(() => {
        serviceUnderTest = Container.get(AuthService);
    });

    beforeEach(() => {
        AccessTokenManagerSpy.setupSpiesAndMockImplementations();
        RefreshTokenManagerSpy.setupSpiesAndMockImplementations();
    });

    describe('refresh token', () => {

        it('should generate new refresh token and create new cookie', () => {
            // given
            RefreshTokenManagerSpy.generate.mockReturnValue('MOCK_TOKEN_VALUE');
            const res = { cookie: jest.fn() } as unknown as Response;
            const userData = { id: 'TEST_USER_ID' };

            // when
            serviceUnderTest.generateRefreshToken(res, userData);

            // then
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
            expect(res.cookie).toHaveBeenCalledTimes(1);
            expect(res.cookie).toHaveBeenCalledWith('rt', 'MOCK_TOKEN_VALUE', expect.objectContaining({
                httpOnly: true,
                path: '/refresh_token',
            }));
        });

        it('should verify and return token payload if token from cookie is valid', () => {
            // given
            RefreshTokenManagerSpy.verify.mockReturnValue({ sub: 'TEST_USER_ID', iat: -1, exp: -1 });
            const validSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { cookie: `rt=${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyRefreshToken(req);

            // then
            expect(RefreshTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(RefreshTokenManagerSpy.verify).toHaveBeenCalledWith(validSampleToken);
            expect(extractedPayload).toMatchObject({ sub: 'TEST_USER_ID' });
        });

        it('should throw error if refresh token from cookie is invalid', () => {
            // given
            RefreshTokenManagerSpy.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const invalidSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { cookie: `rt=${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow('INVALID_TOKEN');
            expect(RefreshTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(RefreshTokenManagerSpy.verify).toHaveBeenCalledWith(invalidSampleToken);
        });

        it('should throw error if refresh token from cookie is missing', () => {
            // given
            RefreshTokenManagerSpy.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const req = { headers: { cookie: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow('INVALID_TOKEN');
            expect(RefreshTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(RefreshTokenManagerSpy.verify).toHaveBeenCalledWith(undefined);
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
            AccessTokenManagerSpy.generate.mockReturnValue('MOCK_TOKEN_VALUE');
            const userData = { id: 'TEST_USER_ID' };

            // when
            const accessToken = serviceUnderTest.generateAccessToken(userData);

            // then
            expect(accessToken).toBe('MOCK_TOKEN_VALUE');
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
        });

        it('should verify and return token payload if access token from req header is valid', () => {
            // given
            AccessTokenManagerSpy.verify.mockReturnValue({ sub: 'TEST_USER_ID', iat: -1, exp: -1 });
            const validSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { authorization: `Bearer ${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyAccessToken(req);

            // then
            expect(extractedPayload).toMatchObject({ sub: 'TEST_USER_ID' });
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledWith(validSampleToken);
        });

        it('should throw error if access token from req header is invalid', () => {
            // given
            AccessTokenManagerSpy.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const invalidSampleToken = 'TOKEN_TEST_VALUE';
            const req = { headers: { authorization: `Bearer ${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow('INVALID_TOKEN');
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledWith(invalidSampleToken);
        });

        it('should throw error if access token from req header is missing', () => {
            // given
            AccessTokenManagerSpy.verify.mockImplementation(() => {
                throw new Error('INVALID_TOKEN');
            });
            const req = { headers: { authorization: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow('INVALID_TOKEN');
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledWith(undefined);
        });

    });

});
