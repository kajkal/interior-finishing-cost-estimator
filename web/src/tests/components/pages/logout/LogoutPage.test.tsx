import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { MockSessionChannel } from '../../../__mocks__/code/MockSessionChannel';

import { LogoutDocument, LogoutMutation } from '../../../../graphql/generated-types';
import { LogoutPage } from '../../../../code/components/pages/logout/LogoutPage';


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
                } as LogoutMutation,
            },
        }),
    };

    it('should logout on mount and trigger session logout event', async () => {
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ] });

        // verify if session logout event was triggered
        await waitFor(() => expect(MockSessionChannel.publishLogoutSessionAction).toHaveBeenCalledTimes(1));
    });

});
