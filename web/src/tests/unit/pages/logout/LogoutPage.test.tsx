import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { MockSessionChannel } from '../../../__mocks__/code/MockSessionChannel';

import { LogoutPage } from '../../../../code/components/pages/logout/LogoutPage';
import { LogoutDocument } from '../../../../graphql/generated-types';


describe('LogoutPage component', () => {

    beforeEach(() => {
        MockSessionChannel.setupMocks();
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <LogoutPage />
            </MockContextProvider>,
        );
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: LogoutDocument,
            },
            result: {
                data: {
                    logout: true,
                },
            },
        }),
        networkError: () => ({
            request: {
                query: LogoutDocument,
            },
            error: new Error('network error'),
        }),
    };

    it('should logout on mount and trigger session logout event', async () => {
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ] });

        // verify if session logout event was triggered
        await waitFor(() => expect(MockSessionChannel.publishLogoutSessionAction).toHaveBeenCalledTimes(1));
    });

    it('should display notification about network error', async () => {
        const mockResponse = mockResponseGenerator.networkError();
        renderInMockContext({ mockResponses: [ mockResponse ] });

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('error');
        expect(toast).toHaveTextContent('t:error.networkError');

        // verify if session logout event was not triggered
        expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(0);
    });

});
