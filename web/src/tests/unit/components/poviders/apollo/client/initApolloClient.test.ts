import ApolloClient from 'apollo-boost';

import { MockApolloClient } from '../../../../../__mocks__/libraries/apollo.boost';

import { SessionStateDocument } from '../../../../../../graphql/generated-types';
import { ApolloCacheShape } from '../../../../../../code/components/providers/apollo/cache/ApolloCacheShape';


describe('initApolloClient function', () => {

    let functionUnderTest: (initialCacheState: ApolloCacheShape) => ApolloClient<ApolloCacheShape>;

    beforeEach(() => {
        MockApolloClient.setupMocks();

        jest.isolateModules(() => {
            functionUnderTest = require('../../../../../../code/components/providers/apollo/client/initApolloClient').initApolloClient;
        });
    });

    it('should create ApolloClient with given initial cache state', () => {
        functionUnderTest({ sessionState: { accessToken: 'initialAccessTokenValue' } });

        // verify Apollo client creation
        expect(MockApolloClient.constructorFn).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.constructorFn).toHaveBeenCalledWith({
            uri: 'http://localhost:4000/graphql',
            credentials: 'include',
            request: expect.any(Function),
            resolvers: {},
        });

        // verify if cache session data was initialized
        expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.writeQuery).toHaveBeenCalledWith({
            query: SessionStateDocument,
            data: {
                sessionState: {
                    __typename: 'SessionState',
                    accessToken: 'initialAccessTokenValue',
                },
            },
        });

        // verify if 'on clear store' listener was added
        expect(MockApolloClient.onClearStore).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.onClearStore).toHaveBeenCalledWith(expect.any(Function));

        // verify 'on clear store' listener
        MockApolloClient.simulateClearStore();
        expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(2); // one extra times
    });

});
