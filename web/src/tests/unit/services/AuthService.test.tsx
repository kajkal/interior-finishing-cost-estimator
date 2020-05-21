import * as React from 'react';
import { sign } from 'jsonwebtoken';
import { Operation } from 'apollo-boost';

import { UnauthorizedError } from '../../../code/services/auth/UnauthorizedError';
import { AuthService } from '../../../code/services/auth/AuthService';


describe('AuthService component', () => {

    let serviceUnderTest: AuthService;
    let fetchSpy: jest.SpiedFunction<() => Promise<Partial<Response>>>;

    beforeEach(() => {
        serviceUnderTest = new AuthService();
        // @ts-ignore
        fetchSpy = jest.spyOn(global, 'fetch').mockImplementation();
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    function createSampleValidToken() {
        return sign({}, '_', { expiresIn: '1h' });
    }

    function createSampleExpiredToken() {
        return sign({}, '_', { expiresIn: '0s' });
    }

    function createSampleOperation(operationName: string = 'SampleProtectedOperation') {
        return { operationName, setContext: jest.fn() } as unknown as Operation;
    }

    describe('prepare request', () => {

        it('should add auth header only for protected operations', async (done) => {
            // given
            const publicOperations = [ 'Login', 'Register', 'Logout' ];

            // when/then
            await Promise.all(publicOperations.map(async (operationName: string) => {
                const operation = createSampleOperation(operationName);
                await serviceUnderTest.prepareRequest(operation);
                expect(operation.setContext).toHaveBeenCalledTimes(0);
            }));
            expect(fetchSpy).toHaveBeenCalledTimes(0);
            done();
        });

        it('should use valid access token from memory', async (done) => {
            // given
            const accessTokenFromMemory = createSampleValidToken();
            const operation = createSampleOperation();

            // when
            serviceUnderTest.setAccessToken(accessTokenFromMemory);
            await serviceUnderTest.prepareRequest(operation);

            // then
            expect(fetchSpy).toHaveBeenCalledTimes(0);
            expect(operation.setContext).toHaveBeenCalledTimes(1);
            expect(operation.setContext).toHaveBeenCalledWith({
                headers: { authorization: `Bearer ${accessTokenFromMemory}` },
            });
            done();
        });

        it('should refresh token when access token from memory has expired', async (done) => {
            // given
            const accessTokenFromMemory = createSampleExpiredToken();
            const accessTokenFromRefreshOperation = createSampleValidToken();
            fetchSpy.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ accessToken: accessTokenFromRefreshOperation }),
            });
            const operation = createSampleOperation();

            // when
            serviceUnderTest.setAccessToken(accessTokenFromMemory);
            await serviceUnderTest.prepareRequest(operation);

            // then
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledWith(expect.stringMatching(/^.*\/refresh_token$/), {
                method: 'POST',
                credentials: 'include',
            });
            expect(operation.setContext).toHaveBeenCalledTimes(1);
            expect(operation.setContext).toHaveBeenCalledWith({
                headers: { authorization: `Bearer ${accessTokenFromRefreshOperation}` },
            });
            done();
        });

        it('should refresh token when there is no available access token in memory', async (done) => {
            // given
            const accessTokenFromRefreshOperation = createSampleValidToken();
            fetchSpy.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ accessToken: accessTokenFromRefreshOperation }),
            });
            const operation = createSampleOperation();

            // when
            await serviceUnderTest.prepareRequest(operation);

            // then
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(operation.setContext).toHaveBeenCalledTimes(1);
            expect(operation.setContext).toHaveBeenCalledWith({
                headers: { authorization: `Bearer ${accessTokenFromRefreshOperation}` },
            });
            done();
        });

        it('should throw an error when server is not accessible', async (done) => {
            // given
            fetchSpy.mockRejectedValue(new Error('network error'));
            const operation = createSampleOperation();

            try {
                // when
                await serviceUnderTest.prepareRequest(operation);
            } catch (error) {
                // then
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty('message', 'network error');
                expect(fetchSpy).toHaveBeenCalledTimes(1);
                expect(operation.setContext).toHaveBeenCalledTimes(0);
                done();
            }
        });

        it('should throw an error when the refresh operation returns an error', async (done) => {
            // given
            fetchSpy.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ errorMessage: 'invalid refresh token' }),
            });
            const operation = createSampleOperation();

            try {
                // when
                await serviceUnderTest.prepareRequest(operation);
            } catch (error) {
                // then
                expect(error).toBeInstanceOf(UnauthorizedError);
                expect(error).toHaveProperty('message', 'invalid refresh token');
                expect(fetchSpy).toHaveBeenCalledTimes(1);
                expect(operation.setContext).toHaveBeenCalledTimes(0);
                done();
            }
        });

    });

});
