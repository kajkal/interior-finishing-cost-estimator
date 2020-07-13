import React from 'react';
import { GraphQLError } from 'graphql';
import { Route, Routes } from 'react-router-dom';
import { JsonWebTokenError } from 'jsonwebtoken';
import { MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { TokenVerifierSpy } from '../../../__utils__/spies-managers/TokenVerifierSpy';

import { ConfirmEmailAddressPage } from '../../../../code/components/pages/confirm-email-address/ConfirmEmailAddressPage';
import { ConfirmEmailAddressDocument } from '../../../../graphql/generated-types';
import { nav } from '../../../../code/config/nav';


describe('ConfirmEmailAddressPage component', () => {

    const validEmailAddressConfirmationToken = 'VALID_TOKEN';

    beforeEach(() => {
        TokenVerifierSpy.setupSpiesAndMockImplementations();
        TokenVerifierSpy.create.mockImplementation((tokenToVerify?: string | null) => {
            switch (tokenToVerify) {
                case validEmailAddressConfirmationToken:
                    return TokenVerifierSpy.validInstance;
                default:
                    throw new JsonWebTokenError('INVALID_TOKEN_PAYLOAD');
            }
        });
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <Routes>
                    <Route path='/'>
                        <ConfirmEmailAddressPage />
                    </Route>
                </Routes>
            </MockContextProvider>,
        );
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ConfirmEmailAddressDocument,
                variables: { token: validEmailAddressConfirmationToken },
            },
            result: {
                data: {
                    confirmEmailAddress: true,
                },
            },
        }),
        emailAddressAlreadyConfirmed: () => ({
            request: {
                query: ConfirmEmailAddressDocument,
                variables: { token: validEmailAddressConfirmationToken },
            },
            result: {
                data: null,
                errors: [
                    { message: 'EMAIL_ADDRESS_ALREADY_CONFIRMED' } as unknown as GraphQLError,
                ],
            },
        }),
        invalidEmailConfirmationToken: () => ({
            request: {
                query: ConfirmEmailAddressDocument,
                variables: { token: validEmailAddressConfirmationToken },
            },
            result: {
                data: null,
                errors: [
                    { message: 'INVALID_EMAIL_ADDRESS_CONFIRMATION_TOKEN' } as unknown as GraphQLError,
                ],
            },
        }),
        networkError: () => ({
            request: {
                query: ConfirmEmailAddressDocument,
                variables: { token: validEmailAddressConfirmationToken },
            },
            error: new Error('network error'),
        }),
    };

    describe('invalid token search param', () => {

        const invalidPaths = [ '/', '/?notToken=value', '/?token=invalid_token' ];

        invalidPaths.forEach((path: string) => {
            it(`should redirect to login page and display alert about invalid token for '${path}'`, async () => {
                renderInMockContext({ initialEntries: [ path ] });

                // verify if navigation occurred
                expect(screen.getByTestId('location')).toHaveTextContent(nav.login());

                // verify if toast is visible
                const toast = await screen.findByTestId('MockToast');
                expect(toast).toHaveClass('error');
                expect(toast).toHaveTextContent('t:emailConfirmationPage.invalidEmailConfirmationToken');
            });
        });

    });

    async function renderAndAwaitMutationResponse(mockResponse: MockedResponse) {
        renderInMockContext({
            mockResponses: [ mockResponse ],
            initialEntries: [ `/?token=${mockResponse.request.variables!.token}` ],
        });

        // verify if progressbar is visible
        expect(screen.queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

        // wait for progress bar to disappear
        await waitFor(() => expect(screen.queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if navigation occurred
        expect(screen.getByTestId('location')).toHaveTextContent(nav.login());
    }

    it('should display notification about successful email address confirmation', async () => {
        const mockResponse = mockResponseGenerator.success();
        await renderAndAwaitMutationResponse(mockResponse);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('success');
        expect(toast).toHaveTextContent('t:emailConfirmationPage.emailConfirmedSuccessfully');
    });

    it('should display notification about email address already confirmed', async () => {
        const mockResponse = mockResponseGenerator.emailAddressAlreadyConfirmed();
        await renderAndAwaitMutationResponse(mockResponse);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('info');
        expect(toast).toHaveTextContent('t:emailConfirmationPage.emailAlreadyConfirmed');
    });

    it('should display notification about invalid email confirmation token', async () => {
        const mockResponse = mockResponseGenerator.invalidEmailConfirmationToken();
        await renderAndAwaitMutationResponse(mockResponse);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('error');
        expect(toast).toHaveTextContent('t:emailConfirmationPage.invalidEmailConfirmationToken');
    });

    it('should display notification about network error', async () => {
        const mockResponse = mockResponseGenerator.networkError();
        await renderAndAwaitMutationResponse(mockResponse);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('error');
        expect(toast).toHaveTextContent('t:error.networkError');
    });

});
