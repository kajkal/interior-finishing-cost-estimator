import React from 'react';
import { GraphQLError } from 'graphql';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { ChangePasswordDocument, ChangePasswordMutation, ChangePasswordMutationVariables } from '../../../../graphql/generated-types';
import { ChangePasswordForm } from '../../../../code/components/pages/settings/ChangePasswordForm';


describe('ChangePasswordForm component', () => {

    const sampleUser = generator.user({ email: 'current-email@domain.com' });

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <ChangePasswordForm />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get currentPasswordInput() {
            return screen.getByLabelText('t:form.currentPassword.label', { selector: 'input' });
        }
        static get newPasswordInput() {
            return screen.getByLabelText('t:form.newPassword.label', { selector: 'input' });
        }
        static get newPasswordConfirmationInput() {
            return screen.getByLabelText('t:form.newPasswordConfirmation.label', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:user.settings.changePassword' });
        }
        static async fillAndSubmitForm(data: ChangePasswordMutationVariables) {
            await TextFieldController.from(ViewUnderTest.currentPasswordInput).type(data.currentPassword);
            await TextFieldController.from(ViewUnderTest.newPasswordInput).type(data.newPassword);
            await TextFieldController.from(ViewUnderTest.newPasswordConfirmationInput).type(data.newPassword);
            userEvent.click(ViewUnderTest.submitButton);
        }
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ChangePasswordDocument,
                variables: {
                    currentPassword: 'current password',
                    newPassword: 'new password',
                } as ChangePasswordMutationVariables,
            },
            result: {
                data: {
                    changePassword: true,
                } as ChangePasswordMutation,
            },
        }),
        invalidCurrentPassword: () => ({
            request: {
                query: ChangePasswordDocument,
                variables: {
                    currentPassword: 'current password',
                    newPassword: 'new password',
                } as ChangePasswordMutationVariables,
            },
            result: {
                data: null,
                errors: [
                    new GraphQLError('INVALID_CURRENT_PASSWORD'),
                ],
            },
        }),
    };

    describe('validation', () => {

        it('should validate current password input value', async () => {
            renderInMockContext();
            await TextFieldController.from(ViewUnderTest.currentPasswordInput)
                .type('').expectError('t:form.password.validation.required')
                .type('a'.repeat(5)).expectError('t:form.password.validation.tooShort')
                .type('a'.repeat(51)).expectError('t:form.password.validation.tooLong')
                .type('a'.repeat(6)).expectNoError()
                .type('a'.repeat(50)).expectNoError();
        });

        it('should validate new password input value', async () => {
            renderInMockContext();
            await TextFieldController.from(ViewUnderTest.newPasswordInput)
                .type('').expectError('t:form.password.validation.required')
                .type('a'.repeat(5)).expectError('t:form.password.validation.tooShort')
                .type('a'.repeat(51)).expectError('t:form.password.validation.tooLong')
                .type('a'.repeat(6)).expectNoError()
                .type('a'.repeat(50)).expectNoError();
        });

        it('should validate current password input value', async () => {
            renderInMockContext();
            const passwordValue = 'first password';
            await TextFieldController.from(ViewUnderTest.newPasswordInput).type(passwordValue);
            await TextFieldController.from(ViewUnderTest.newPasswordConfirmationInput)
                .type('').expectError('t:form.newPasswordConfirmation.validation.passwordsNotMatch')
                .type('not equal').expectError('t:form.newPasswordConfirmation.validation.passwordsNotMatch')
                .type(passwordValue).expectNoError();
        });

    });

    it('should successfully change password', async () => {
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ] });
        await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('success');
        expect(toast).toHaveTextContent('t:user.settings.passwordChangeSuccess');

        // verify if form was cleared
        expect(ViewUnderTest.currentPasswordInput).toHaveValue('');
        expect(ViewUnderTest.newPasswordInput).toHaveValue('');
        expect(ViewUnderTest.newPasswordConfirmationInput).toHaveValue('');
    });

    it('should display information about invalid current password', async () => {
        const mockResponse = mockResponseGenerator.invalidCurrentPassword();
        renderInMockContext({ mockResponses: [ mockResponse ] });
        await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

        // verify if current password field is mark as invalid and error message is displayed
        await waitFor(() => expect(ViewUnderTest.currentPasswordInput).toBeInvalid());
        expect(ViewUnderTest.currentPasswordInput).toHaveDescription('t:user.settings.incorrectCurrentPassword');
    });

});
