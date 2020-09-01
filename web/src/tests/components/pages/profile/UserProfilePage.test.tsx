import React from 'react';
import { GraphQLError } from 'graphql';
import { Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { muteConsole } from '../../../__utils__/mocks/muteConsole';

import { ProfileDocument, ProfileQuery, ProfileQueryVariables } from '../../../../graphql/generated-types';
import { UserProfilePage } from '../../../../code/components/pages/profile/UserProfilePage';


describe('UserProfilePage component', () => {

    const consoleErrorMock = muteConsole('error', (message) => (
        message.startsWith('unhandled apollo error')
    ));

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ProfileDocument,
                variables: {
                    userSlug: 'sample-user',
                } as ProfileQueryVariables,
            },
            result: {
                data: {
                    profile: {
                        __typename: 'Profile',
                        userSlug: 'sample-user',
                        name: 'Sample Name',
                        avatar: null,
                        description: null,
                        location: {
                            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                            main: 'Kraków',
                            secondary: 'Poland',
                            lat: 50,
                            lng: 20,
                        },
                    },
                } as ProfileQuery,
            },
        }),
        userNotFoundError: () => ({
            request: {
                query: ProfileDocument,
                variables: {
                    userSlug: 'sample-user',
                } as ProfileQueryVariables,
            },
            result: {
                data: null,
                errors: [
                    new GraphQLError('USER_NOT_FOUND'),
                ],
            },
        }),
    };

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <Routes>
                    <Route path=':userSlug' element={<UserProfilePage />} />
                </Routes>
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get locationLink() {
            return screen.getByRole('button', { name: `Kraków, Poland` });
        }
    }

    it('should display user profile when user profile data is accessible', async () => {
        renderInMockContext({
            initialEntries: [ '/sample-user' ],
            mockResponses: [ mockResponseGenerator.success() ],
        });

        // verify if user profile is visible
        expect(await screen.findByText('Sample Name')).toBeVisible();

        // verify location link
        expect(ViewUnderTest.locationLink).toBeVisible();
        expect(ViewUnderTest.locationLink).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=50,20&query_place_id=ChIJ0RhONcBEFkcRv4pHdrW2a7Q');
    });

    it('should display not found page when user profile data is not accessible', async () => {
        renderInMockContext({
            initialEntries: [ '/sample-user' ],
            mockResponses: [ mockResponseGenerator.userNotFoundError() ],
        });

        // verify if not found page is visible
        expect(await screen.findByText('404')).toBeVisible();

        // verify if 'unhandled' error was logged
        // this error is handled globally and in production should be already handled at this point
        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    });

});
