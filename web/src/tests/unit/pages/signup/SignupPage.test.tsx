import * as React from 'react';
import { GraphQLError } from 'graphql';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { MockSnackbarContextData, MockSnackbarProvider } from '../../../__utils__/mocks/MockSnackbarProvider';
import { ApolloCacheSpiesManager } from '../../../__utils__/spies-managers/ApolloCacheSpiesManager';
import { AuthServiceSpiesManager } from '../../../__utils__/spies-managers/AuthServiceSpiesManager';
import { InputValidationHelper } from '../../../__utils__/InputValidationHelper';
import { changeInputValue } from '../../../__utils__/changeInputValue';
import { generator } from '../../../__utils__/generator';

import { SignupPage } from '../../../../code/components/pages/signup/SignupPage';
import { MeDocument, RegisterDocument } from '../../../../graphql/generated-types';
import { routes } from '../../../../code/config/routes';


describe('SignupPage component', () => {

    beforeEach(() => {
        ApolloCacheSpiesManager.setupSpies();
        AuthServiceSpiesManager.setupSpies();
    });

    interface SignupPageRenderOptions {
        history?: MemoryHistory;
        mocks?: ReadonlyArray<MockedResponse>;
        snackbarMocks?: MockSnackbarContextData;
    }

    interface SignupPageElements {
        nameInput: HTMLInputElement;
        emailInput: HTMLInputElement;
        passwordInput: HTMLInputElement;
        passwordConfirmationInput: HTMLInputElement;
        submitButton: HTMLButtonElement;
        loginPageLink: HTMLAnchorElement;
    }

    type SignupPageRenderResult = [ SignupPageElements, RenderResult ];

    function renderSignupPageWithContext(options: SignupPageRenderOptions): SignupPageRenderResult {
        const { history = createMemoryHistory(), mocks = [], snackbarMocks } = options;
        const renderResult = render(
            <MockedProvider mocks={mocks}>
                <Router history={history}>
                    <MockSnackbarProvider mocks={snackbarMocks}>
                        <SignupPage />
                    </MockSnackbarProvider>
                </Router>
            </MockedProvider>,
        );

        return [ {
            nameInput: renderResult.getByLabelText('Name', { selector: 'input' }) as HTMLInputElement,
            emailInput: renderResult.getByLabelText('Email address', { selector: 'input' }) as HTMLInputElement,
            passwordInput: renderResult.getByLabelText('Password', { selector: 'input' }) as HTMLInputElement,
            passwordConfirmationInput: renderResult.getByLabelText('Confirm Password', { selector: 'input' }) as HTMLInputElement,
            submitButton: renderResult.getByRole('button', { name: 'Sign up' }) as HTMLButtonElement,
            loginPageLink: renderResult.getByText(/log in/i, { selector: 'a' }) as HTMLAnchorElement,
        }, renderResult ];
    }

    it('should navigate to new page on \'forgot password\' link click', async () => {
        const history = createMemoryHistory();
        const [ { loginPageLink } ] = renderSignupPageWithContext({ history });

        fireEvent.click(loginPageLink);

        expect(history.location.pathname).toMatch(routes.login());
    });

    describe('sign up form', () => {

        const signupSuccessMock = {
            request: {
                query: RegisterDocument,
                variables: {
                    data: {
                        name: generator.name(),
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
            },
            result: {
                data: {
                    register: {
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

        const signupEmailNotAvailableMock = {
            request: {
                query: RegisterDocument,
                variables: {
                    data: {
                        name: generator.name(),
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
            },
            result: {
                data: null,
                errors: [
                    { message: 'EMAIL_NOT_AVAILABLE' } as unknown as GraphQLError,
                ],
            },
        };

        const signupNetworkErrorMock = {
            request: {
                query: RegisterDocument,
                variables: {
                    data: {
                        name: generator.name(),
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
            },
            error: new Error('network error'),
        };

        async function fillAndSubmitForm(elements: SignupPageElements, mock: MockedResponse) {
            await changeInputValue(elements.nameInput, mock.request.variables!.data.name);
            await changeInputValue(elements.emailInput, mock.request.variables!.data.email);
            await changeInputValue(elements.passwordInput, mock.request.variables!.data.password);
            await changeInputValue(elements.passwordConfirmationInput, mock.request.variables!.data.password);
            fireEvent.click(elements.submitButton);
        }

        describe('validation', () => {

            it('should validate name input value', async (done) => {
                const [ { nameInput } ] = renderSignupPageWithContext({});
                const validator = new InputValidationHelper(nameInput, '#signup-name-input-helper-text.Mui-error');
                await validator.expectError('', 'Name is required');
                await validator.expectError(':<', 'Name is too short');
                await validator.expectNoError('Valid Name');
                done();
            });

            it('should validate email input value', async (done) => {
                const [ { emailInput } ] = renderSignupPageWithContext({});
                const validator = new InputValidationHelper(emailInput, '#signup-email-input-helper-text.Mui-error');
                await validator.expectError('', 'Email is required');
                await validator.expectError('invalid-email-address', 'Invalid email');
                await validator.expectNoError('validEmail@domain.com');
                done();
            });

            it('should validate password input value', async (done) => {
                const [ { passwordInput } ] = renderSignupPageWithContext({});
                const validator = new InputValidationHelper(passwordInput, '#signup-password-input-helper-text.Mui-error');
                await validator.expectError('', 'Password is required');
                await validator.expectError('bad', 'Password is too short');
                await validator.expectNoError('better password');
                done();
            });

            it('should validate password confirmation input value', async (done) => {
                const [ { passwordInput, passwordConfirmationInput } ] = renderSignupPageWithContext({});

                const passwordValue = 'first password';
                await changeInputValue(passwordInput, passwordValue);

                const validator = new InputValidationHelper(passwordConfirmationInput, '#signup-password-confirmation-input-helper-text.Mui-error');
                await validator.expectError('', 'Passwords do not match');
                await validator.expectError('not equal', 'Passwords do not match');
                await validator.expectNoError(passwordValue);
                done();
            });

        });

        it('should successfully sign up and navigate to projects page', async (done) => {
            const history = createMemoryHistory();
            const mocks = [ signupSuccessMock ];
            const [ elements ] = renderSignupPageWithContext({ history, mocks });

            await fillAndSubmitForm(elements, signupSuccessMock);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toMatch(routes.projects()));

            // verify if auth service has been informed about new access token
            expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledWith(signupSuccessMock.result.data.register.accessToken);

            // verify if apollo cache has been updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(1);
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledWith({
                query: MeDocument,
                data: { me: signupSuccessMock.result.data.register.user },
            });
            done();
        });

        it('should display information about not available email', async (done) => {
            const history = createMemoryHistory();
            const mocks = [ signupEmailNotAvailableMock ];
            const [ elements ] = renderSignupPageWithContext({ history, mocks });

            await fillAndSubmitForm(elements, signupEmailNotAvailableMock);

            // verify if error has been displayed
            await waitFor(() => {
                const errorMessageElement = document.querySelector('#signup-email-input-helper-text.Mui-error');
                expect(errorMessageElement).toBeInTheDocument();
                expect(errorMessageElement).toHaveTextContent('Email not available');
            });

            // verify if auth service has been not informed about new access token
            expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledTimes(0);

            // verify if apollo cache has been not updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
            done();
        });

        it('should display notification about network error', async (done) => {
            const history = createMemoryHistory();
            const mocks = [ signupNetworkErrorMock ];
            const snackbarMocks = { errorSnackbar: jest.fn() };
            const [ elements ] = renderSignupPageWithContext({ history, mocks, snackbarMocks });

            await fillAndSubmitForm(elements, signupNetworkErrorMock);

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
