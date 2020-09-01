/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { TFunction } from 'i18next';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { mockTFunction } from '../../../__mocks__/libraries/react-i18next';
import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ProductSelectorController } from '../../../__utils__/field-controllers/ProductSelectorController';
import { InquirySelectorController } from '../../../__utils__/field-controllers/InquirySelectorController';
import { RoomTypeFieldController } from '../../../__utils__/field-controllers/RoomTypeFieldController';
import { NumberFieldController } from '../../../__utils__/field-controllers/NumberFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { RoomType, UpdateRoomDocument, UpdateRoomMutation, UpdateRoomMutationVariables } from '../../../../graphql/generated-types';
import { roomUpdateModalAtom } from '../../../../code/components/modals/room-update/roomUpdateModalAtom';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { RoomUpdateModal } from '../../../../code/components/modals/room-update/RoomUpdateModal';
import { mapCompleteRoomToRoomUpdateFormData } from '../../../../code/utils/mappers/roomMapper';
import { CompleteRoom } from '../../../../code/utils/mappers/projectMapper';


describe('RoomUpdateModal component', () => {

    const sampleProduct1 = generator.product({ tags: [ 'tag A', 'tag B' ] });
    const sampleProduct2 = generator.product({ tags: [ 'tag C' ] });
    const sampleInquiry1 = generator.inquiry();
    const sampleInquiry2 = generator.inquiry();
    const sampleRoom = generator.room({
        type: RoomType.KITCHEN,
        name: 'Kitchen',
        floor: 12,
        wall: 17.5,
        ceiling: 12,
        products: [ { __typename: 'LinkedProduct', productId: sampleProduct1.id, amount: 1 } ],
        inquiries: [ { __typename: 'LinkedInquiry', inquiryId: sampleInquiry1.id } ],
    });
    const sampleUser = generator.user({
        products: [ sampleProduct1, sampleProduct2 ],
        inquiries: [ sampleInquiry1, sampleInquiry2 ],
    });
    const sampleProject = generator.project({ rooms: [ sampleRoom ] });
    const sampleCompleteRoom: CompleteRoom = {
        ...sampleRoom,
        products: [ { product: sampleProduct1, amount: 1 } ],
        inquiries: [ sampleInquiry1 ],
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(roomUpdateModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        formInitialValues: mapCompleteRoomToRoomUpdateFormData(sampleCompleteRoom, sampleProject.slug, mockTFunction as TFunction),
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <RoomUpdateModal isMobile={false} />
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
            return screen.queryByLabelText('t:project.updateRoomModal.title');
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
        static get roomInquirySelector() {
            return screen.getByLabelText(/t:form.roomInquirySelector.label/, { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:form.common.update' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
        }
        static async fillAndSubmitForm(data: UpdateRoomMutationVariables) {
            ViewUnderTest.openModal();

            await TextFieldController.from(ViewUnderTest.roomNameInput).type(data.name);
            await NumberFieldController.from(ViewUnderTest.roomCeilingAreaInput).pasteAmount(`${data.ceiling || ''}`);
            await ProductSelectorController.from(ViewUnderTest.roomProductSelector)
                .removeAllProducts()
                .selectProduct(sampleProduct2, 2);
            await InquirySelectorController.from(ViewUnderTest.roomInquirySelector)
                .removeAllInquiries()
                .selectInquiry(sampleInquiry2);

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

    describe('room update form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: UpdateRoomDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        roomId: sampleRoom.id,
                        type: RoomType.KITCHEN,
                        name: 'Kitchen updated name',
                        floor: sampleRoom.floor,
                        wall: sampleRoom.wall,
                        products: [ { productId: sampleProduct2.id, amount: 2 } ],
                        inquiries: [ { inquiryId: sampleInquiry2.id } ],
                    } as UpdateRoomMutationVariables,
                },
                result: {
                    data: {
                        updateRoom: {
                            __typename: 'Room',
                            id: 'kitchen',
                            type: RoomType.KITCHEN,
                            name: 'Kitchen updated name',
                            floor: 12,
                            wall: 17.5,
                            ceiling: null,
                            products: [ { productId: sampleProduct2.id, amount: 2 } ],
                            inquiries: [ { inquiryId: sampleInquiry2.id } ],
                        },
                    } as UpdateRoomMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate room type input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await RoomTypeFieldController.from(ViewUnderTest.roomTypeSelect)
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
                    .removeAllProducts().expectNoError()
                    .selectProduct(sampleProduct1, 1e6).expectNoError()
                    .selectProduct(sampleProduct2, 1e6 + 1).expectError('t:form.roomProductSelector.productAmount.validation.tooHigh');
            });

            it('should validate inquiry field value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await ProductSelectorController.from(ViewUnderTest.roomProductSelector)
                    .removeAllProducts().expectNoError()
                    .selectProduct(sampleProduct1, 1e6).expectNoError()
                    .selectProduct(sampleProduct2, 1e6 + 1).expectError('t:form.roomProductSelector.productAmount.validation.tooHigh');
            });

        });

        it('should update room and close modal', async () => {
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

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updatedRoom = mockResponse.result.data.updateRoom;
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    rooms: [ updatedRoom ], // <- updated room list
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
