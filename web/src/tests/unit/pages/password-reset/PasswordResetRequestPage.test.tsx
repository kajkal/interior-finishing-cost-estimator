import React from 'react';
import { createMemoryHistory } from 'history';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { PageContextMocks, PageMockContextProvider } from '../../../__utils__/PageMockContextProvider';
import { changeInputValue } from '../../../__utils__/changeInputValue';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { MutationSendPasswordResetInstructionsArgs, SendPasswordResetInstructionsDocument } from '../../../../graphql/generated-types';
import { PasswordResetRequestPage } from '../../../../code/components/pages/password-reset/PasswordResetRequestPage';
import { routes } from '../../../../code/config/routes';


describe('PasswordResetRequestPage component', () => {

    class PasswordResetRequestPageTestFixture {
        private constructor(public renderResult: RenderResult) {}
        static renderInMockContext(mocks?: PageContextMocks) {
            const renderResult = render(
                <PageMockContextProvider mocks={mocks}>
                    <PasswordResetRequestPage />
                </PageMockContextProvider>,
            );
            return new this(renderResult);
        }
        get emailInput() {
            return this.renderResult.getByLabelText('t:form.email.label', { selector: 'input' }) as HTMLInputElement;
        }
        get submitButton() {
            return this.renderResult.getByRole('button', { name: 't:passwordResetPage.sendResetInstructions' }) as HTMLButtonElement;
        }
        get loginPageLink() {
            return this.renderResult.getByText('t:passwordResetPage.logInLink', { selector: 'a' }) as HTMLAnchorElement;
        }
        async fillAndSubmitForm(data: MutationSendPasswordResetInstructionsArgs) {
            await changeInputValue(this.emailInput, data.email);
            fireEvent.click(this.submitButton);
        }
    }

    it('should navigate to new page on \'log in\' link click', () => {
        const history = createMemoryHistory();
        const { loginPageLink } = PasswordResetRequestPageTestFixture.renderInMockContext({ history });

        fireEvent.click(loginPageLink);

        expect(history.location.pathname).toMatch(routes.login());
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

            it('should validate email input value', (done) => {
                const { emailInput } = PasswordResetRequestPageTestFixture.renderInMockContext();
                InputValidator.basedOn(emailInput, '#password-reset-request-email-input-helper-text.Mui-error')
                    .expectError('', 't:form.email.validation.required')
                    .expectError('invalid-email-address', 't:form.email.validation.invalid')
                    .expectNoError('validEmail@domain.com')
                    .finish(done);
            });

        });

        it('should handle success response and display success message', async (done) => {
            const mockResponse = mockResponseGenerator.success();
            const pageTestFixture = PasswordResetRequestPageTestFixture.renderInMockContext({ mockResponses: [ mockResponse ] });
            const successMessage = `t:passwordResetPage.sendResetInstructionsSuccess:{"email":"${mockResponse.request.variables.email}"}`;

            // verify if success message is not visible
            expect(pageTestFixture.renderResult.queryByText(successMessage)).toBeNull();

            await pageTestFixture.fillAndSubmitForm(mockResponse.request.variables);

            // verify if success message is visible
            await waitFor(() => expect(pageTestFixture.renderResult.queryByText(successMessage)).toBeInTheDocument());
            done();
        });

        it('should display notification about network error', async (done) => {
            const mockResponse = mockResponseGenerator.networkError();
            const mockSnackbars = { errorSnackbar: jest.fn() };
            const pageTestFixture = PasswordResetRequestPageTestFixture.renderInMockContext({
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
