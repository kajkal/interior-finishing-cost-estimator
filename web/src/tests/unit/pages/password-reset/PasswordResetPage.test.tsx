import React from 'react';
import { GraphQLError } from 'graphql';
import { Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { PageContextMocks, PageMockContextProvider } from '../../../__utils__/PageMockContextProvider';
import { TokenVerifierSpy } from '../../../__utils__/spies-managers/TokenVerifierSpy';
import { changeInputValue } from '../../../__utils__/changeInputValue';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { MutationResetPasswordArgs, ResetPasswordDocument } from '../../../../graphql/generated-types';
import { PasswordResetPage } from '../../../../code/components/pages/password-reset/PasswordResetPage';
import { routes } from '../../../../code/config/routes';


describe('PasswordResetPage component', () => {

    const validPasswordResetToken = 'VALID_TOKEN';
    const expiredPasswordResetToken = 'EXPIRED_TOKEN';

    beforeEach(() => {
        TokenVerifierSpy.setupSpiesAndMockImplementations();
        TokenVerifierSpy.create.mockImplementation((tokenToVerify?: string | null) => {
            switch (tokenToVerify) {
                case validPasswordResetToken:
                    return TokenVerifierSpy.validInstance;
                case expiredPasswordResetToken:
                    throw new TokenExpiredError('TOKEN_EXPIRED', new Date(1591979700000)); // 2020-06-12 16:35
                default:
                    throw new JsonWebTokenError('INVALID_TOKEN_PAYLOAD');
            }
        });
    });

    class PasswordResetPageTestFixture {
        private constructor(public renderResult: RenderResult) {}
        static renderInMockContext(mocks?: PageContextMocks) {
            const renderResult = render(
                <PageMockContextProvider mocks={mocks}>
                    <Route path='/' exact>
                        <PasswordResetPage />
                    </Route>
                </PageMockContextProvider>,
            );
            return new this(renderResult);
        }
        get passwordInput() {
            return this.renderResult.getByLabelText('t:passwordResetPage.passwordLabel', { selector: 'input' }) as HTMLInputElement;
        }
        get passwordConfirmationInput() {
            return this.renderResult.getByLabelText('t:passwordResetPage.passwordConfirmationLabel', { selector: 'input' }) as HTMLInputElement;
        }
        get submitButton() {
            return this.renderResult.getByRole('button', { name: 't:passwordResetPage.resetPassword' }) as HTMLButtonElement;
        }
        get signupPageLink() {
            return this.renderResult.getByText('t:passwordResetPage.signUpLink', { selector: 'a' }) as HTMLAnchorElement;
        }
        async fillAndSubmitForm(data: MutationResetPasswordArgs) {
            await changeInputValue(this.passwordInput, data.password);
            await changeInputValue(this.passwordConfirmationInput, data.password);
            fireEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'sign up\' link click', () => {
        const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
        const { signupPageLink } = PasswordResetPageTestFixture.renderInMockContext({ history });

        fireEvent.click(signupPageLink);

        expect(history.location.pathname).toMatch(routes.signup());
    });

    describe('invalid token search param', () => {

        const invalidPaths = [ '/', '/?notToken=value', '/?token=invalid_token' ];

        invalidPaths.forEach((path: string) => {
            it(`should redirect to forgot password page and display alert about invalid token for '${path}'`, () => {
                const history = createMemoryHistory({ initialEntries: [ path ] });
                const mockSnackbars = { errorSnackbar: jest.fn() };
                PasswordResetPageTestFixture.renderInMockContext({ history, mockSnackbars });

                // verify if navigation occurred
                expect(history.location.pathname).toMatch(routes.forgotPassword());

                // verify if error alert was displayed
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:passwordResetPage.invalidPasswordResetToken');
            });
        });

        it(`should redirect to forgot password page and display alert about expired token`, () => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${expiredPasswordResetToken}` ] });
            const mockSnackbars = { errorSnackbar: jest.fn() };
            PasswordResetPageTestFixture.renderInMockContext({ history, mockSnackbars });

            // verify if navigation occurred
            expect(history.location.pathname).toMatch(routes.forgotPassword());

            // verify if error alert was displayed
            const expectedErrorMessage = 't:passwordResetPage.expiredPasswordResetToken:{"date":"6/12/2020, 6:35 PM"}';
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith(expectedErrorMessage);
        });

    });

    describe('password reset form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: ResetPasswordDocument,
                    variables: {
                        token: validPasswordResetToken,
                        password: generator.string({ length: 8 }),
                    },
                },
                result: {
                    data: {
                        resetPassword: true,
                    },
                },
            }),
            invalidPasswordResetToken: () => ({
                request: {
                    query: ResetPasswordDocument,
                    variables: {
                        token: validPasswordResetToken, // although token is valid server believes otherwise (for test sake)
                        password: generator.string({ length: 8 }),
                    },
                },
                result: {
                    data: null,
                    errors: [
                        { message: 'INVALID_PASSWORD_RESET_TOKEN' } as unknown as GraphQLError,
                    ],
                },
            }),
            expiredPasswordResetToken: () => ({
                request: {
                    query: ResetPasswordDocument,
                    variables: {
                        token: validPasswordResetToken, // although token is valid server believes otherwise (for test sake)
                        password: generator.string({ length: 8 }),
                    },
                },
                result: {
                    data: null,
                    errors: [
                        {
                            message: 'EXPIRED_PASSWORD_RESET_TOKEN',
                            extensions: {
                                expiredAt: '2020-06-13T16:45:00.000Z',
                            },
                        } as unknown as GraphQLError,
                    ],
                },
            }),
            networkError: () => ({
                request: {
                    query: ResetPasswordDocument,
                    variables: {
                        token: validPasswordResetToken,
                        password: generator.string({ length: 8 }),
                    },
                },
                error: new Error('network error'),
            }),
        };

        describe('validation', () => {

            it('should validate password input value', (done) => {
                const { passwordInput } = PasswordResetPageTestFixture.renderInMockContext({
                    history: createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] }),
                });
                InputValidator.basedOn(passwordInput, '#password-reset-password-input-helper-text.Mui-error')
                    .expectError('', 't:form.password.validation.required')
                    .expectError('bad', 't:form.password.validation.tooShort')
                    .expectNoError('better password')
                    .finish(done);
            });

            it('should validate password confirmation input value', async (done) => {
                const { passwordInput, passwordConfirmationInput } = PasswordResetPageTestFixture.renderInMockContext({
                    history: createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] }),
                });
                const passwordValue = 'first password';
                await changeInputValue(passwordInput, passwordValue);
                await InputValidator.basedOn(passwordConfirmationInput, '#password-reset-password-confirmation-input-helper-text.Mui-error')
                    .expectError('', 't:form.password.validation.passwordsNotMatch')
                    .expectError('not equal', 't:form.password.validation.passwordsNotMatch')
                    .expectNoError(passwordValue);
                done();
            });

        });

        it('should successfully reset password and navigate to login page', async (done) => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
            const mockResponse = mockResponseGenerator.success();
            const mockSnackbars = { successSnackbar: jest.fn() };
            const pageTestFixture = PasswordResetPageTestFixture.renderInMockContext({
                history,
                mockResponses: [ mockResponse ],
                mockSnackbars,
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toMatch(routes.login()));

            // verify if success alert was displayed
            expect(mockSnackbars.successSnackbar).toHaveBeenCalledTimes(1);
            expect(mockSnackbars.successSnackbar).toHaveBeenCalledWith('t:passwordResetPage.passwordResetSuccess');
            done();
        });

        it('should display alert about invalid token and navigate to forgot password page', async (done) => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
            const mockResponse = mockResponseGenerator.invalidPasswordResetToken();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const pageTestFixture = PasswordResetPageTestFixture.renderInMockContext({
                history,
                mockResponses: [ mockResponse ],
                mockSnackbars,
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toMatch(routes.forgotPassword()));

            // verify if error alert was displayed
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:passwordResetPage.invalidPasswordResetToken');
            done();
        });

        it('should display alert about expired token and navigate to forgot password page', async (done) => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
            const mockResponse = mockResponseGenerator.expiredPasswordResetToken();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const pageTestFixture = PasswordResetPageTestFixture.renderInMockContext({
                history,
                mockResponses: [ mockResponse ],
                mockSnackbars,
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toMatch(routes.forgotPassword()));

            // verify if error alert was displayed
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:passwordResetPage.expiredPasswordResetToken:{"date":"6/13/2020, 6:45 PM"}');
            done();
        });

        it('should display alert about network error', async (done) => {
            const mockResponse = mockResponseGenerator.networkError();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const pageTestFixture = PasswordResetPageTestFixture.renderInMockContext({
                history: createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] }),
                mockResponses: [ mockResponse ],
                mockSnackbars,
            });

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

            // verify if error alert was displayed
            await waitFor(() => {
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
                expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:error.networkError');
            });
            done();
        });

    });

});
