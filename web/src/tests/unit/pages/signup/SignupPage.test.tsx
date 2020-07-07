import * as React from 'react';
import { GraphQLError } from 'graphql';
import { createMemoryHistory } from 'history';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { ApolloCacheSpiesManager } from '../../../__utils__/spies-managers/ApolloCacheSpiesManager';
import { changeInputValue } from '../../../__utils__/changeInputValue';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { SessionStateDocument, MeDocument, MutationRegisterArgs, RegisterDocument } from '../../../../graphql/generated-types';
import { SignupPage } from '../../../../code/components/pages/signup/SignupPage';
import { routes } from '../../../../code/config/routes';


describe('SignupPage component', () => {

    beforeEach(() => {
        ApolloCacheSpiesManager.setupSpies();
    });

    class SignupPageTestFixture {
        private constructor(public renderResult: RenderResult) {}
        static renderInMockContext(mocks?: ContextMocks) {
            const renderResult = render(
                <MockContextProvider mocks={mocks}>
                    <SignupPage />
                </MockContextProvider>,
            );
            return new this(renderResult);
        }
        get nameInput() {
            return this.renderResult.getByLabelText('t:form.name.label', { selector: 'input' }) as HTMLInputElement;
        }
        get emailInput() {
            return this.renderResult.getByLabelText('t:form.email.label', { selector: 'input' }) as HTMLInputElement;
        }
        get passwordInput() {
            return this.renderResult.getByLabelText('t:form.password.label', { selector: 'input' }) as HTMLInputElement;
        }
        get passwordConfirmationInput() {
            return this.renderResult.getByLabelText('t:signupPage.passwordConfirmationLabel', { selector: 'input' }) as HTMLInputElement;
        }
        get submitButton() {
            return this.renderResult.getByRole('button', { name: 't:signupPage.signUp' }) as HTMLButtonElement;
        }
        get loginPageLink() {
            return this.renderResult.getByText('t:signupPage.logInLink', { selector: 'a' }) as HTMLAnchorElement;
        }
        async fillAndSubmitForm(data: MutationRegisterArgs) {
            await changeInputValue(this.nameInput, data.name);
            await changeInputValue(this.emailInput, data.email);
            await changeInputValue(this.passwordInput, data.password);
            await changeInputValue(this.passwordConfirmationInput, data.password);
            fireEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'log in\' link click', async () => {
        const history = createMemoryHistory();
        const { loginPageLink } = SignupPageTestFixture.renderInMockContext({ history });

        fireEvent.click(loginPageLink);

        expect(history.location.pathname).toMatch(routes.login());
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
                const { nameInput } = SignupPageTestFixture.renderInMockContext();
                InputValidator.basedOn(nameInput, '#signup-name-input-helper-text.Mui-error')
                    .expectError('', 't:form.name.validation.required')
                    .expectError(':<', 't:form.name.validation.tooShort')
                    .expectNoError('Valid Name')
                    .finish(done);
            });

            it('should validate email input value', (done) => {
                const { emailInput } = SignupPageTestFixture.renderInMockContext();
                InputValidator.basedOn(emailInput, '#signup-email-input-helper-text.Mui-error')
                    .expectError('', 't:form.email.validation.required')
                    .expectError('invalid-email-address', 't:form.email.validation.invalid')
                    .expectNoError('validEmail@domain.com')
                    .finish(done);
            });

            it('should validate password input value', (done) => {
                const { passwordInput } = SignupPageTestFixture.renderInMockContext();
                InputValidator.basedOn(passwordInput, '#signup-password-input-helper-text.Mui-error')
                    .expectError('', 't:form.password.validation.required')
                    .expectError('bad', 't:form.password.validation.tooShort')
                    .expectNoError('better password')
                    .finish(done);
            });

            it('should validate password confirmation input value', async (done) => {
                const { passwordInput, passwordConfirmationInput } = SignupPageTestFixture.renderInMockContext();
                const passwordValue = 'first password';
                await changeInputValue(passwordInput, passwordValue);
                await InputValidator.basedOn(passwordConfirmationInput, '#signup-password-confirmation-input-helper-text.Mui-error')
                    .expectError('', 't:form.password.validation.passwordsNotMatch')
                    .expectError('not equal', 't:form.password.validation.passwordsNotMatch')
                    .expectNoError(passwordValue);
                done();
            });

        });

        it('should successfully sign up and navigate to projects page', async (done) => {
            const history = createMemoryHistory();
            const mockResponse = mockResponseGenerator.success();
            const pageTestFixture = SignupPageTestFixture.renderInMockContext({
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
                data: { me: mockResponse.result.data.register.user },
            });

            // verify if access token was saved in cache
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenNthCalledWith(2, {
                query: SessionStateDocument,
                data: {
                    sessionState: {
                        __typename: 'SessionState',
                        accessToken: mockResponse.result.data.register.accessToken,
                    },
                },
            });
            done();
        });

        it('should display information about not available email', async (done) => {
            const history = createMemoryHistory();
            const mockResponse = mockResponseGenerator.emailNotAvailable();
            const pageTestFixture = SignupPageTestFixture.renderInMockContext({
                history,
                mockResponses: [ mockResponse ],
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

            // verify if error alert was displayed
            await waitFor(() => {
                const errorMessageElement = document.querySelector('#signup-email-input-helper-text.Mui-error');
                expect(errorMessageElement).toBeInTheDocument();
                expect(errorMessageElement).toHaveTextContent('t:form.email.validation.notAvailable');
            });

            // verify if apollo cache was not updated
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
            done();
        });

        it('should display notification about network error', async (done) => {
            const history = createMemoryHistory();
            const mockResponse = mockResponseGenerator.networkError();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const pageTestFixture = SignupPageTestFixture.renderInMockContext({
                history,
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
