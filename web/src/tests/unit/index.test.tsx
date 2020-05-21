import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/react';

import { MockApolloClientConstructor } from '../__mocks__/libraries/apollo.boost';
import { MockServiceWorker } from '../__mocks__/other/serviceWorker';


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
        MockApolloClientConstructor.mockReset();
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

    it('should create ApolloClient with correct config', async () => {
        expect.assertions(2);

        // given/when
        await act(async () => {
            await import('../../index');
        });

        // then
        expect(MockApolloClientConstructor).toHaveBeenCalledTimes(1);
        expect(MockApolloClientConstructor).toHaveBeenCalledWith({
            uri: 'http://localhost:4000/graphql',
            credentials: 'include',
            request: expect.any(Function),
        });
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
