import { Container } from 'typedi';
import { ResolverData } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { GraphQLLoggerMockManager } from '../../__mocks__/utils/LoggerMockManager';
import { MockJwtService } from '../../__mocks__/services/MockJwtService';

import { JwtPayload, JwtService } from '../../../src/services/JwtService';
import { authChecker } from '../../../src/utils/authChecker';


describe('authChecker function', () => {

    beforeAll(() => {
        Container.set(JwtService, MockJwtService);
    });

    beforeEach(() => {
        MockJwtService.setupMocks();
        GraphQLLoggerMockManager.setupMocks();
    });

    it('should return true and add JWT payload to context', () => {
        // given
        const samplePayload = { userId: 'TEST_USER_ID' } as JwtPayload;
        const sampleContext = {};
        const sampleResolverData = {
            context: sampleContext,
        } as unknown as ResolverData<ExpressContext>;
        MockJwtService.verify.mockReturnValue(samplePayload);

        // when
        const result = authChecker(sampleResolverData, []);

        // then
        expect(result).toBe(true);
        expect(MockJwtService.verify).toHaveBeenCalledTimes(1);
        expect(MockJwtService.verify).toHaveBeenCalledWith(sampleContext);
        expect(sampleContext).toEqual({
            jwtPayload: samplePayload, // context was mutated
        });
    });

    it('should throw error when request is not properly authenticated', () => {
        // given
        MockJwtService.verify.mockImplementation(() => {
            throw new Error();
        });
        const sampleContext = {};
        const sampleResolverData = {
            context: sampleContext,
            info: 'INFO_TEST_VALUE',
        } as unknown as ResolverData<ExpressContext>;

        // when/then
        expect(() => authChecker(sampleResolverData, [])).toThrow(new AuthenticationError('INVALID_TOKEN'));
        expect(MockJwtService.verify).toHaveBeenCalledTimes(1);
        expect(MockJwtService.verify).toHaveBeenCalledWith(sampleContext);
        expect(sampleContext).toEqual({});
        expect(GraphQLLoggerMockManager.warn).toHaveBeenCalledTimes(1);
        expect(GraphQLLoggerMockManager.warn).toHaveBeenCalledWith({
            message: 'invalid token',
            info: 'INFO_TEST_VALUE',
        });
    });

});
