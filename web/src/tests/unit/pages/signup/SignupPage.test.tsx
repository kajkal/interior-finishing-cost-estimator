import React from 'react';
import { GraphQLError } from 'graphql';
import { Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseSessionState } from '../../../__mocks__/code/mockUseSessionState';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { MockSessionChannel } from '../../../__mocks__/code/MockSessionChannel';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { MutationRegisterArgs, RegisterDocument } from '../../../../graphql/generated-types';
import { SignupPage } from '../../../../code/components/pages/signup/SignupPage';
import { routes } from '../../../../code/config/routes';


describe('SignupPage component', () => {

    const signupPagePath = '/signup-page-test-path';

    beforeEach(() => {
        MockSessionChannel.setupMocks();
        mockUseSessionState.mockReset();
        mockUseSessionState.mockReturnValue({ isUserLoggedIn: false });
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const history = mocks?.history || createMemoryHistory({ initialEntries: [ signupPagePath ] });
        return render(
            <MockContextProvider mocks={{ ...mocks, history }}>
                <Route path={signupPagePath} exact>
                    <SignupPage />
                </Route>
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get nameInput() {
            return screen.getByLabelText('t:form.name.label', { selector: 'input' });
        }
        static get emailInput() {
            return screen.getByLabelText('t:form.email.label', { selector: 'input' });
        }
        static get passwordInput() {
            return screen.getByLabelText('t:form.password.label', { selector: 'input' });
        }
        static get passwordConfirmationInput() {
            return screen.getByLabelText('t:signupPage.passwordConfirmationLabel', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:signupPage.signUp' });
        }
        static get loginPageLink() {
            return screen.getByText('t:signupPage.logInLink', { selector: 'a' });
        }
        static async fillAndSubmitForm(data: MutationRegisterArgs) {
            await extendedUserEvent.type(this.nameInput, data.name);
            await extendedUserEvent.type(this.emailInput, data.email);
            await extendedUserEvent.type(this.passwordInput, data.password);
            await extendedUserEvent.type(this.passwordConfirmationInput, data.password);
            userEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'log in\' link click', () => {
        const history = createMemoryHistory({ initialEntries: [ signupPagePath ] });
        renderInMockContext({ history });

        userEvent.click(ViewUnderTest.loginPageLink);

        expect(history.location.pathname).toBe(routes.login());
    });

    it('should navigate to default page if user is already authenticated', () => {
        mockUseSessionState.mockReturnValue({ isUserLoggedIn: true });

        const history = createMemoryHistory({ initialEntries: [ signupPagePath ] });
        renderInMockContext({ history });

        // verify if navigation to default page occurred
        expect(history.location.pathname).toBe(routes.projects());
    });

    describe('sign up form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: RegisterDocument,
                    variables: {
                        name: generator.name(),
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
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
            }),
            emailNotAvailable: () => ({
                request: {
                    query: RegisterDocument,
                    variables: {
                        name: generator.name(),
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
                result: {
                    data: null,
                    errors: [
                        { message: 'EMAIL_NOT_AVAILABLE' } as unknown as GraphQLError,
                    ],
                },
            }),
            networkError: () => ({
                request: {
                    query: RegisterDocument,
                    variables: {
                        name: generator.name(),
                        email: generator.email(),
                        password: generator.string({ length: 8 }),
                    },
                },
                error: new Error('network error'),
            }),
        };

        describe('validation', () => {

            it('should validate name input value', (done) => {
                renderInMockContext();
                InputValidator.basedOn(ViewUnderTest.nameInput)
                    .expectError('', 't:form.name.validation.required')
                    .expectError(':<', 't:form.name.validation.tooShort')
                    .expectNoError('Valid Name')
                    .finish(done);
            });

            it('should validate email input value', (done) => {
                renderInMockContext();
                InputValidator.basedOn(ViewUnderTest.emailInput)
                    .expectError('', 't:form.email.validation.required')
                    .expectError('invalid-email-address', 't:form.email.validation.invalid')
                    .expectNoError('validEmail@domain.com')
                    .finish(done);
            });

            it('should validate password input value', (done) => {
                renderInMockContext();
                InputValidator.basedOn(ViewUnderTest.passwordInput)
                    .expectError('', 't:form.password.validation.required')
                    .expectError('bad', 't:form.password.validation.tooShort')
                    .expectNoError('better password')
                    .finish(done);
            });

            it('should validate password confirmation input value', async (done) => {
                renderInMockContext();
                const passwordValue = 'first password';
                await extendedUserEvent.type(ViewUnderTest.passwordInput, passwordValue);
                await InputValidator.basedOn(ViewUnderTest.passwordConfirmationInput)
                    .expectError('', 't:form.password.validation.passwordsNotMatch')
                    .expectError('not equal', 't:form.password.validation.passwordsNotMatch')
                    .expectNoError(passwordValue);
                done();
            });

        });

        it('should successfully sign up and trigger session login event', async (done) => {
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if session login event was triggered
            await waitFor(() => expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(1));
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledWith(mockResponse.result.data.register);
            done();
        });

        it('should display information about not available email', async (done) => {
            const history = createMemoryHistory({ initialEntries: [ signupPagePath ] });
            const mockResponse = mockResponseGenerator.emailNotAvailable();
            renderInMockContext({ history, mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if email field is mark as invalid and error message is displayed
            await waitFor(() => expect(ViewUnderTest.emailInput).toBeInvalid());
            expect(ViewUnderTest.emailInput).toHaveDescription('t:form.email.validation.notAvailable');

            // verify if session login event was not triggered
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(0);
            done();
        });

        it('should display notification about network error', async (done) => {
            const history = createMemoryHistory({ initialEntries: [ signupPagePath ] });
            const mockResponse = mockResponseGenerator.networkError();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            renderInMockContext({ history, mockResponses: [ mockResponse ], mockSnackbars });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if error alert was displayed
            await waitFor(() => expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1));
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:error.networkError');

            // verify if session login event was not triggered
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(0);
            done();
        });

    });

});
