import * as React from 'react';
import { GraphQLError } from 'graphql';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { MockSnackbarContextData, MockSnackbarProvider } from '../../../__utils__/mocks/MockSnackbarProvider';
import { ApolloCacheSpiesManager } from '../../../__utils__/spies-managers/ApolloCacheSpiesManager';
import { AuthServiceSpiesManager } from '../../../__utils__/spies-managers/AuthServiceSpiesManager';
import { changeInputValue } from '../../../__utils__/changeInputValue';
import { generator } from '../../../__utils__/generator';

import { LoginDocument, MeDocument } from '../../../../graphql/generated-types';
import { LoginPage } from '../../../../code/components/pages/login/LoginPage';
import { routes } from '../../../../code/config/routes';
import { InputValidationHelper } from '../../../__utils__/InputValidationHelper';


describe('LoginPage component', () => {

    beforeEach(() => {
        ApolloCacheSpiesManager.setupSpies();
        AuthServiceSpiesManager.setupSpies();
    });

    interface LoginPageRenderOptions {
        history?: MemoryHistory;
        mocks?: ReadonlyArray<MockedResponse>;
        snackbarMocks?: MockSnackbarContextData;
    }

    interface LoginPageElements {
        emailInput: HTMLInputElement;
        passwordInput: HTMLInputElement;
        submitButton: HTMLButtonElement;
        forgotPasswordPageLink: HTMLAnchorElement;
        signupPageLink: HTMLAnchorElement;
    }

    type LoginPageRenderResult = [ LoginPageElements, RenderResult ];

    function renderLoginPageWithContext(options: LoginPageRenderOptions): LoginPageRenderResult {
        const { history = createMemoryHistory(), mocks = [], snackbarMocks } = options;
        const renderResult = render(
            <MockedProvider mocks={mocks}>
                <Router history={history}>
                    <MockSnackbarProvider mocks={snackbarMocks}>
                        <LoginPage />
                    </MockSnackbarProvider>
                </Router>
            </MockedProvider>,
        );

        return [ {
            emailInput: renderResult.getByLabelText('Email address', { selector: 'input' }) as HTMLInputElement,
            passwordInput: renderResult.getByLabelText('Password', { selector: 'input' }) as HTMLInputElement,
            submitButton: renderResult.getByRole('button', { name: 'Log in' }) as HTMLButtonElement,
            forgotPasswordPageLink: renderResult.getByText(/forgot password/i, { selector: 'a' }) as HTMLAnchorElement,
            signupPageLink: renderResult.getByText(/sign up/i, { selector: 'a' }) as HTMLAnchorElement,
        }, renderResult ];
    }

    it('should navigate to new page on \'forgot password\' link click', () => {
        const history = createMemoryHistory();
        const [ { forgotPasswordPageLink } ] = renderLoginPageWithContext({ history });

        fireEvent.click(forgotPasswordPageLink);

        expect(history.location.pathname).toMatch(routes.forgotPassword());
    });

    it('should navigate to new page on \'sign up\' link click', () => {
        const history = createMemoryHistory();
        const [ { signupPageLink } ] = renderLoginPageWithContext({ history });

        fireEvent.click(signupPageLink);

        expect(history.location.pathname).toMatch(routes.signup());
    });

    describe('log in form', () => {

        const loginSuccessMock = {
            request: {
                query: LoginDocument,
                variables: {
                    data: {
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
            },
            result: {
                data: {
                    login: {
                        accessToken: 'ACCESS_TOKEN_TEST_VALUE',
                        user: {
                            name: '',
                            email: '',
                            products: [],
                            projects: [],
                            offers: [],
                            '__typename': 'User',
                        },
                        '__typename': 'InitialData',
                    },
                },
            },
        };

        const loginBadCredentialsMock = {
            request: {
                query: LoginDocument,
                variables: {
                    data: {
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
            },
            result: {
                data: null,
                errors: [
                    { message: 'BAD_CREDENTIALS' } as unknown as GraphQLError,
                ],
            },
        };

        const loginNetworkErrorMock = {
            request: {
                query: LoginDocument,
                variables: {
                    data: {
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
            },
            error: new Error('network error'),
        };

        async function fillAndSubmitForm(elements: LoginPageElements, mock: MockedResponse) {
            await changeInputValue(elements.emailInput, mock.request.variables!.data.email);
            await changeInputValue(elements.passwordInput, mock.request.variables!.data.password);
            fireEvent.click(elements.submitButton);
        }

        describe('validation', () => {

            it('should validate email input value', async (done) => {
                const [ { emailInput } ] = renderLoginPageWithContext({});
                const validator = new InputValidationHelper(emailInput, '#login-email-input-helper-text.Mui-error');
                await validator.expectError('', 'Email is required');
                await validator.expectError('invalid-email-address', 'Invalid email');
                await validator.expectNoError('validEmail@domain.com');
                done();
            });

            it('should validate password input value', async (done) => {
                const [ { passwordInput } ] = renderLoginPageWithContext({});
                const validator = new InputValidationHelper(passwordInput, '#login-password-input-helper-text.Mui-error');
                await validator.expectError('', 'Password is required');
                await validator.expectError('bad', 'Password is too short');
                await validator.expectNoError('better password');
                done();
            });

        });

        it('should successfully log in and navigate to projects page', async (done) => {
            const history = createMemoryHistory();
            const mocks = [ loginSuccessMock ];
            const [ elements ] = renderLoginPageWithContext({ history, mocks });

            await fillAndSubmitForm(elements, loginSuccessMock);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toMatch(routes.projects()));

            // verify if auth service has been informed about new access token
            expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledWith(loginSuccessMock.result.data.login.accessToken);

            // verify if apollo cache has been updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(1);
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledWith({
                query: MeDocument,
                data: { me: loginSuccessMock.result.data.login.user },
            });
            done();
        });

        it('should display notification about bad credentials error ', async (done) => {
            const history = createMemoryHistory();
            const mocks = [ loginBadCredentialsMock ];
            const snackbarMocks = { errorSnackbar: jest.fn() };
            const [ elements ] = renderLoginPageWithContext({ history, mocks, snackbarMocks });

            await fillAndSubmitForm(elements, loginBadCredentialsMock);

            // verify if error alert has been displayed
            await waitFor(() => {
                expect(snackbarMocks.errorSnackbar).toHaveBeenCalledTimes(1);
                expect(snackbarMocks.errorSnackbar).toHaveBeenCalledWith('Bad email or password');
            });

            // verify if auth service has been not informed about new access token
            expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledTimes(0);

            // verify if apollo cache has been not updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
            done();
        });

        it('should display notification about network error', async (done) => {
            const history = createMemoryHistory();
            const mocks = [ loginNetworkErrorMock ];
            const snackbarMocks = { errorSnackbar: jest.fn() };
            const [ elements ] = renderLoginPageWithContext({ history, mocks, snackbarMocks });

            await fillAndSubmitForm(elements, loginNetworkErrorMock);

            // verify if error alert has been displayed
            await waitFor(() => {
                expect(snackbarMocks.errorSnackbar).toHaveBeenCalledTimes(1);
                expect(snackbarMocks.errorSnackbar).toHaveBeenCalledWith('Network error');
            });

            // verify if auth service has been not informed about new access token
            expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledTimes(0);

            // verify if apollo cache has been not updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
            done();
        });

    });

});
