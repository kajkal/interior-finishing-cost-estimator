import { TokenExpiredError } from 'jsonwebtoken';

import { TokenVerifierSpy } from '../../../__utils__/spies-managers/TokenVerifierSpy';

import { UnauthorizedError } from '../../../../code/utils/auth/UnauthorizedError';
import { AuthUtils } from '../../../../code/utils/auth/AuthUtils';


describe('AuthUtils class', () => {

    describe('isProtectedOperation function', () => {

        it('should determine if operation is protected', () => {
            [ 'Login', 'Register', 'Logout' ].forEach((operationName) => {
                expect(AuthUtils.isProtectedOperation(operationName)).toBe(false);
            });
            [ 'SampleProtectedOperation' ].forEach((operationName) => {
                expect(AuthUtils.isProtectedOperation(operationName)).toBe(true);
            });
        });

    });

    describe('verifyAccessToken function', () => {

        beforeEach(() => {
            TokenVerifierSpy.setupSpiesAndMockImplementations();
        });

        it('should return token if token is valid', () => {
            expect(AuthUtils.verifyAccessToken('sample-token')).toBe('sample-token');
        });

        it('should return null if token is invalid', () => {
            TokenVerifierSpy.verifyTokenExpiration.mockImplementation(() => {
                throw new TokenExpiredError('TOKEN_EXPIRED', new Date());
            });
            expect(AuthUtils.verifyAccessToken('sample-token')).toBe(null);
        });

    });

    describe('refreshAccessToken function', () => {

        let fetchSpy: jest.SpiedFunction<() => Promise<Partial<Response>>>;

        beforeEach(() => {
            // @ts-ignore
            fetchSpy = jest.spyOn(global, 'fetch');
        });

        afterEach(() => {
            fetchSpy.mockRestore();
        });

        it('should return access token fetched from server', async () => {
            fetchSpy.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ accessToken: 'REFRESHED_ACCESS_TOKEN' }),
            });

            const accessToken = await AuthUtils.refreshAccessToken();
            expect(accessToken).toBe('REFRESHED_ACCESS_TOKEN');
        });

        it('should throw error in case of server error', async (done) => {
            fetchSpy.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ errorMessage: 'invalid refresh token' }),
            });

            try {
                await AuthUtils.refreshAccessToken();
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedError);
                expect(error).toHaveProperty('message', 'invalid refresh token');
                done();
            }
        });

        it('should throw error in case of network error', async (done) => {
            fetchSpy.mockRejectedValue(new Error('network error'));

            try {
                await AuthUtils.refreshAccessToken();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty('message', 'network error');
                done();
            }
        });

    });

});
