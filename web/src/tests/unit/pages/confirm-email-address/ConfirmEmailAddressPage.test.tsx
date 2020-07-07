import React from 'react';
import { GraphQLError } from 'graphql';
import { Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JsonWebTokenError } from 'jsonwebtoken';
import { MockedResponse } from '@apollo/react-testing';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { ApolloClientSpiesManager } from '../../../__utils__/spies-managers/ApolloClientSpiesManager';
import { MockSnackbarContextData } from '../../../__utils__/mocks/MockSnackbarProvider';
import { TokenVerifierSpy } from '../../../__utils__/spies-managers/TokenVerifierSpy';

import { ConfirmEmailAddressPage } from '../../../../code/components/pages/confirm-email-address/ConfirmEmailAddressPage';
import { ConfirmEmailAddressDocument } from '../../../../graphql/generated-types';
import { routes } from '../../../../code/config/routes';


describe('ConfirmEmailAddressPage component', () => {

    const validEmailAddressConfirmationToken = 'VALID_TOKEN';

    beforeEach(() => {
        ApolloClientSpiesManager.setupSpies();
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
                <Route path='/' exact>
                    <ConfirmEmailAddressPage />
                </Route>
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
            it(`should redirect to login page and display alert about invalid token for '${path}'`, () => {
                const history = createMemoryHistory({ initialEntries: [ path ] });
                const mockSnackbars = { errorSnackbar: jest.fn() };
                renderInMockContext({ history, mockSnackbars });

                // verify if navigation occurred
                expect(history.location.pathname).toBe(routes.login());

                // verify if mutation was not created
                expect(ApolloClientSpiesManager.mutate).toHaveBeenCalledTimes(0);

                // verify if error alert has been displayed
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:emailConfirmationPage.invalidEmailConfirmationToken');
            });
        });

    });

    async function renderAndAwaitMutationResponse(mockResponse: MockedResponse, mockSnackbars: MockSnackbarContextData) {
        const history = createMemoryHistory({ initialEntries: [ `/?token=${mockResponse.request.variables!.token}` ] });
        renderInMockContext({ history, mockResponses: [ mockResponse ], mockSnackbars });

        // verify if progressbar is visible
        expect(screen.queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

        // wait for progress bar to disappear
        await waitFor(() => expect(screen.queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if navigation occurred
        expect(history.location.pathname).toBe(routes.login());

        // verify if mutation was created
        expect(ApolloClientSpiesManager.mutate).toHaveBeenCalledTimes(1);
    }

    it('should display notification about successful email address confirmation', async (done) => {
        const mockResponse = mockResponseGenerator.success();
        const mockSnackbars = { successSnackbar: jest.fn() };
        await renderAndAwaitMutationResponse(mockResponse, mockSnackbars);

        // verify if success alert was displayed
        expect(mockSnackbars.successSnackbar).toHaveBeenCalledTimes(1);
        expect(mockSnackbars.successSnackbar).toHaveBeenCalledWith('t:emailConfirmationPage.emailConfirmedSuccessfully');
        done();
    });

    it('should display notification about email address already confirmed', async (done) => {
        const mockResponse = mockResponseGenerator.emailAddressAlreadyConfirmed();
        const mockSnackbars = { infoSnackbar: jest.fn() };
        await renderAndAwaitMutationResponse(mockResponse, mockSnackbars);

        // verify if info alert was displayed
        expect(mockSnackbars.infoSnackbar).toHaveBeenCalledTimes(1);
        expect(mockSnackbars.infoSnackbar).toHaveBeenCalledWith('t:emailConfirmationPage.emailAlreadyConfirmed');
        done();
    });

    it('should display notification about invalid email confirmation token', async (done) => {
        const mockResponse = mockResponseGenerator.invalidEmailConfirmationToken();
        const mockSnackbars = { errorSnackbar: jest.fn() };
        await renderAndAwaitMutationResponse(mockResponse, mockSnackbars);

        // verify if error alert has been displayed
        expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
        expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:emailConfirmationPage.invalidEmailConfirmationToken');
        done();
    });

    it('should display notification about network error', async (done) => {
        const mockResponse = mockResponseGenerator.networkError();
        const mockSnackbars = { errorSnackbar: jest.fn() };
        await renderAndAwaitMutationResponse(mockResponse, mockSnackbars);

        // verify if error alert was displayed
        expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
        expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:error.networkError');
        done();
    });

});
