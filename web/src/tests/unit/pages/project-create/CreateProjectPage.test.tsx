import React from 'react';
import { gql } from '@apollo/client';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { InputValidator } from '../../../__utils__/InputValidator';
import { generator } from '../../../__utils__/generator';

import { CreateProjectDocument, CreateProjectMutation, CreateProjectMutationVariables, MutationCreateProjectArgs, Project, User } from '../../../../graphql/generated-types';
import { UnauthorizedError } from '../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { CreateProjectPage } from '../../../../code/components/pages/project-create/CreateProjectPage';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { nav } from '../../../../code/config/nav';


describe('CreateProjectPage component', () => {

    const sampleUser: Pick<User, '__typename' | 'slug' | 'projects'> = {
        __typename: 'User',
        slug: 'sample-user',
        projects: [],
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <CreateProjectPage />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get projectNameInput() {
            return screen.getByLabelText('t:form.projectName.label', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:createProjectPage.createProject' });
        }
        static async fillAndSubmitForm(data: MutationCreateProjectArgs) {
            await extendedUserEvent.type(this.projectNameInput, data.name);
            userEvent.click(this.submitButton);
        }
    }

    describe('create new project form', () => {

        const UserProjectsFragment = gql`
            fragment UserProjects on User {
                projects { id, slug, name }
            }
        `;

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: CreateProjectDocument,
                    variables: {
                        name: 'Apartment renovation',
                    } as CreateProjectMutationVariables,
                },
                result: {
                    data: {
                        createProject: {
                            __typename: 'Project',
                            id: 'project-id',
                            slug: 'apartment-renovation',
                            name: 'Apartment renovation',
                        },
                    } as CreateProjectMutation,
                },
            }),
            unauthorized: () => ({
                request: {
                    query: CreateProjectDocument,
                    variables: {
                        name: generator.sentence({ words: 3 }),
                    } as CreateProjectMutationVariables,
                },
                error: new UnauthorizedError('SESSION_EXPIRED'),
            }),
            networkError: () => ({
                request: {
                    query: CreateProjectDocument,
                    variables: {
                        name: generator.sentence({ words: 3 }),
                    } as CreateProjectMutationVariables,
                },
                error: new Error('network error'),
            }),
        };

        describe('validation', () => {

            it('should validate projectName input value', async () => {
                renderInMockContext();
                await InputValidator.basedOn(ViewUnderTest.projectNameInput)
                    .expectError('', 't:form.projectName.validation.required')
                    .expectError('aa', 't:form.projectName.validation.tooShort')
                    .expectError('a'.repeat(51), 't:form.projectName.validation.tooLong')
                    .expectNoError('valid project name');
            });

        });

        it('should successfully create new project and navigate to new project page', async () => {
            const cache = initApolloCache();
            cache.restore({ [ cache.identify(sampleUser)! ]: sampleUser });
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if navigation occurred
            await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(nav.project('apartment-renovation')));

            // verify if user cache was updated with new project
            const user = cache.readFragment<Pick<User, 'projects'>>({
                fragment: UserProjectsFragment,
                id: cache.identify(sampleUser),
            });
            expect(user?.projects).toBeDefined();
            expect(user?.projects).toEqual([ mockResponse.result.data.createProject ]);
        });

        it('should display notification about expired session', async () => {
            const mockResponse = mockResponseGenerator.unauthorized();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.sessionExpired');
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
