import * as React from 'react';
import { GraphQLError } from 'graphql';
import { createMemoryHistory } from 'history';
import { MockedResponse } from '@apollo/react-testing';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { PageContextMocks, PageMockContextProvider } from '../../../__utils__/PageMockContextProvider';
import { ApolloCacheSpiesManager } from '../../../__utils__/spies-managers/ApolloCacheSpiesManager';
import { InputValidationHelper } from '../../../__utils__/InputValidationHelper';
import { changeInputValue } from '../../../__utils__/changeInputValue';
import { generator } from '../../../__utils__/generator';

import { LocalStateDocument, LoginDocument, MeDocument } from '../../../../graphql/generated-types';
import { LoginPage } from '../../../../code/components/pages/login/LoginPage';
import { routes } from '../../../../code/config/routes';


describe('LoginPage component', () => {

    beforeEach(() => {
        ApolloCacheSpiesManager.setupSpies();
    });

    interface LoginPageElements {
        emailInput: HTMLInputElement;
        passwordInput: HTMLInputElement;
        submitButton: HTMLButtonElement;
        forgotPasswordPageLink: HTMLAnchorElement;
        signupPageLink: HTMLAnchorElement;
    }

    function renderLoginPageInMockContext(mocks?: PageContextMocks): [ LoginPageElements, RenderResult ] {
        const renderResult = render(
            <PageMockContextProvider mocks={mocks}>
                <LoginPage />
            </PageMockContextProvider>,
        );

        return [ {
            emailInput: renderResult.getByLabelText('t:form.email.label', { selector: 'input' }) as HTMLInputElement,
            passwordInput: renderResult.getByLabelText('t:form.password.label', { selector: 'input' }) as HTMLInputElement,
            submitButton: renderResult.getByRole('button', { name: 't:loginPage.logIn' }) as HTMLButtonElement,
            forgotPasswordPageLink: renderResult.getByText('t:loginPage.forgotPasswordLink', { selector: 'a' }) as HTMLAnchorElement,
            signupPageLink: renderResult.getByText('t:loginPage.signUpLink', { selector: 'a' }) as HTMLAnchorElement,
        }, renderResult ];
    }

    it('should navigate to new page on \'forgot password\' link click', () => {
        const history = createMemoryHistory();
        const [ { forgotPasswordPageLink } ] = renderLoginPageInMockContext({ history });

        fireEvent.click(forgotPasswordPageLink);

        expect(history.location.pathname).toMatch(routes.forgotPassword());
    });

    it('should navigate to new page on \'sign up\' link click', () => {
        const history = createMemoryHistory();
        const [ { signupPageLink } ] = renderLoginPageInMockContext({ history });

        fireEvent.click(signupPageLink);

        expect(history.location.pathname).toMatch(routes.signup());
    });

    describe('log in form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: LoginDocument,
                    variables: {
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
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
            }),
            badCredentials: () => ({
                request: {
                    query: LoginDocument,
                    variables: {
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
                result: {
                    data: null,
                    errors: [
                        { message: 'BAD_CREDENTIALS' } as unknown as GraphQLError,
                    ],
                },
            }),
            networkError: () => ({
                request: {
                    query: LoginDocument,
                    variables: {
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
                error: new Error('network error'),
            }),
        };

        async function fillAndSubmitForm(elements: LoginPageElements, mock: MockedResponse) {
            await changeInputValue(elements.emailInput, mock.request.variables!.email);
            await changeInputValue(elements.passwordInput, mock.request.variables!.password);
            fireEvent.click(elements.submitButton);
        }

        describe('validation', () => {

            it('should validate email input value', async (done) => {
                const [ { emailInput } ] = renderLoginPageInMockContext();
                const validator = new InputValidationHelper(emailInput, '#login-email-input-helper-text.Mui-error');
                await validator.expectError('', 't:form.email.validation.required');
                await validator.expectError('invalid-email-address', 't:form.email.validation.invalid');
                await validator.expectNoError('validEmail@domain.com');
                done();
            });

            it('should validate password input value', async (done) => {
                const [ { passwordInput } ] = renderLoginPageInMockContext();
                const validator = new InputValidationHelper(passwordInput, '#login-password-input-helper-text.Mui-error');
                await validator.expectError('', 't:form.password.validation.required');
                await validator.expectError('bad', 't:form.password.validation.tooShort');
                await validator.expectNoError('better password');
                done();
            });

        });

        it('should successfully log in and navigate to projects page', async (done) => {
            const history = createMemoryHistory();
            const mockResponse = mockResponseGenerator.success();
            const [ elements ] = renderLoginPageInMockContext({ history, mockResponses: [ mockResponse ] });

            await fillAndSubmitForm(elements, mockResponse);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toMatch(routes.projects()));

            // verify if apollo cache was updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(2);

            // verify if Me query result was saved in cache
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenNthCalledWith(1, {
                query: MeDocument,
                data: { me: mockResponse.result.data.login.user },
            });

            // verify if access token was saved in cache
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenNthCalledWith(2, {
                query: LocalStateDocument,
                data: {
                    localState: {
                        __typename: 'LocalState',
                        accessToken: mockResponse.result.data.login.accessToken,
                    },
                },
            });
            done();
        });

        /**
         * User try to access protected page, but is not authenticated, so he is redirected to login page.
         * After successful authentication he is redirected to initially requested protected page.
         */
        it('should successfully log in and navigate to initially requested protected page', async (done) => {
            const history = createMemoryHistory();
            history.push('/login-page', { from: { pathname: '/protected-page' } }); // simulate redirection done by ProtectedRoute component
            const mockResponse = mockResponseGenerator.success();
            const [ elements ] = renderLoginPageInMockContext({ history, mockResponses: [ mockResponse ] });

            // verify current location
            expect(history.location.pathname).toMatch('/login-page');

            await fillAndSubmitForm(elements, mockResponse);

            // verify if navigation to initially requested protected page occurred
            await waitFor(() => expect(history.location.pathname).toMatch('/protected-page'));
            done();
        });

        it('should display notification about bad credentials error ', async (done) => {
            const history = createMemoryHistory();
            const mockResponses = [ mockResponseGenerator.badCredentials() ];
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const [ elements ] = renderLoginPageInMockContext({ history, mockResponses, mockSnackbars });

            await fillAndSubmitForm(elements, mockResponses[ 0 ]);

            // verify if error alert was displayed
            await waitFor(() => {
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:loginPage.badCredentials');
            });

            // verify if apollo cache was not updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
            done();
        });

        it('should display notification about network error', async (done) => {
            const history = createMemoryHistory();
            const mockResponses = [ mockResponseGenerator.networkError() ];
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const [ elements ] = renderLoginPageInMockContext({ history, mockResponses, mockSnackbars });

            await fillAndSubmitForm(elements, mockResponses[ 0 ]);

            // verify if error alert was displayed
            await waitFor(() => {
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:error.networkError');
            });

            // verify if apollo cache was not updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
            done();
        });

    });

});
