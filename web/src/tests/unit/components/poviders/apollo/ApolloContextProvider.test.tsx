import React from 'react';
import { render, screen } from '@testing-library/react';
import { useApolloClient } from '@apollo/react-hooks';

import { MockApolloClient, MockApolloInMemoryCache } from '../../../../__mocks__/libraries/apollo.boost';

import { ApolloContextProvider } from '../../../../../code/components/providers/apollo/ApolloContextProvider';
import * as initApolloClientModule from '../../../../../code/components/providers/apollo/client/initApolloClient';


describe('ApolloContextProvider component', () => {

    let initApolloClientSpy: jest.SpiedFunction<typeof initApolloClientModule.initApolloClient>;

    beforeEach(() => {
        MockApolloClient.setupMocks();
        MockApolloInMemoryCache.setupMocks();

        // @ts-ignore
        initApolloClientSpy = jest.spyOn(initApolloClientModule, 'initApolloClient').mockReturnValue(MockApolloClient);
    });

    it('should provide Apollo client', () => {
        let clientFromContext;

        function SampleApolloClientConsumer() {
            clientFromContext = useApolloClient();
            return <div data-testid='SampleApolloClientConsumer' />;
        }

        render(
            <ApolloContextProvider>
                <SampleApolloClientConsumer/>
            </ApolloContextProvider>,
        );

        // verify if was called
        expect(initApolloClientSpy).toHaveBeenCalledTimes(1);
        expect(initApolloClientSpy).toHaveBeenCalledWith({ sessionState: { accessToken: '' } });

        // verify if renders children
        expect(screen.getByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

        // verify if provide Apollo client
        expect(clientFromContext).toBeDefined();
        expect(clientFromContext).toBe(MockApolloClient);
    });

});
