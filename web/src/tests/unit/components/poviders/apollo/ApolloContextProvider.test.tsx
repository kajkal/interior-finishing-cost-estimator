import React from 'react';
import { render } from '@testing-library/react';

import { MockApolloClient, MockApolloInMemoryCache } from '../../../../__mocks__/libraries/apollo.boost';

import { LocalStateDocument } from '../../../../../graphql/generated-types';


describe('ApolloContextProvider component', () => {

    // isolated components:
    let ApolloContextProvider: React.FunctionComponent;

    beforeEach(() => {
        MockApolloClient.setupMocks();
        MockApolloInMemoryCache.setupMocks();

        jest.isolateModules(() => {
            ApolloContextProvider = require('../../../../../code/components/providers/apollo/ApolloContextProvider').ApolloContextProvider;
        });
    });

    it('should initialize Apollo client correctly', () => {
        const { getByText } = render(
            <ApolloContextProvider>
                <span>sample child component</span>
            </ApolloContextProvider>,
        );

        expect(getByText('sample child component')).toBeInTheDocument();

        // verify Apollo client creation
        expect(MockApolloClient.constructorFn).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.constructorFn).toHaveBeenCalledWith({
            uri: 'http://localhost:4000/graphql',
            credentials: 'include',
            request: expect.any(Function),
            cache: MockApolloInMemoryCache,
        });

        // verify cache creation
        expect(MockApolloInMemoryCache.constructorFn).toHaveBeenCalledTimes(1);

        // verify if cache data was initialized
        expect(MockApolloInMemoryCache.writeQuery).toHaveBeenCalledTimes(1);
        expect(MockApolloInMemoryCache.writeQuery).toHaveBeenCalledWith({
            query: LocalStateDocument,
            data: {
                localState: {
                    __typename: 'LocalState',
                    accessToken: '',
                },
            },
        });

        // verify if 'on clear store' listener was added
        expect(MockApolloClient.onClearStore).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.onClearStore).toHaveBeenCalledWith(expect.any(Function));

        // verify 'on clear store' listener
        MockApolloClient.simulateClearStore();
        expect(MockApolloInMemoryCache.writeQuery).toHaveBeenCalledTimes(2); // one extra times
    });

});
