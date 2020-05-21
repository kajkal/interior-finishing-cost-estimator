import { Container } from 'typedi';
import { ApolloServer } from 'apollo-server-express';
import { EntityManager, RequestContext } from 'mikro-orm';

import { MockExpress, MockExpressFunction } from '../../__mocks__/libraries/express';
import { MockApolloServer } from '../../__mocks__/libraries/apollo-server-express';
import { MockLogger } from '../../__mocks__/utils/logger';

import { createExpressServer } from '../../../src/loaders/express';


describe('express loader', () => {

    const MockEntityManager = 'ENTITY_MANAGER_TEST_VALUE';

    beforeAll(() => {
        Container.set(EntityManager, MockEntityManager);
    });

    beforeEach(() => {
        MockLogger.setupMocks();
    });

    afterEach(() => {
        MockExpressFunction.mockClear();
        MockExpress.use.mockClear();
        MockExpress.post.mockClear();
        MockExpress.listen.mockClear();

        MockApolloServer.applyMiddleware.mockClear();
    });

    it('should create Express server with correct settings', async () => {
        expect.assertions(16);

        // given
        MockExpress.listen.mockImplementation((port, callback) => {
            callback();
        });

        // when
        await createExpressServer(MockApolloServer as unknown as ApolloServer);

        // then
        expect(MockExpressFunction).toHaveBeenCalledTimes(1);
        expect(MockExpress.use).toHaveBeenCalledTimes(4);
        expect(MockExpress.use).toHaveBeenNthCalledWith(1, expect.any(Function));
        expect(MockExpress.use).toHaveBeenNthCalledWith(2, expect.any(Function));
        expect(MockExpress.use).toHaveBeenNthCalledWith(3, expect.any(Function));
        expect(MockExpress.use).toHaveBeenNthCalledWith(4, '/', expect.any(Function));
        expect(MockExpress.post).toHaveBeenCalledTimes(1);
        expect(MockExpress.post).toHaveBeenCalledWith('/refresh_token', expect.any(Function));

        expect(MockApolloServer.applyMiddleware).toHaveBeenCalledTimes(1);
        expect(MockApolloServer.applyMiddleware).toHaveBeenCalledWith({
            app: expect.any(Object),
            cors: false,
        });

        expect(MockExpress.listen).toHaveBeenCalledTimes(1);
        expect(MockExpress.listen).toHaveBeenCalledWith(4005, expect.any(Function));

        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith(expect.stringMatching(/Server started/));

        // test MicroORM create context function
        const microOrmCreateReqContextSpy = jest.spyOn(RequestContext, 'create').mockReturnValueOnce(undefined);
        const microOrmCreateReqContextFn = MockExpress.use.mock.calls[ 1 ][ 0 ];
        microOrmCreateReqContextFn('REQ', 'RES', 'NEXT_FN_TEST_VALUE');
        expect(microOrmCreateReqContextSpy).toHaveBeenCalledTimes(1);
        expect(microOrmCreateReqContextSpy).toHaveBeenCalledWith(MockEntityManager, 'NEXT_FN_TEST_VALUE');
    });

});
