import { ExpressContext } from 'apollo-server-express/src/ApolloServer';

import { MockApolloServer, MockApolloServerConstructor } from '../../__mocks__/libraries/apollo-server-express';

import { createApolloServer } from '../../../src/loaders/apollo';


describe('apollo loader', () => {

    afterEach(() => {
        MockApolloServerConstructor.mockClear();
        MockApolloServerConstructor.mockReturnValue(MockApolloServer);
    });

    it('should create Apollo server with correct settings', async () => {
        expect.assertions(4);

        // given/when
        await createApolloServer();

        // then
        expect(MockApolloServerConstructor).toHaveBeenCalledTimes(1);
        expect(MockApolloServerConstructor).toHaveBeenCalledWith({
            schema: expect.any(Object),
            context: expect.any(Function),
        });

        // test apollo server context generator:
        const apolloServerContextGenerator = MockApolloServerConstructor.mock.calls[ 0 ][ 0 ].context;
        expect(apolloServerContextGenerator!).toBeInstanceOf(Function);
        const expressContext = {};
        const apolloContext = apolloServerContextGenerator(expressContext as ExpressContext);
        expect(expressContext).toBe(apolloContext);
    });

});
