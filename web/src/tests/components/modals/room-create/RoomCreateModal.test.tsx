/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ProductSelectorController } from '../../../__utils__/field-controllers/ProductSelectorController';
import { RoomTypeFieldController } from '../../../__utils__/field-controllers/RoomTypeFieldController';
import { NumberFieldController } from '../../../__utils__/field-controllers/NumberFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { flushPromises } from '../../../__utils__/extendedUserEvent';

import { CreateRoomDocument, CreateRoomMutation, CreateRoomMutationVariables, Product, Project, RoomType, User } from '../../../../graphql/generated-types';
import { roomCreateModalAtom } from '../../../../code/components/modals/room-create/roomCreateModalAtom';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { RoomCreateModal } from '../../../../code/components/modals/room-create/RoomCreateModal';


describe('RoomCreateModal component', () => {

    const sampleProduct1: Partial<Product> = {
        id: 'sample-product-1',
        name: 'Sample product 1',
        tags: [ 'tag A', 'tag B' ],
    };
    const sampleProduct2: Partial<Product> = {
        id: 'sample-product-2',
        name: 'Sample product 2',
        tags: [ 'tag C' ],
    };

    const sampleUser: Partial<User> = {
        products: [ sampleProduct1, sampleProduct2 ] as Product[],
    };

    const sampleProject: Partial<Project> = {
        __typename: 'Project',
        slug: 'sample-project',
        name: 'Sample project',
        location: null,
        files: [],
        rooms: null,
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(roomCreateModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({ open: true, projectData: { slug: sampleProject.slug! } })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <RoomCreateModal isMobile={false} />
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
            return screen.queryByLabelText('t:project.createRoomModal.title');
        }
        static get roomTypeSelect() {
            return screen.getByLabelText('t:form.roomType.label', { selector: 'input' });
        }
        static get roomNameInput() {
            return screen.getByLabelText('t:form.roomName.label', { selector: 'input' });
        }
        static get roomFloorAreaInput() {
            return screen.getByLabelText(/t:form.roomFloorArea.label/, { selector: 'input' });
        }
        static get roomWallsAreaInput() {
            return screen.getByLabelText(/t:form.roomWallsArea.label/, { selector: 'input' });
        }
        static get roomCeilingAreaInput() {
            return screen.getByLabelText(/t:form.roomCeilingArea.label/, { selector: 'input' });
        }
        static get roomProductSelector() {
            return screen.getByLabelText(/t:form.roomProductSelector.label/, { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:form.common.create' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
        }
        static async fillAndSubmitForm(data: CreateRoomMutationVariables) {
            ViewUnderTest.openModal();

            await RoomTypeFieldController.from(ViewUnderTest.roomTypeSelect).selectRoomType(data.type);
            await TextFieldController.from(ViewUnderTest.roomNameInput).type(data.name);
            await NumberFieldController.from(ViewUnderTest.roomFloorAreaInput).pasteAmount(`${data.floor || ''}`);
            await NumberFieldController.from(ViewUnderTest.roomWallsAreaInput).pasteAmount(`${data.wall || ''}`);
            await NumberFieldController.from(ViewUnderTest.roomCeilingAreaInput).pasteAmount(`${data.ceiling || ''}`);
            await ProductSelectorController.from(ViewUnderTest.roomProductSelector).selectProduct(sampleProduct1, 1);

            userEvent.click(this.submitButton);
        }
    }

    it('should close modal on cancel button click', async () => {
        renderInMockContext();

        // verify if modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        await ViewUnderTest.openModal();

        // verify if modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify if modal is again not visible
        await waitForElementToBeRemoved(ViewUnderTest.modal);
    });

    describe('room create form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: CreateRoomDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        type: RoomType.KITCHEN,
                        name: 'Kitchen',
                        floor: 12,
                        wall: 17.5,
                        ceiling: 12,
                        products: [ { productId: sampleProduct1.id, amount: 1 } ],
                        inquiries: undefined,
                    } as CreateRoomMutationVariables,
                },
                result: {
                    data: {
                        createRoom: {
                            __typename: 'Room',
                            id: 'kitchen',
                            type: RoomType.KITCHEN,
                            name: 'Kitchen',
                            floor: 12,
                            wall: 17.5,
                            ceiling: 12,
                            products: [ { productId: sampleProduct1.id, amount: 1 } ],
                            inquiries: null,
                        },
                    } as CreateRoomMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate room type input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();
                expect(ViewUnderTest.roomTypeSelect).toHaveFocus();
                fireEvent.blur(ViewUnderTest.roomTypeSelect);
                await flushPromises();

                await RoomTypeFieldController.from(ViewUnderTest.roomTypeSelect)
                    .expectError('t:form.roomType.validation.required')
                    .selectRoomType(RoomType.KITCHEN).expectNoError();
            });

            it('should validate room name input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await TextFieldController.from(ViewUnderTest.roomNameInput)
                    .type('').expectError('t:form.roomName.validation.required')
                    .type('a'.repeat(2)).expectError('t:form.roomName.validation.tooShort')
                    .type('a'.repeat(3)).expectNoError()
                    .paste('a'.repeat(256)).expectError('t:form.roomName.validation.tooLong')
                    .paste('a'.repeat(255)).expectNoError()
                    .type('valid room name').expectNoError();
            });

            it('should validate room floor surface area input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await NumberFieldController.from(ViewUnderTest.roomFloorAreaInput)
                    .pasteAmount('').expectNoError()
                    .pasteAmount('100001').expectError('t:form.roomFloorArea.validation.tooHigh')
                    .pasteAmount('100000').expectNoError();
            });

            it('should validate room walls surface area input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await NumberFieldController.from(ViewUnderTest.roomWallsAreaInput)
                    .pasteAmount('').expectNoError()
                    .pasteAmount('100001').expectError('t:form.roomWallsArea.validation.tooHigh')
                    .pasteAmount('100000').expectNoError();
            });

            it('should validate room ceiling surface area input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await NumberFieldController.from(ViewUnderTest.roomCeilingAreaInput)
                    .pasteAmount('').expectNoError()
                    .pasteAmount('100001').expectError('t:form.roomCeilingArea.validation.tooHigh')
                    .pasteAmount('100000').expectNoError();
            });

            it('should validate product amount field value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await ProductSelectorController.from(ViewUnderTest.roomProductSelector)
                    .selectProduct(sampleProduct1, 1e6).expectNoError()
                    .selectProduct(sampleProduct2, 1e6 + 1).expectError('t:form.roomProductSelector.productAmount.validation.tooHigh');
            });

        });

        it('should create room and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const projectCacheRecordKey = cache.identify(sampleProject)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: sampleProject,
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const createdRoom = mockResponse.result.data.createRoom;
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    rooms: [ createdRoom ],
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
