import React from 'react';
import { GraphQLError } from 'graphql';
import { Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { TokenVerifierSpy } from '../../../__utils__/spies-managers/TokenVerifierSpy';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
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

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <Route path='/' exact>
                    <PasswordResetPage />
                </Route>
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get passwordInput() {
            return screen.getByLabelText('t:passwordResetPage.passwordLabel', { selector: 'input' });
        }
        static get passwordConfirmationInput() {
            return screen.getByLabelText('t:passwordResetPage.passwordConfirmationLabel', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:passwordResetPage.resetPassword' });
        }
        static get signupPageLink() {
            return screen.getByText('t:passwordResetPage.signUpLink', { selector: 'a' });
        }
        static async fillAndSubmitForm(data: MutationResetPasswordArgs) {
            await extendedUserEvent.type(this.passwordInput, data.password);
            await extendedUserEvent.type(this.passwordConfirmationInput, data.password);
            userEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'sign up\' link click', () => {
        const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
        renderInMockContext({ history });

        userEvent.click(ViewUnderTest.signupPageLink);

        expect(history.location.pathname).toBe(routes.signup());
    });

    describe('invalid token search param', () => {

        const invalidPaths = [ '/', '/?notToken=value', '/?token=invalid_token' ];

        invalidPaths.forEach((path: string) => {
            it(`should redirect to forgot password page and display alert about invalid token for '${path}'`, async () => {
                const history = createMemoryHistory({ initialEntries: [ path ] });
                renderInMockContext({ history });

                // verify if navigation occurred
                expect(history.location.pathname).toBe(routes.forgotPassword());

                // verify if toast is visible
                const toast = await screen.findByTestId('MockToast');
                expect(toast).toHaveClass('error');
                expect(toast).toHaveTextContent('t:passwordResetPage.invalidPasswordResetToken');
            });
        });

        it(`should redirect to forgot password page and display alert about expired token`, async () => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${expiredPasswordResetToken}` ] });
            renderInMockContext({ history });

            // verify if navigation occurred
            expect(history.location.pathname).toBe(routes.forgotPassword());

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:passwordResetPage.expiredPasswordResetToken:{"date":"6/12/2020, 6:35 PM"}');
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

            it('should validate password input value', async () => {
                renderInMockContext({
                    history: createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] }),
                });
                await InputValidator.basedOn(ViewUnderTest.passwordInput)
                    .expectError('', 't:form.password.validation.required')
                    .expectError('bad', 't:form.password.validation.tooShort')
                    .expectNoError('better password');
            });

            it('should validate password confirmation input value', async () => {
                renderInMockContext({
                    history: createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] }),
                });
                const passwordValue = 'first password';
                await extendedUserEvent.type(ViewUnderTest.passwordInput, passwordValue);
                await InputValidator.basedOn(ViewUnderTest.passwordConfirmationInput)
                    .expectError('', 't:form.password.validation.passwordsNotMatch')
                    .expectError('not equal', 't:form.password.validation.passwordsNotMatch')
                    .expectNoError(passwordValue);
            });

        });

        it('should successfully reset password and navigate to login page', async () => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ history, mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toBe(routes.login()));

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('success');
            expect(toast).toHaveTextContent('t:passwordResetPage.passwordResetSuccess');
        });

        it('should display alert about invalid token and navigate to forgot password page', async () => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
            const mockResponse = mockResponseGenerator.invalidPasswordResetToken();
            renderInMockContext({ history, mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toBe(routes.forgotPassword()));

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:passwordResetPage.invalidPasswordResetToken');
        });

        it('should display alert about expired token and navigate to forgot password page', async () => {
            const history = createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
            const mockResponse = mockResponseGenerator.expiredPasswordResetToken();
            renderInMockContext({ history, mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(history.location.pathname).toBe(routes.forgotPassword()));

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:passwordResetPage.expiredPasswordResetToken:{"date":"6/13/2020, 6:45 PM"}');
        });

        it('should display alert about network error', async () => {
            const mockResponse = mockResponseGenerator.networkError();
            renderInMockContext({
                history: createMemoryHistory({ initialEntries: [ `/?token=${validPasswordResetToken}` ] }),
                mockResponses: [ mockResponse ],
            });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.networkError');
        });

    });

});
