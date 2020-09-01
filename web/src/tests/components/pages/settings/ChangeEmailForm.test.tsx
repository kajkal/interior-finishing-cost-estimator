import React from 'react';
import { GraphQLError } from 'graphql';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';

import { ChangeEmailDocument, ChangeEmailMutation, ChangeEmailMutationVariables, User } from '../../../../graphql/generated-types';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { ChangeEmailForm } from '../../../../code/components/pages/settings/ChangeEmailForm';


describe('ChangeEmailForm component', () => {

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        email: 'current-email@domain.com',
        isEmailAddressConfirmed: true,
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <ChangeEmailForm />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache(user = sampleUser) {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(user)! ]: user,
        });
    }

    class ViewUnderTest {
        static get emailInput() {
            return screen.getByLabelText('t:form.email.label', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:user.settings.changeEmail' });
        }
        static async fillAndSubmitForm(data: ChangeEmailMutationVariables) {
            await TextFieldController.from(ViewUnderTest.emailInput).type(data.email);
            userEvent.click(ViewUnderTest.submitButton);
        }
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ChangeEmailDocument,
                variables: {
                    email: 'new-email@domain.com',
                } as ChangeEmailMutationVariables,
            },
            result: {
                data: {
                    changeEmail: true,
                } as ChangeEmailMutation,
            },
        }),
        emailNotAvailable: () => ({
            request: {
                query: ChangeEmailDocument,
                variables: {
                    email: 'new-email@domain.com',
                } as ChangeEmailMutationVariables,
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

        it('should validate email input value', async () => {
            renderInMockContext();
            await TextFieldController.from(ViewUnderTest.emailInput)
                .type('').expectError('t:form.email.validation.required')
                .type('invalid-email-address').expectError('t:form.email.validation.invalid')
                .type('validEmail@domain.com').expectNoError();
        });

    });

    it('should successfully change email', async () => {
        const cache = initApolloTestCache();
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

        const userCacheRecordKey = cache.identify(sampleUser)!;

        // verify initial cache records
        expect(cache.extract()).toEqual({
            [ userCacheRecordKey ]: {
                ...sampleUser,
                email: 'current-email@domain.com',
                isEmailAddressConfirmed: true,
            },
        });

        await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('success');
        expect(toast).toHaveTextContent('t:user.settings.emailChangeSuccessTitle');
        expect(screen.getByTestId('MockTrans')).toHaveAttribute('data-i18n', 'user.settings.emailChangeSuccessDescription');

        // verify updated cache
        expect(cache.extract()).toEqual({
            [ userCacheRecordKey ]: {
                ...sampleUser,
                email: 'new-email@domain.com',
                isEmailAddressConfirmed: false,
            },
            ROOT_MUTATION: expect.any(Object),
        });
    });

    it('should display information about not available email', async () => {
        const mockResponse = mockResponseGenerator.emailNotAvailable();
        renderInMockContext({ mockResponses: [ mockResponse ] });
        await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

        // verify if email field is mark as invalid and error message is displayed
        await waitFor(() => expect(ViewUnderTest.emailInput).toBeInvalid());
        expect(ViewUnderTest.emailInput).toHaveDescription('t:form.email.validation.notAvailable');
    });

});
