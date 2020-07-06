import * as React from 'react';
import { GraphQLError } from 'graphql';
import { createMemoryHistory } from 'history';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { PageContextMocks, PageMockContextProvider } from '../../../__utils__/PageMockContextProvider';
import { ApolloCacheSpiesManager } from '../../../__utils__/spies-managers/ApolloCacheSpiesManager';
import { changeInputValue } from '../../../__utils__/changeInputValue';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { SessionStateDocument, LoginDocument, MeDocument, MutationLoginArgs } from '../../../../graphql/generated-types';
import { LoginPage } from '../../../../code/components/pages/login/LoginPage';
import { routes } from '../../../../code/config/routes';


describe('LoginPage component', () => {

    beforeEach(() => {
        ApolloCacheSpiesManager.setupSpies();
    });

    class LoginPageTestFixture {
        private constructor(public renderResult: RenderResult) {}
        static renderInMockContext(mocks?: PageContextMocks) {
            const renderResult = render(
                <PageMockContextProvider mocks={mocks}>
                    <LoginPage />
                </PageMockContextProvider>,
            );
            return new this(renderResult);
        }
        get emailInput() {
            return this.renderResult.getByLabelText('t:form.email.label', { selector: 'input' }) as HTMLInputElement;
        }
        get passwordInput() {
            return this.renderResult.getByLabelText('t:form.password.label', { selector: 'input' }) as HTMLInputElement;
        }
        get submitButton() {
            return this.renderResult.getByRole('button', { name: 't:loginPage.logIn' }) as HTMLButtonElement;
        }
        get forgotPasswordPageLink() {
            return this.renderResult.getByText('t:loginPage.forgotPasswordLink', { selector: 'a' }) as HTMLAnchorElement;
        }
        get signupPageLink() {
            return this.renderResult.getByText('t:loginPage.signUpLink', { selector: 'a' }) as HTMLAnchorElement;
        }
        async fillAndSubmitForm(data: MutationLoginArgs) {
            await changeInputValue(this.emailInput, data.email);
            await changeInputValue(this.passwordInput, data.password);
            fireEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'forgot password\' link click', () => {
        const history = createMemoryHistory();
        const { forgotPasswordPageLink } = LoginPageTestFixture.renderInMockContext({ history });

        fireEvent.click(forgotPasswordPageLink);

        expect(history.location.pathname).toMatch(routes.forgotPassword());
    });

    it('should navigate to new page on \'sign up\' link click', () => {
        const history = createMemoryHistory();
        const { signupPageLink } = LoginPageTestFixture.renderInMockContext({ history });

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

        describe('validation', () => {

            it('should validate email input value', (done) => {
                const { emailInput } = LoginPageTestFixture.renderInMockContext();
                InputValidator.basedOn(emailInput, '#login-email-input-helper-text.Mui-error')
                    .expectError('', 't:form.email.validation.required')
                    .expectError('invalid-email-address', 't:form.email.validation.invalid')
                    .expectNoError('validEmail@domain.com')
                    .finish(done);
            });

            it('should validate password input value', (done) => {
                const { passwordInput } = LoginPageTestFixture.renderInMockContext();
                InputValidator.basedOn(passwordInput, '#login-password-input-helper-text.Mui-error')
                    .expectError('', 't:form.password.validation.required')
                    .expectError('bad', 't:form.password.validation.tooShort')
                    .expectNoError('better password')
                    .finish(done);
            });

        });

        it('should successfully log in and navigate to projects page', async (done) => {
            const history = createMemoryHistory();
            const mockResponse = mockResponseGenerator.success();
            const pageTestFixture = LoginPageTestFixture.renderInMockContext({
                history,
                mockResponses: [ mockResponse ],
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

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
                query: SessionStateDocument,
                data: {
                    sessionState: {
                        __typename: 'SessionState',
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
            const pageTestFixture = LoginPageTestFixture.renderInMockContext({
                history,
                mockResponses: [ mockResponse ],
            });

            // verify current location
            expect(history.location.pathname).toMatch('/login-page');

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation to initially requested protected page occurred
            await waitFor(() => expect(history.location.pathname).toMatch('/protected-page'));
            done();
        });

        it('should display notification about bad credentials error ', async (done) => {
            const mockResponse = mockResponseGenerator.badCredentials();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const pageTestFixture = LoginPageTestFixture.renderInMockContext({
                mockResponses: [ mockResponse ],
                mockSnackbars,
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

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
            const mockResponse = mockResponseGenerator.networkError();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const pageTestFixture = LoginPageTestFixture.renderInMockContext({
                mockResponses: [ mockResponse ],
                mockSnackbars,
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

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
