import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';

import { DeleteRoomDocument, DeleteRoomMutation, DeleteRoomMutationVariables, Project, ProjectDetailedDataFragment, Room, RoomDataFragment, RoomType } from '../../../../graphql/generated-types';
import { roomDeleteModalAtom } from '../../../../code/components/modals/room-delete/roomDeleteModalAtom';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { RoomDeleteModal } from '../../../../code/components/modals/room-delete/RoomDeleteModal';


describe('RoomDeleteModal component', () => {

    const sampleRoom: RoomDataFragment = {
        __typename: 'Room',
        id: 'kitchen',
        type: RoomType.KITCHEN,
        name: 'Kitchen',
        floor: null,
        wall: null,
        ceiling: null,
        products: null,
        inquiries: null,
    };
    const sampleProject: ProjectDetailedDataFragment = {
        __typename: 'Project',
        slug: 'sample-project',
        name: 'Sample project',
        location: null,
        files: [],
        rooms: [ sampleRoom ],
    };

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(roomDeleteModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        roomData: sampleRoom,
                        projectData: sampleProject,
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <RoomDeleteModal />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleProject)! ]: sampleProject,
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:project.deleteRoomModal.title:{"roomName":"${sampleRoom.name}"}`);
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get deleteButton() {
            return screen.getByRole('button', { name: 't:form.common.delete' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
        }
    }

    it('should close modal on cancel button click', async () => {
        renderInMockContext();

        // verify if modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        ViewUnderTest.openModal();

        // verify if modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify if modal is again not visible
        await waitForElementToBeRemoved(ViewUnderTest.modal);
    });

    describe('room delete form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: DeleteRoomDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        roomId: sampleRoom.id,
                    } as DeleteRoomMutationVariables,
                },
                result: {
                    data: {
                        deleteRoom: true,
                    } as DeleteRoomMutation,
                },
            }),
        };

        it('should successfully delete room and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const projectCacheRecordKey = cache.identify(sampleProject)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    rooms: [ sampleRoom ],
                },
            });

            ViewUnderTest.openModal();
            userEvent.click(ViewUnderTest.deleteButton);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    rooms: [],
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
