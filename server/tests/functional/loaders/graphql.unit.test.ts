import { MockApolloServer, MockApolloServerConstructor } from '../../__mocks__/libraries/apollo-server-express';
import { MockExpress, MockExpressFunction } from '../../__mocks__/libraries/express';
import { LoggerMockManager } from '../../__mocks__/utils/LoggerMockManager';

import { createGraphQLServer } from '../../../src/loaders/graphql';
import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express/src/ApolloServer';


describe('graphql loader', () => {

    beforeEach(() => {
        LoggerMockManager.setupMocks();
    });

    afterEach(() => {
        MockExpressFunction.mockClear();
        MockExpress.use.mockClear();
        MockExpress.listen.mockClear();

        MockApolloServerConstructor.mockClear();
        MockApolloServerConstructor.mockReturnValue(MockApolloServer);
        MockApolloServer.applyMiddleware.mockClear();
    });

    it('should create ApolloServer', async () => {
        expect.assertions(13);

        // when
        let apolloServerContextGenerator: ContextFunction<ExpressContext, ExpressContext>;
        MockApolloServerConstructor.mockImplementation((config) => {
            apolloServerContextGenerator = config.context;
            return MockApolloServer;
        });
        MockExpress.listen.mockImplementation((port, callback) => {
            callback();
        });

        // when
        await createGraphQLServer();

        // then
        expect(MockApolloServerConstructor).toHaveBeenCalledTimes(1);
        expect(MockApolloServerConstructor).toHaveBeenCalledWith({
            schema: expect.any(Object),
            context: expect.any(Function),
        });

        expect(MockExpressFunction).toHaveBeenCalledTimes(1);
        expect(MockExpress.use).toHaveBeenCalledTimes(1);
        expect(MockExpress.use).toHaveBeenCalledWith(expect.any(Function));

        expect(MockApolloServer.applyMiddleware).toHaveBeenCalledTimes(1);
        expect(MockApolloServer.applyMiddleware).toHaveBeenCalledWith({
            app: expect.any(Object),
            cors: false,
        });

        expect(MockExpress.listen).toHaveBeenCalledTimes(1);
        expect(MockExpress.listen).toHaveBeenCalledWith(4005, expect.any(Function));

        expect(LoggerMockManager.info).toHaveBeenCalledTimes(1);
        expect(LoggerMockManager.info).toHaveBeenCalledWith(expect.stringMatching(/Server started/));

        // test apollo server context generator;
        expect(apolloServerContextGenerator!).toBeInstanceOf(Function);
        const expressContext = {};
        const apolloContext = apolloServerContextGenerator!(expressContext as ExpressContext);
        expect(expressContext).toBe(apolloContext);
    });

});
