import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';

import { MockServiceWorker } from '../__mocks__/other/serviceWorker';


jest.mock('../../code/components/providers/apollo/ApolloContextProvider', () => ({
    ApolloContextProvider: (props: any) => <MockedProvider>{props.children}</MockedProvider>,
}));
jest.mock('../../code/App', () => ({
    App: () => <span>Mock App</span>,
}));


describe('index file', () => {

    let rootElement: HTMLDivElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.id = 'root';
        document.body.appendChild(rootElement);

        MockServiceWorker.setupMocks();
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        jest.resetModules();
    });

    it('should render app root inside root element', async () => {
        expect.assertions(1);

        // given
        await act(async () => {
            await import('../../index');
        });

        // when/then
        expect(screen.getByText('Mock App')).toBeInTheDocument();
    });

    it('should unregister service worker', async () => {
        expect.assertions(2);

        // given/when
        await act(async () => {
            await import('../../index');
        });

        // then
        expect(MockServiceWorker.unregister).toHaveBeenCalledTimes(1);
        expect(MockServiceWorker.register).toHaveBeenCalledTimes(0);
    });

});
