import React from 'react';
import { render, waitFor } from '@testing-library/react';

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

    it('should logout on mount and trigger session logout event', async (done) => {
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ] });

        // verify if session logout event was triggered
        await waitFor(() => expect(MockSessionChannel.publishLogoutSessionAction).toHaveBeenCalledTimes(1));
        done();
    });

    it('should display notification about network error', async (done) => {
        const mockResponse = mockResponseGenerator.networkError();
        const mockSnackbars = { errorSnackbar: jest.fn() };
        renderInMockContext({ mockResponses: [ mockResponse ], mockSnackbars });

        // verify if error alert was displayed
        await waitFor(() => expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1));
        expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:error.networkError');

        // verify if session logout event was not triggered
        expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(0);
        done();
    });

});
