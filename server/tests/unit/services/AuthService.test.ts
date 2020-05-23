import { Request, Response } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import '../../__mocks__/utils/logger';

import { AuthService } from '../../../src/services/AuthService';


describe('AuthService class', () => {

    const jwtRegExp = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
    const serviceUnderTest = new AuthService();

    beforeEach(() => {
        jest.spyOn(jwt, 'sign');
        jest.spyOn(jwt, 'verify');
    });

    afterEach(() => {
        (jwt.sign as jest.Mock).mockRestore();
        (jwt.verify as jest.Mock).mockRestore();
    });

    describe('refresh token', () => {

        it('should generate new refresh token and create new cookie', () => {
            // given
            const res = { cookie: jest.fn() } as unknown as Response;
            const userData = { id: 'TEST_USER_ID' };

            // when
            serviceUnderTest.generateRefreshToken(res, userData);

            // then
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                { sub: 'TEST_USER_ID' },
                'REFRESH_TOKEN_PRIVATE_KEY_TEST_VALUE',
                { expiresIn: expect.any(String) },
            );
            expect(res.cookie).toHaveBeenCalledTimes(1);
            expect(res.cookie).toHaveBeenCalledWith('rt', expect.stringMatching(jwtRegExp), expect.objectContaining({
                httpOnly: true,
                path: '/refresh_token',
            }));
        });

        it('should verify and return token payload if token from cookie is valid', () => {
            // given
            const samplePayload = { sub: 'TEST_USER_ID' };
            const validSampleToken = jwt.sign(samplePayload, 'REFRESH_TOKEN_PRIVATE_KEY_TEST_VALUE');
            const req = { headers: { cookie: `rt=${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyRefreshToken(req);

            // then
            expect(extractedPayload).toMatchObject(samplePayload);
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(validSampleToken, 'REFRESH_TOKEN_PRIVATE_KEY_TEST_VALUE');
        });

        it('should throw error if refresh token from cookie is invalid', () => {
            // given
            const samplePayload = { sub: 'TEST_USER_ID' };
            const invalidSampleToken = jwt.sign(samplePayload, 'WRONG_PRIVATE_KEY');
            const req = { headers: { cookie: `rt=${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow(new JsonWebTokenError('invalid signature'));
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(invalidSampleToken, 'REFRESH_TOKEN_PRIVATE_KEY_TEST_VALUE');
        });

        it('should throw error if refresh token from cookie is missing', () => {
            // given
            const req = { headers: { cookie: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyRefreshToken(req)).toThrow(new JsonWebTokenError('jwt must be provided'));
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(undefined, 'REFRESH_TOKEN_PRIVATE_KEY_TEST_VALUE');
        });

        it('should invalidate cookie with refresh token', () => {
            // given
            const res = { cookie: jest.fn() } as unknown as Response;

            // when
            serviceUnderTest.invalidateRefreshToken(res);

            // then
            expect(res.cookie).toHaveBeenCalledTimes(1);
            expect(res.cookie).toHaveBeenCalledWith('rt', '', expect.objectContaining({
                maxAge: 0,
            }));
        });

    });

    describe('access token', () => {

        it('should generate new access token', () => {
            // given
            const userData = { id: 'TEST_USER_ID' };

            // when
            const accessToken = serviceUnderTest.generateAccessToken(userData);

            // then
            expect(accessToken).toMatch(jwtRegExp);
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                { sub: 'TEST_USER_ID' },
                'ACCESS_TOKEN_PRIVATE_KEY_TEST_VALUE',
                { expiresIn: expect.any(String) },
            );
        });

        it('should verify and return token payload if access token from req header is valid', () => {
            // given
            const samplePayload = { sub: 'TEST_USER_ID' };
            const validSampleToken = jwt.sign(samplePayload, 'ACCESS_TOKEN_PRIVATE_KEY_TEST_VALUE');
            const req = { headers: { authorization: `Bearer ${validSampleToken}` } } as Request;

            // when
            const extractedPayload = serviceUnderTest.verifyAccessToken(req);

            // then
            expect(extractedPayload).toMatchObject(samplePayload);
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(validSampleToken, 'ACCESS_TOKEN_PRIVATE_KEY_TEST_VALUE');
        });

        it('should throw error if access token from req header is invalid', () => {
            // given
            const samplePayload = { sub: 'TEST_USER_ID' };
            const invalidSampleToken = jwt.sign(samplePayload, 'WRONG_PRIVATE_KEY');
            const req = { headers: { authorization: `Bearer ${invalidSampleToken}` } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow(new JsonWebTokenError('invalid signature'));
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(invalidSampleToken, 'ACCESS_TOKEN_PRIVATE_KEY_TEST_VALUE');
        });

        it('should throw error if access token from req header is missing', () => {
            // given
            const req = { headers: { authorization: '' } } as Request;

            // when/then
            expect(() => serviceUnderTest.verifyAccessToken(req)).toThrow(new JsonWebTokenError('jwt must be provided'));
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(undefined, 'ACCESS_TOKEN_PRIVATE_KEY_TEST_VALUE');
        });

    });

});
