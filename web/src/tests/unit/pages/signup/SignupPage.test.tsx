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

import { LocalStateDocument, MeDocument, RegisterDocument } from '../../../../graphql/generated-types';
import { SignupPage } from '../../../../code/components/pages/signup/SignupPage';
import { routes } from '../../../../code/config/routes';


describe('SignupPage component', () => {

    beforeEach(() => {
        ApolloCacheSpiesManager.setupSpies();
    });

    interface SignupPageElements {
        nameInput: HTMLInputElement;
        emailInput: HTMLInputElement;
        passwordInput: HTMLInputElement;
        passwordConfirmationInput: HTMLInputElement;
        submitButton: HTMLButtonElement;
        loginPageLink: HTMLAnchorElement;
    }

    function renderSignupPageInMockContext(mocks?: PageContextMocks): [ SignupPageElements, RenderResult ] {
        const renderResult = render(
            <PageMockContextProvider mocks={mocks}>
                <SignupPage />
            </PageMockContextProvider>,
        );

        return [ {
            nameInput: renderResult.getByLabelText('t:form.name.label', { selector: 'input' }) as HTMLInputElement,
            emailInput: renderResult.getByLabelText('t:form.email.label', { selector: 'input' }) as HTMLInputElement,
            passwordInput: renderResult.getByLabelText('t:form.password.label', { selector: 'input' }) as HTMLInputElement,
            passwordConfirmationInput: renderResult.getByLabelText('t:signupPage.passwordConfirmationLabel', { selector: 'input' }) as HTMLInputElement,
            submitButton: renderResult.getByRole('button', { name: 't:signupPage.signUp' }) as HTMLButtonElement,
            loginPageLink: renderResult.getByText('t:signupPage.logInLink', { selector: 'a' }) as HTMLAnchorElement,
        }, renderResult ];
    }

    it('should navigate to new page on \'forgot password\' link click', async () => {
        const history = createMemoryHistory();
        const [ { loginPageLink } ] = renderSignupPageInMockContext({ history });

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

        async function fillAndSubmitForm(elements: SignupPageElements, mock: MockedResponse) {
            await changeInputValue(elements.nameInput, mock.request.variables!.name);
            await changeInputValue(elements.emailInput, mock.request.variables!.email);
            await changeInputValue(elements.passwordInput, mock.request.variables!.password);
            await changeInputValue(elements.passwordConfirmationInput, mock.request.variables!.password);
            fireEvent.click(elements.submitButton);
        }

        describe('validation', () => {

            it('should validate name input value', async (done) => {
                const [ { nameInput } ] = renderSignupPageInMockContext();
                const validator = new InputValidationHelper(nameInput, '#signup-name-input-helper-text.Mui-error');
                await validator.expectError('', 't:form.name.validation.required');
                await validator.expectError(':<', 't:form.name.validation.tooShort');
                await validator.expectNoError('Valid Name');
                done();
            });

            it('should validate email input value', async (done) => {
                const [ { emailInput } ] = renderSignupPageInMockContext();
                const validator = new InputValidationHelper(emailInput, '#signup-email-input-helper-text.Mui-error');
                await validator.expectError('', 't:form.email.validation.required');
                await validator.expectError('invalid-email-address', 't:form.email.validation.invalid');
                await validator.expectNoError('validEmail@domain.com');
                done();
            });

            it('should validate password input value', async (done) => {
                const [ { passwordInput } ] = renderSignupPageInMockContext();
                const validator = new InputValidationHelper(passwordInput, '#signup-password-input-helper-text.Mui-error');
                await validator.expectError('', 't:form.password.validation.required');
                await validator.expectError('bad', 't:form.password.validation.tooShort');
                await validator.expectNoError('better password');
                done();
            });

            it('should validate password confirmation input value', async (done) => {
                const [ { passwordInput, passwordConfirmationInput } ] = renderSignupPageInMockContext();

                const passwordValue = 'first password';
                await changeInputValue(passwordInput, passwordValue);

                const validator = new InputValidationHelper(passwordConfirmationInput, '#signup-password-confirmation-input-helper-text.Mui-error');
                await validator.expectError('', 't:form.password.validation.passwordsNotMatch');
                await validator.expectError('not equal', 't:form.password.validation.passwordsNotMatch');
                await validator.expectNoError(passwordValue);
                done();
            });

        });

        it('should successfully sign up and navigate to projects page', async (done) => {
            const history = createMemoryHistory();
            const mockResponse = mockResponseGenerator.success();
            const [ elements ] = renderSignupPageInMockContext({ history, mockResponses: [ mockResponse ] });

            await fillAndSubmitForm(elements, mockResponse);

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
                query: LocalStateDocument,
                data: {
                    localState: {
                        __typename: 'LocalState',
                        accessToken: mockResponse.result.data.register.accessToken,
                    },
                },
            });
            done();
        });

        it('should display information about not available email', async (done) => {
            const history = createMemoryHistory();
            const mockResponses = [ mockResponseGenerator.emailNotAvailable() ];
            const [ elements ] = renderSignupPageInMockContext({ history, mockResponses });

            await fillAndSubmitForm(elements, mockResponses[ 0 ]);

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
            const mockResponses = [ mockResponseGenerator.networkError() ];
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const [ elements ] = renderSignupPageInMockContext({ history, mockResponses, mockSnackbars });

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
