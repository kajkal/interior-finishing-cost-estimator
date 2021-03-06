import React from 'react';
import { GraphQLError } from 'graphql';
import { Route, Routes } from 'react-router-dom';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { TokenVerifierSpy } from '../../../__utils__/spies-managers/TokenVerifierSpy';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { generator } from '../../../__utils__/generator';

import { MutationResetPasswordArgs, ResetPasswordDocument, ResetPasswordMutation, ResetPasswordMutationVariables } from '../../../../graphql/generated-types';
import { PasswordResetPage } from '../../../../code/components/pages/password-reset/PasswordResetPage';
import { nav } from '../../../../code/config/nav';


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
                <Routes>
                    <Route path='/'>
                        <PasswordResetPage />
                    </Route>
                </Routes>
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get passwordInput() {
            return screen.getByLabelText('t:form.newPassword.label', { selector: 'input' });
        }
        static get passwordConfirmationInput() {
            return screen.getByLabelText('t:form.newPasswordConfirmation.label', { selector: 'input' });
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
        renderInMockContext({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
        userEvent.click(ViewUnderTest.signupPageLink);
        expect(screen.getByTestId('location')).toHaveTextContent(nav.signup());
    });

    describe('invalid token search param', () => {

        const invalidPaths = [ '/', '/?notToken=value', '/?token=invalid_token' ];

        invalidPaths.forEach((path: string) => {
            it(`should redirect to forgot password page and display alert about invalid token for '${path}'`, async () => {
                renderInMockContext({ initialEntries: [ path ] });

                // verify if navigation occurred
                expect(screen.getByTestId('location')).toHaveTextContent(nav.forgotPassword());

                // verify if toast is visible
                const toast = await screen.findByTestId('MockToast');
                expect(toast).toHaveClass('error');
                expect(toast).toHaveTextContent('t:passwordResetPage.invalidPasswordResetToken');
            });
        });

        it(`should redirect to forgot password page and display alert about expired token`, async () => {
            renderInMockContext({ initialEntries: [ `/?token=${expiredPasswordResetToken}` ] });

            // verify if navigation occurred
            expect(screen.getByTestId('location')).toHaveTextContent(nav.forgotPassword());

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:passwordResetPage.expiredPasswordResetToken:{"date":"6/12/2020, 4:35 PM"}');
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
                    } as ResetPasswordMutationVariables,
                },
                result: {
                    data: {
                        resetPassword: true,
                    } as ResetPasswordMutation,
                },
            }),
            invalidPasswordResetToken: () => ({
                request: {
                    query: ResetPasswordDocument,
                    variables: {
                        token: validPasswordResetToken, // although token is valid server believes otherwise (for test sake)
                        password: generator.string({ length: 8 }),
                    } as ResetPasswordMutationVariables,
                },
                result: {
                    data: null,
                    errors: [
                        new GraphQLError('INVALID_PASSWORD_RESET_TOKEN'),
                    ],
                },
            }),
            expiredPasswordResetToken: () => ({
                request: {
                    query: ResetPasswordDocument,
                    variables: {
                        token: validPasswordResetToken, // although token is valid server believes otherwise (for test sake)
                        password: generator.string({ length: 8 }),
                    } as ResetPasswordMutationVariables,
                },
                result: {
                    data: null,
                    errors: [
                        new GraphQLError(
                            'EXPIRED_PASSWORD_RESET_TOKEN',
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            { expiredAt: '2020-06-13T16:45:00.000Z' },
                        ),
                    ],
                },
            }),
        };

        describe('validation', () => {

            it('should validate password input value', async () => {
                renderInMockContext({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
                await TextFieldController.from(ViewUnderTest.passwordInput)
                    .type('').expectError('t:form.password.validation.required')
                    .type('a'.repeat(5)).expectError('t:form.password.validation.tooShort')
                    .type('a'.repeat(6)).expectNoError()
                    .paste('a'.repeat(50)).expectNoError()
                    .paste('a'.repeat(51)).expectError('t:form.password.validation.tooLong');
            });

            it('should validate password confirmation input value', async () => {
                renderInMockContext({ initialEntries: [ `/?token=${validPasswordResetToken}` ] });
                const passwordValue = 'first password';
                await extendedUserEvent.type(ViewUnderTest.passwordInput, passwordValue);
                await TextFieldController.from(ViewUnderTest.passwordConfirmationInput)
                    .type(passwordValue).expectNoError()
                    .type('').expectError('t:form.newPasswordConfirmation.validation.passwordsNotMatch')
                    .type('not equal').expectError('t:form.newPasswordConfirmation.validation.passwordsNotMatch');
            });

        });

        it('should successfully reset password and navigate to login page', async () => {
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({
                mockResponses: [ mockResponse ],
                initialEntries: [ `/?token=${validPasswordResetToken}` ],
            });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(nav.login()));

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('success');
            expect(toast).toHaveTextContent('t:passwordResetPage.passwordResetSuccess');
        });

        it('should display alert about invalid token and navigate to forgot password page', async () => {
            const mockResponse = mockResponseGenerator.invalidPasswordResetToken();
            renderInMockContext({
                mockResponses: [ mockResponse ],
                initialEntries: [ `/?token=${validPasswordResetToken}` ],
            });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(nav.forgotPassword()));

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:passwordResetPage.invalidPasswordResetToken');
        });

        it('should display alert about expired token and navigate to forgot password page', async () => {
            const mockResponse = mockResponseGenerator.expiredPasswordResetToken();
            renderInMockContext({
                mockResponses: [ mockResponse ],
                initialEntries: [ `/?token=${validPasswordResetToken}` ],
            });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(nav.forgotPassword()));

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:passwordResetPage.expiredPasswordResetToken:{"date":"6/13/2020, 4:45 PM"}');
        });

    });

});
