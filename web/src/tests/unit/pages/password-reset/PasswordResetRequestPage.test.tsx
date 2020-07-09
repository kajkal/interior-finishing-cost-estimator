import React from 'react';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { MutationSendPasswordResetInstructionsArgs, SendPasswordResetInstructionsDocument } from '../../../../graphql/generated-types';
import { PasswordResetRequestPage } from '../../../../code/components/pages/password-reset/PasswordResetRequestPage';
import { routes } from '../../../../code/config/routes';


describe('PasswordResetRequestPage component', () => {

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <PasswordResetRequestPage />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get emailInput() {
            return screen.getByLabelText('t:form.email.label', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:passwordResetPage.sendResetInstructions' });
        }
        static get loginPageLink() {
            return screen.getByText('t:passwordResetPage.logInLink', { selector: 'a' });
        }
        static async fillAndSubmitForm(data: MutationSendPasswordResetInstructionsArgs) {
            await extendedUserEvent.type(this.emailInput, data.email);
            userEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'log in\' link click', () => {
        const history = createMemoryHistory();
        renderInMockContext({ history });

        userEvent.click(ViewUnderTest.loginPageLink);

        expect(history.location.pathname).toBe(routes.login());
    });

    describe('send password reset instructions form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: SendPasswordResetInstructionsDocument,
                    variables: {
                        email: generator.email(),
                    },
                },
                result: {
                    data: {
                        sendPasswordResetInstructions: true,
                    },
                },
            }),
            networkError: () => ({
                request: {
                    query: SendPasswordResetInstructionsDocument,
                    variables: {
                        email: generator.email(),
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

        });

        it('should handle success response and display success message', async () => {
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ] });

            // verify if success message is not visible
            expect(screen.queryByTestId('MockTrans')).toBeNull();

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if success message is visible
            expect(await screen.findByTestId('MockTrans')).toHaveAttribute('data-i18n', 'passwordResetPage.sendResetInstructionsSuccess');
        });

        it('should display notification about network error', async () => {
            const mockResponse = mockResponseGenerator.networkError();
            renderInMockContext({ mockResponses: [ mockResponse ] });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.networkError');
        });

    });

});
