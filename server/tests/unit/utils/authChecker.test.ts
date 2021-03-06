import 'reflect-metadata';

import { ResolverData } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { MockLogger } from '../../__mocks__/utils/logger';

import { AuthServiceSpy } from '../../__utils__/spies/services/auth/AuthServiceSpy';

import { AccessTokenPayload } from '../../../src/types/token/AccessTokenPayload';
import { authChecker } from '../../../src/utils/authChecker';


describe('authChecker function', () => {

    beforeEach(() => {
        AuthServiceSpy.setupSpiesAndMockImplementations();
        MockLogger.setupMocks();
    });

    it('should return true and add JWT payload to context', () => {
        // given
        const samplePayload = { sub: 'TEST_USER_ID' } as AccessTokenPayload;
        const sampleResolverData = { context: { req: 'REQ_TEST_VALUE' } } as unknown as ResolverData<ExpressContext>;
        AuthServiceSpy.verifyAccessToken.mockReturnValue(samplePayload);

        // when
        const result = authChecker(sampleResolverData, []);

        // then
        expect(result).toBe(true);
        expect(AuthServiceSpy.verifyAccessToken).toHaveBeenCalledTimes(1);
        expect(AuthServiceSpy.verifyAccessToken).toHaveBeenCalledWith(sampleResolverData.context.req);
        expect(sampleResolverData.context).toEqual({
            req: 'REQ_TEST_VALUE',
            jwtPayload: samplePayload, // context was mutated, access token payload was added
        });
    });

    it('should throw error when request is not properly authenticated', () => {
        // given
        const sampleResolverData = {
            context: { req: 'REQ_TEST_VALUE' },
            info: 'INFO_TEST_VALUE',
        } as unknown as ResolverData<ExpressContext>;
        AuthServiceSpy.verifyAccessToken.mockImplementation(() => {
            throw new Error();
        });

        // when/then
        expect(() => authChecker(sampleResolverData, [])).toThrow(new AuthenticationError('INVALID_ACCESS_TOKEN'));
        expect(AuthServiceSpy.verifyAccessToken).toHaveBeenCalledTimes(1);
        expect(AuthServiceSpy.verifyAccessToken).toHaveBeenCalledWith(sampleResolverData.context.req);
        expect(sampleResolverData.context).toEqual({ req: 'REQ_TEST_VALUE' });
        expect(MockLogger.warn).toHaveBeenCalledTimes(1);
        expect(MockLogger.warn).toHaveBeenCalledWith({
            message: 'invalid token',
            info: 'INFO_TEST_VALUE',
        });
    });

});
