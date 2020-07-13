import React from 'react';
import { GraphQLError } from 'graphql';
import { Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseSessionState } from '../../../__mocks__/code/mockUseSessionState';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { MockSessionChannel } from '../../../__mocks__/code/MockSessionChannel';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { LoginDocument, MutationLoginArgs } from '../../../../graphql/generated-types';
import { LoginPage } from '../../../../code/components/pages/login/LoginPage';
import { nav } from '../../../../code/config/nav';


describe('LoginPage component', () => {

    const loginPagePath = '/login-page-test-path';

    beforeEach(() => {
        MockSessionChannel.setupMocks();
        mockUseSessionState.mockReset();
        mockUseSessionState.mockReturnValue({ isUserLoggedIn: false });
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const initialEntries = mocks?.initialEntries || [ loginPagePath ];
        return render(
            <MockContextProvider mocks={{ ...mocks, initialEntries }}>
                <Routes>
                    <Route path={loginPagePath}>
                        <LoginPage />
                    </Route>
                </Routes>
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get emailInput() {
            return screen.getByLabelText('t:form.email.label', { selector: 'input' });
        }
        static get passwordInput() {
            return screen.getByLabelText('t:form.password.label', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:loginPage.logIn' });
        }
        static get forgotPasswordPageLink() {
            return screen.getByText('t:loginPage.forgotPasswordLink', { selector: 'a' });
        }
        static get signupPageLink() {
            return screen.getByText('t:loginPage.signUpLink', { selector: 'a' });
        }
        static async fillAndSubmitForm(data: MutationLoginArgs) {
            await extendedUserEvent.type(this.emailInput, data.email);
            await extendedUserEvent.type(this.passwordInput, data.password);
            userEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'forgot password\' link click', () => {
        renderInMockContext();
        userEvent.click(ViewUnderTest.forgotPasswordPageLink);
        expect(screen.getByTestId('location')).toHaveTextContent(nav.forgotPassword());
    });

    it('should navigate to new page on \'sign up\' link click', () => {
        renderInMockContext();
        userEvent.click(ViewUnderTest.signupPageLink);
        expect(screen.getByTestId('location')).toHaveTextContent(nav.signup());
    });

    it('should navigate to default page if user is already authenticated', () => {
        mockUseSessionState.mockReturnValue({ isUserLoggedIn: true });
        renderInMockContext();
        expect(screen.getByTestId('location')).toHaveTextContent(nav.inquiries());
    });

    /**
     * User try to access protected page, but is not authenticated, so he is redirected to login page.
     * After successful authentication he is redirected to initially requested protected page.
     */
    it('should navigate to initially requested protected page if user is already authenticated', () => {
        mockUseSessionState.mockReturnValue({ isUserLoggedIn: true });
        renderInMockContext({
            initialEntries: [ {
                pathname: loginPagePath,
                state: { from: { pathname: '/protected-page' } }, // simulate redirection done by ProtectedRoute component
            } ],
        });
        expect(screen.getByTestId('location')).toHaveTextContent('/protected-page');
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
                            user: { userData: '...' },
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

            it('should validate email input value', async () => {
                renderInMockContext();
                await InputValidator.basedOn(ViewUnderTest.emailInput)
                    .expectError('', 't:form.email.validation.required')
                    .expectError('invalid-email-address', 't:form.email.validation.invalid')
                    .expectNoError('validEmail@domain.com');
            });

            it('should validate password input value', async () => {
                renderInMockContext();
                await InputValidator.basedOn(ViewUnderTest.passwordInput)
                    .expectError('', 't:form.password.validation.required')
                    .expectError('bad', 't:form.password.validation.tooShort')
                    .expectNoError('better password');
            });

        });

        it('should successfully log in and trigger session login event', async () => {
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if session login event was triggered
            await waitFor(() => expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(1));
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledWith(mockResponse.result.data.login);
        });

        it('should display notification about bad credentials error ', async () => {
            const mockResponse = mockResponseGenerator.badCredentials();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:loginPage.badCredentials');

            // verify if session login event was not triggered
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(0);
        });

        it('should display notification about network error', async () => {
            const mockResponse = mockResponseGenerator.networkError();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.networkError');

            // verify if session login event was not triggered
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(0);
        });

    });

});
