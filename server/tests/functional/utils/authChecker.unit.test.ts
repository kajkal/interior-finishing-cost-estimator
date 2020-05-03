import { ResolverData } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { GraphQLLoggerMockManager } from '../../__mocks__/utils/LoggerMockManager';
import { JwtServiceSpiesManager } from '../../__mocks__/services/JwtServiceSpiesManager';

import { JwtPayload } from '../../../src/services/JwtService';
import { authChecker } from '../../../src/utils/authChecker';


describe('authChecker function', () => {

    beforeEach(() => {
        JwtServiceSpiesManager.setupSpies();
        GraphQLLoggerMockManager.setupMocks();
    });

    afterEach(() => {
        JwtServiceSpiesManager.restoreSpies();
    });

    it('should return true and add JWT payload to context', () => {
        // given
        const samplePayload = { userId: 'TEST_USER_ID' } as JwtPayload;
        const sampleContext = {};
        const sampleResolverData = {
            context: sampleContext,
        } as unknown as ResolverData<ExpressContext>;
        JwtServiceSpiesManager.verify.mockReturnValue(samplePayload);

        // when
        const result = authChecker(sampleResolverData, []);

        // then
        expect(result).toBe(true);
        expect(JwtServiceSpiesManager.verify).toHaveBeenCalledTimes(1);
        expect(JwtServiceSpiesManager.verify).toHaveBeenCalledWith(sampleContext);
        expect(sampleContext).toEqual({
            jwtPayload: samplePayload, // context was mutated
        });
    });

    it('should throw error when request is not properly authenticated', () => {
        // given
        JwtServiceSpiesManager.verify.mockImplementation(() => {
            throw new Error();
        });
        const sampleContext = {};
        const sampleResolverData = {
            context: sampleContext,
            info: 'INFO_TEST_VALUE',
        } as unknown as ResolverData<ExpressContext>;

        // when/then
        expect(() => authChecker(sampleResolverData, [])).toThrow(new AuthenticationError('INVALID_TOKEN'));
        expect(JwtServiceSpiesManager.verify).toHaveBeenCalledTimes(1);
        expect(JwtServiceSpiesManager.verify).toHaveBeenCalledWith(sampleContext);
        expect(sampleContext).toEqual({});
        expect(GraphQLLoggerMockManager.warn).toHaveBeenCalledTimes(1);
        expect(GraphQLLoggerMockManager.warn).toHaveBeenCalledWith({
            message: 'invalid token',
            info: 'INFO_TEST_VALUE',
        });
    });

});
