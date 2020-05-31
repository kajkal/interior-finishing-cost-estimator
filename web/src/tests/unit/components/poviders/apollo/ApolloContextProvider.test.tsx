import React from 'react';
import { render } from '@testing-library/react';

import { MockApolloClient, MockApolloInMemoryCache } from '../../../../__mocks__/libraries/apollo.boost';

import { LocalStateDocument } from '../../../../../graphql/generated-types';


describe('ApolloContextProvider component', () => {

    beforeEach(async () => {
        MockApolloClient.setupMocks();
        MockApolloInMemoryCache.setupMocks();
    });

    afterEach(() => {
        jest.resetModules();
    });

    function SampleChildComponent() {
        return <span>sample component</span>;
    }

    it('should initialize Apollo client correctly', async (done) => {
        const { ApolloContextProvider } = await import('../../../../../code/components/providers/apollo/ApolloContextProvider');
        const { getByText, debug } = render(
            <ApolloContextProvider>
                <SampleChildComponent />
            </ApolloContextProvider>,
        );

        debug();

        expect(getByText('sample component')).toBeInTheDocument();

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
        done();
    });

});
