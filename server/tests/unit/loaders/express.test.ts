import { Container } from 'typedi';
import { ApolloServer } from 'apollo-server-express';
import { EntityManager } from 'mikro-orm';

import { MockExpress, MockExpressFunction } from '../../__mocks__/libraries/express';
import { MockApolloServer } from '../../__mocks__/libraries/apollo-server-express';
import { MockLogger } from '../../__mocks__/utils/logger';

import { createExpressServer } from '../../../src/loaders/express';


describe('express loader', () => {

    const MockEntityManager = {
        fork: jest.fn(),
    };

    beforeAll(() => {
        Container.set(EntityManager, MockEntityManager);
    });

    beforeEach(() => {
        MockEntityManager.fork.mockClear();
        MockLogger.setupMocks();
    });

    afterEach(() => {
        MockExpressFunction.mockClear();
        MockExpress.use.mockClear();
        MockExpress.post.mockClear();
        MockExpress.listen.mockClear();

        MockApolloServer.applyMiddleware.mockClear();
    });

    it('should create Express server with correct settings', async (done) => {
        // given
        const mockServer = { address: jest.fn().mockReturnValue('SERVER_ADDRESS_TEST_VALUE') };
        MockExpress.listen.mockImplementation((port, callback) => {
            setTimeout(callback, 0);
            return mockServer;
        });

        // given/when
        const server = await createExpressServer(MockApolloServer as unknown as ApolloServer);

        // then
        expect(server).toBe(mockServer);
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
        expect(MockLogger.info).toHaveBeenCalledWith('Server started', 'SERVER_ADDRESS_TEST_VALUE');

        // test MicroORM create context function
        const microOrmCreateReqContextFn = MockExpress.use.mock.calls[ 1 ][ 0 ];
        const mockNextFn = jest.fn();
        microOrmCreateReqContextFn('REQ', 'RES', mockNextFn);
        expect(MockEntityManager.fork).toHaveBeenCalledTimes(1);
        expect(MockEntityManager.fork).toHaveBeenCalledWith(true, true);
        expect(mockNextFn).toHaveBeenCalledTimes(1);
        done();
    });

});
