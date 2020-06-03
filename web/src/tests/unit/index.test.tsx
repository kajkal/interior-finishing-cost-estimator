import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';

import { MockServiceWorker } from '../__mocks__/other/serviceWorker';


jest.mock('../../code/components/providers/apollo/ApolloContextProvider', () => ({
    ApolloContextProvider: (props: any) => <MockedProvider>{props.children}</MockedProvider>,
}));
jest.mock('../../code/components/providers/i18n/I18nContextProvider', () => ({
    I18nContextProvider: (props: any) => <>{props.children}</>,
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
        expect.assertions(3);

        // given/when
        await act(async () => {
            await import('../../index');
        });

        // then
        // verify if app is present in DOM
        expect(screen.getByText('Mock App')).toBeInTheDocument();

        // verify if service worker was unregistered
        expect(MockServiceWorker.unregister).toHaveBeenCalledTimes(1);
        expect(MockServiceWorker.register).toHaveBeenCalledTimes(0);
    });

});
