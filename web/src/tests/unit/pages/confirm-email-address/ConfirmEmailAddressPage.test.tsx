import * as React from 'react';
import { sign } from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { createMemoryHistory } from 'history';
import { MockedResponse } from '@apollo/react-testing';
import { render, RenderResult, waitFor } from '@testing-library/react';

import { PageContextMocks, PageMockContextProvider } from '../../../__utils__/PageMockContextProvider';
import { ApolloClientSpiesManager } from '../../../__utils__/spies-managers/ApolloClientSpiesManager';
import { MockSnackbarContextData } from '../../../__utils__/mocks/MockSnackbarProvider';

import { ConfirmEmailAddressPage } from '../../../../code/components/pages/confirm-email-address/ConfirmEmailAddressPage';
import { ConfirmEmailAddressDocument } from '../../../../graphql/generated-types';
import { routes } from '../../../../code/config/routes';


describe('ConfirmEmailAddressPage component', () => {

    beforeEach(() => {
        ApolloClientSpiesManager.setupSpies();
    });

    function renderConfirmEmailAddressPageInMockContext(mocks?: PageContextMocks): RenderResult {
        return render(
            <PageMockContextProvider mocks={mocks}>
                <ConfirmEmailAddressPage />
            </PageMockContextProvider>,
        );
    }

    function createSampleValidToken() {
        return sign({ sub: 'userId' }, '_');
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ConfirmEmailAddressDocument,
                variables: { token: createSampleValidToken() },
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
                variables: { token: createSampleValidToken() },
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
                variables: { token: createSampleValidToken() },
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
                variables: { token: createSampleValidToken() },
            },
            error: new Error('network error'),
        }),
    };

    describe('invalid token search param', () => {

        const manipulatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdwIiOiJhIn0._'; // will throw error on decode
        const paths = [ '/', '/?notToken=value', '/?token=invalid_token', `/?token=${manipulatedToken}` ];

        paths.forEach((path: string) => {
            it(`should redirect to login page without creating new mutation for '${path}'`, () => {
                const history = createMemoryHistory({ initialEntries: [ path ] });
                const mockSnackbars = { errorSnackbar: jest.fn() };
                renderConfirmEmailAddressPageInMockContext({ history, mockSnackbars });

                // verify if navigation occurred
                expect(history.location.pathname).toMatch(routes.login());

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
        const mockResponses = [ mockResponse ];
        const { queryByRole } = renderConfirmEmailAddressPageInMockContext({ history, mockResponses, mockSnackbars });

        // verify if progressbar is visible
        expect(queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

        // wait for progress bar to disappear
        await waitFor(() => expect(queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if navigation occurred
        expect(history.location.pathname).toMatch(routes.login());

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
