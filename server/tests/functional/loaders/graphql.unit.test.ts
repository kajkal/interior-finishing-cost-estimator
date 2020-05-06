import { Container } from 'typedi';
import { EntityManager, RequestContext } from 'mikro-orm';
import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express/src/ApolloServer';

import { MockApolloServer, MockApolloServerConstructor } from '../../__mocks__/libraries/apollo-server-express';
import { MockExpress, MockExpressFunction } from '../../__mocks__/libraries/express';
import { LoggerMockManager } from '../../__mocks__/utils/LoggerMockManager';

import { createGraphQLServer } from '../../../src/loaders/graphql';


describe('graphql loader', () => {

    const MockEntityManager = 'ENTITY_MANAGER_TEST_VALUE';

    beforeAll(() => {
        Container.set(EntityManager, MockEntityManager);
    });

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

    it('should create ApolloServer with correct settings', async () => {
        expect.assertions(16);

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
        expect(MockExpress.use).toHaveBeenCalledTimes(2);
        expect(MockExpress.use).toHaveBeenNthCalledWith(1, expect.any(Function));
        expect(MockExpress.use).toHaveBeenNthCalledWith(2, expect.any(Function));

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

        // test MicroORM create context function
        const microOrmCreateReqContextSpy = jest.spyOn(RequestContext, 'create').mockReturnValueOnce(undefined);
        const microOrmCreateReqContextFn = MockExpress.use.mock.calls[ 1 ][ 0 ];
        microOrmCreateReqContextFn('REQ', 'RES', 'NEXT_FN_TEST_VALUE');
        expect(microOrmCreateReqContextSpy).toHaveBeenCalledTimes(1);
        expect(microOrmCreateReqContextSpy).toHaveBeenCalledWith(MockEntityManager, 'NEXT_FN_TEST_VALUE');

    });

});
