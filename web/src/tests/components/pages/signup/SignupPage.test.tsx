import React from 'react';
import { GraphQLError } from 'graphql';
import { Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { MockSessionChannel } from '../../../__mocks__/code/MockSessionChannel';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { generator } from '../../../__utils__/generator';

import { MutationRegisterArgs, RegisterDocument } from '../../../../graphql/generated-types';
import { SignupPage } from '../../../../code/components/pages/signup/SignupPage';
import { nav } from '../../../../code/config/nav';


describe('SignupPage component', () => {

    const signupPagePath = '/signup-page-test-path';

    beforeEach(() => {
        MockSessionChannel.setupMocks();
        mockUseCurrentUserCachedData.mockReturnValue(undefined);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={{ ...mocks, initialEntries: [ signupPagePath ] }}>
                <Routes>
                    <Route path={signupPagePath}>
                        <SignupPage />
                    </Route>
                </Routes>
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
        renderInMockContext();
        userEvent.click(ViewUnderTest.loginPageLink);
        expect(screen.getByTestId('location')).toHaveTextContent(nav.login());
    });

    it('should navigate to default page if user is already authenticated', () => {
        mockUseCurrentUserCachedData.mockReturnValue({});
        renderInMockContext();
        expect(screen.getByTestId('location')).toHaveTextContent(nav.profile());
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
                            user: { userData: '...' },
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
                        new GraphQLError('EMAIL_NOT_AVAILABLE'),
                    ],
                },
            }),
        };

        describe('validation', () => {

            it('should validate name input value', async () => {
                renderInMockContext();
                await TextFieldController.from(ViewUnderTest.nameInput)
                    .type('').expectError('t:form.name.validation.required')
                    .type('a'.repeat(2)).expectError('t:form.name.validation.tooShort')
                    .type('a'.repeat(3)).expectNoError()
                    .paste('a'.repeat(50)).expectNoError()
                    .paste('a'.repeat(51)).expectError('t:form.name.validation.tooLong');
            });

            it('should validate email input value', async () => {
                renderInMockContext();
                await TextFieldController.from(ViewUnderTest.emailInput)
                    .type('').expectError('t:form.email.validation.required')
                    .type('invalid-email-address').expectError('t:form.email.validation.invalid')
                    .type('validEmail@domain.com').expectNoError();
            });

            it('should validate password input value', async () => {
                renderInMockContext();
                await TextFieldController.from(ViewUnderTest.passwordInput)
                    .type('').expectError('t:form.password.validation.required')
                    .type('a'.repeat(5)).expectError('t:form.password.validation.tooShort')
                    .type('a'.repeat(6)).expectNoError()
                    .paste('a'.repeat(50)).expectNoError()
                    .paste('a'.repeat(51)).expectError('t:form.password.validation.tooLong');
            });

            it('should validate password confirmation input value', async () => {
                renderInMockContext();
                const passwordValue = 'first password';
                await extendedUserEvent.type(ViewUnderTest.passwordInput, passwordValue);
                await TextFieldController.from(ViewUnderTest.passwordConfirmationInput)
                    .type(passwordValue).expectNoError()
                    .type('').expectError('t:form.newPasswordConfirmation.validation.passwordsNotMatch')
                    .type('not equal').expectError('t:form.newPasswordConfirmation.validation.passwordsNotMatch');
            });

        });

        it('should successfully sign up and trigger session login event', async () => {
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if session login event was triggered
            await waitFor(() => expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(1));
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledWith(mockResponse.result.data.register);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('success');
            expect(toast).toHaveTextContent('t:signupPage.signupSuccessTitle');
            expect(screen.getByTestId('MockTrans')).toHaveAttribute('data-i18n', 'signupPage.signupSuccessDescription');
        });

        it('should display information about not available email', async () => {
            const mockResponse = mockResponseGenerator.emailNotAvailable();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if email field is mark as invalid and error message is displayed
            await waitFor(() => expect(ViewUnderTest.emailInput).toBeInvalid());
            expect(ViewUnderTest.emailInput).toHaveDescription('t:form.email.validation.notAvailable');

            // verify if session login event was not triggered
            expect(MockSessionChannel.publishLoginSessionAction).toHaveBeenCalledTimes(0);
        });

    });

});
