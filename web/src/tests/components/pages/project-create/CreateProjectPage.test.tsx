import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { LocationFieldController } from '../../../__utils__/field-controllers/LocationFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { CreateProjectDocument, CreateProjectMutation, CreateProjectMutationVariables, MutationCreateProjectArgs, Project } from '../../../../graphql/generated-types';
import { CreateProjectPage } from '../../../../code/components/pages/project-create/CreateProjectPage';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { nav } from '../../../../code/config/nav';


describe('CreateProjectPage component', () => {

    const sampleUser = generator.user({ projects: [] });

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
        static get projectLocationInput() {
            return screen.getByLabelText(/t:form.projectLocation.label/, { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:project.createProject' });
        }
        static async fillAndSubmitForm(data: MutationCreateProjectArgs) {
            await TextFieldController.from(ViewUnderTest.projectNameInput).type(data.name);
            await LocationFieldController.from(ViewUnderTest.projectLocationInput).selectLocation(data.location);

            userEvent.click(this.submitButton);
        }
    }

    describe('create new project form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: CreateProjectDocument,
                    variables: {
                        name: 'Apartment renovation',
                        location: null,
                    } as CreateProjectMutationVariables,
                },
                result: {
                    data: {
                        createProject: {
                            __typename: 'Project',
                            slug: 'apartment-renovation',
                            name: 'Apartment renovation',
                        },
                    } as CreateProjectMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate projectName input value', async () => {
                renderInMockContext();
                await TextFieldController.from(ViewUnderTest.projectNameInput)
                    .type('').expectError('t:form.projectName.validation.required')
                    .type('a'.repeat(2)).expectError('t:form.projectName.validation.tooShort')
                    .type('a'.repeat(3)).expectNoError()
                    .paste('a'.repeat(50)).expectNoError()
                    .paste('a'.repeat(51)).expectError('t:form.projectName.validation.tooLong');
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

            // verify updated cache
            const createdProject = mockResponse.result.data.createProject;
            const newProjectCacheKey = cache.identify(createdProject)!;
            expect(cache.extract()).toEqual({
                [ newProjectCacheKey ]: createdProject, // <- created project record
                [ cache.identify(sampleUser)! ]: {
                    ...sampleUser,
                    projects: [ { __ref: newProjectCacheKey } ], // <- project lists updated with created project ref
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
