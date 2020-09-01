import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { generator } from '../../../__utils__/generator';

import { MutationSendPasswordResetInstructionsArgs, SendPasswordResetInstructionsDocument, SendPasswordResetInstructionsMutation, SendPasswordResetInstructionsMutationVariables } from '../../../../graphql/generated-types';
import { PasswordResetRequestPage } from '../../../../code/components/pages/password-reset/PasswordResetRequestPage';
import { nav } from '../../../../code/config/nav';


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
        renderInMockContext();
        userEvent.click(ViewUnderTest.loginPageLink);
        expect(screen.getByTestId('location')).toHaveTextContent(nav.login());
    });

    describe('send password reset instructions form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: SendPasswordResetInstructionsDocument,
                    variables: {
                        email: generator.email(),
                    } as SendPasswordResetInstructionsMutationVariables,
                },
                result: {
                    data: {
                        sendPasswordResetInstructions: true,
                    } as SendPasswordResetInstructionsMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate email input value', async () => {
                renderInMockContext();
                await TextFieldController.from(ViewUnderTest.emailInput)
                    .type('').expectError('t:form.email.validation.required')
                    .type('invalid-email-address').expectError('t:form.email.validation.invalid')
                    .type('validEmail@domain.com').expectNoError();
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

    });

});
