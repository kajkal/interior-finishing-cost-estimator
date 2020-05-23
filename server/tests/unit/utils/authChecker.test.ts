import { ResolverData } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { MockLogger } from '../../__mocks__/utils/logger';

import { AuthServiceSpiesManager } from '../../__utils__/spies-managers/AuthServiceSpiesManager';

import { AccessTokenPayload } from '../../../src/types/token/AccessTokenPayload';
import { authChecker } from '../../../src/utils/authChecker';


describe('authChecker function', () => {

    beforeEach(() => {
        AuthServiceSpiesManager.setupSpiesAndMockImplementations();
        MockLogger.setupMocks();
    });

    it('should return true and add JWT payload to context', () => {
        // given
        const samplePayload = { sub: 'TEST_USER_ID' } as AccessTokenPayload;
        const sampleContext = { req: 'REQ_TEST_VALUE' };
        const sampleResolverData = {
            context: sampleContext,
        } as unknown as ResolverData<ExpressContext>;
        AuthServiceSpiesManager.verifyAccessToken.mockReturnValue(samplePayload);

        // when
        const result = authChecker(sampleResolverData, []);

        // then
        expect(result).toBe(true);
        expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledTimes(1);
        expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledWith(sampleResolverData.context.req);
        expect(sampleContext).toEqual({
            req: 'REQ_TEST_VALUE',
            jwtPayload: samplePayload, // context was mutated
        });
    });

    it('should throw error when request is not properly authenticated', () => {
        // given
        AuthServiceSpiesManager.verifyAccessToken.mockImplementation(() => {
            throw new Error();
        });
        const sampleContext = { req: 'REQ_TEST_VALUE' };
        const sampleResolverData = {
            context: sampleContext,
            info: 'INFO_TEST_VALUE',
        } as unknown as ResolverData<ExpressContext>;

        // when/then
        expect(() => authChecker(sampleResolverData, [])).toThrow(new AuthenticationError('INVALID_ACCESS_TOKEN'));
        expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledTimes(1);
        expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledWith(sampleResolverData.context.req);
        expect(sampleContext).toEqual({ req: 'REQ_TEST_VALUE' });
        expect(MockLogger.warn).toHaveBeenCalledTimes(1);
        expect(MockLogger.warn).toHaveBeenCalledWith({
            message: 'invalid token',
            info: 'INFO_TEST_VALUE',
        });
    });

});
