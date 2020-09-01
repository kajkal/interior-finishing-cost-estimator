import React from 'react';
import { useRecoilValue } from 'recoil';
import userEvent from '@testing-library/user-event';
import { getByRole, getByTestId, render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../../../__utils__/generator';

import { productUpdateModalAtom, ProductUpdateModalAtomValue } from '../../../../../../code/components/modals/product-update/productUpdateModalAtom';
import { inquiryUpdateModalAtom, InquiryUpdateModalAtomValue } from '../../../../../../code/components/modals/inquiry-update/inquiryUpdateModalAtom';
import { roomCreateModalAtom, RoomCreateModalAtomValue } from '../../../../../../code/components/modals/room-create/roomCreateModalAtom';
import { roomUpdateModalAtom, RoomUpdateModalAtomValue } from '../../../../../../code/components/modals/room-update/roomUpdateModalAtom';
import { roomDeleteModalAtom, RoomDeleteModalAtomValue } from '../../../../../../code/components/modals/room-delete/roomDeleteModalAtom';
import { productModalAtom, ProductModalAtomValue } from '../../../../../../code/components/modals/product/productModalAtom';
import { inquiryModalAtom, InquiryModalAtomValue } from '../../../../../../code/components/modals/inquiry/inquiryModalAtom';
import { mapProjectDataToCompleteProjectData } from '../../../../../../code/utils/mappers/projectMapper';
import { RoomSection } from '../../../../../../code/components/pages/project/sections/room/RoomSection';
import { Category } from '../../../../../../graphql/generated-types';


describe('RoomSection component', () => {

    let roomCreateModalState: RoomCreateModalAtomValue;
    let roomUpdateModalState: RoomUpdateModalAtomValue;
    let roomDeleteModalState: RoomDeleteModalAtomValue;
    let productUpdateModalState: ProductUpdateModalAtomValue;
    let inquiryUpdateModalState: InquiryUpdateModalAtomValue;
    let productModalState: ProductModalAtomValue;
    let inquiryModalState: InquiryModalAtomValue;

    const sampleProduct1 = generator.product({ tags: [ 'tag A', 'tag B' ] });
    const sampleInquiry1 = generator.inquiry({
        category: Category.DESIGNING,
        quotes: [
            generator.quote({ price: { currency: 'PLN', amount: 50 } }),
            generator.quote({ price: { currency: 'PLN', amount: 45 } }),
        ],
    });
    const sampleRoom1 = generator.room({
        floor: 12,
        wall: 17.5,
        ceiling: 12,
        products: [ { __typename: 'LinkedProduct', productId: sampleProduct1.id, amount: 3 } ],
        inquiries: [ { __typename: 'LinkedInquiry', inquiryId: sampleInquiry1.id } ],
    });
    const sampleRoom2 = generator.room();
    const sampleProject = mapProjectDataToCompleteProjectData(
        generator.project({ rooms: [ sampleRoom1, sampleRoom2 ] }),
        { products: [ sampleProduct1 ], inquiries: [ sampleInquiry1 ] },
    );

    function renderInMockContext(mocks?: ContextMocks) {
        const Handle = () => {
            roomCreateModalState = useRecoilValue(roomCreateModalAtom);
            roomUpdateModalState = useRecoilValue(roomUpdateModalAtom);
            roomDeleteModalState = useRecoilValue(roomDeleteModalAtom);
            productUpdateModalState = useRecoilValue(productUpdateModalAtom);
            inquiryUpdateModalState = useRecoilValue(inquiryUpdateModalAtom);
            productModalState = useRecoilValue(productModalAtom);
            inquiryModalState = useRecoilValue(inquiryModalAtom);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <RoomSection project={sampleProject} />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get addRoomButton() {
            return screen.getByRole('button', { name: 't:project.addRoom' });
        }
        static get roomRows() {
            return screen.getAllByTestId('room');
        }
        static expandSection() {
            const sectionSummary = screen.getByRole('button', { name: 't:project.rooms' });
            if (!sectionSummary.dataset.expanded) {
                userEvent.click(screen.getByRole('button', { name: 't:project.rooms' }));
            }
        }
    }

    class RoomRow {
        constructor(public element: HTMLElement) {
        }
        static from(element: HTMLElement) {
            return new this(element);
        }
        get roomProductRows() {
            const listContainer = getByTestId(this.element, 'product-list');
            if (listContainer.childElementCount === 1) {
                return listContainer.children[ 0 ];
            }
            const elementsInProductRow = 4;
            const children = [ ...listContainer.children ];
            return new Array(Math.ceil(listContainer.childElementCount / elementsInProductRow))
                .fill(0)
                .map(_ => children.splice(0, elementsInProductRow) as [ HTMLElement, HTMLElement, HTMLElement, HTMLElement ]);
        }
        get roomInquiryRows() {
            const listContainer = getByTestId(this.element, 'inquiry-list');
            if (listContainer.childElementCount === 1) {
                return listContainer.children[ 0 ];
            }
            const elementsInInquiryRow = 2;
            const children = [ ...listContainer.children ];
            return new Array(Math.ceil(listContainer.childElementCount / elementsInInquiryRow))
                .fill(0)
                .map(_ => children.splice(0, elementsInInquiryRow) as [ HTMLElement, HTMLElement ]);
        }
        get deleteButton() {
            return getByRole(this.element, 'button', { name: 't:form.common.delete' });
        }
        get editButton() {
            return getByRole(this.element, 'button', { name: 't:form.common.update' });
        }
    }

    it('should render separate row for each room', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        // verify if room rows are visible when section is expanded
        expect(ViewUnderTest.roomRows).toHaveLength(2);

        const firstRow = RoomRow.from(ViewUnderTest.roomRows[ 0 ]);
        expect(firstRow.roomProductRows).toHaveLength(1);
        expect(firstRow.roomInquiryRows).toHaveLength(1);

        const secondRow = RoomRow.from(ViewUnderTest.roomRows[ 1 ]);
        expect(secondRow.roomProductRows).toHaveTextContent('t:project.noRoomProducts');
        expect(secondRow.roomInquiryRows).toHaveTextContent('t:project.noRoomInquiries');
    });

    it('should open RoomCreateModal', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        userEvent.click(ViewUnderTest.addRoomButton);

        // verify if modal atom state changed
        expect(roomCreateModalState).toEqual({
            open: true,
            projectData: {
                slug: sampleProject.slug,
            },
        });
    });

    it('should open RoomUpdateModal', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        const firstRow = RoomRow.from(ViewUnderTest.roomRows[ 0 ]);
        userEvent.click(firstRow.editButton);

        // verify if modal atom state changed
        expect(roomUpdateModalState).toEqual({
            open: true,
            formInitialValues: {
                projectSlug: sampleProject.slug,
                roomId: sampleRoom1.id,
                type: sampleRoom1.type,
                name: sampleRoom1.name,
                floor: sampleRoom1.floor,
                wall: sampleRoom1.wall,
                ceiling: sampleRoom1.ceiling,
                products: [ { product: sampleProduct1, amount: 3 } ],
                inquiries: [ { ...sampleInquiry1, translatedCategory: 't:inquiry.categories.designing' } ],
            },
        });
    });

    it('should open RoomDeleteModal', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        const firstRow = RoomRow.from(ViewUnderTest.roomRows[ 0 ]);
        userEvent.click(firstRow.deleteButton);

        // verify if modal atom state changed
        expect(roomDeleteModalState).toEqual({
            open: true,
            roomData: expect.objectContaining({
                id: sampleRoom1.id,
                name: sampleRoom1.name,
            }),
            projectData: expect.objectContaining({
                slug: sampleProject.slug,
            }),
        });
    });

    it('should open ProductModal', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        const firstRow = RoomRow.from(ViewUnderTest.roomRows[ 0 ]);
        const [ productRow ] = firstRow.roomProductRows;
        userEvent.click(getByRole(productRow[ 0 ], 'button', { name: 't:form.common.open' }));

        // verify if modal atom state changed
        expect(productModalState).toEqual({
            open: true,
            productData: sampleProduct1,
        });
    });

    it('should open ProductUpdateModal', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        const firstRow = RoomRow.from(ViewUnderTest.roomRows[ 0 ]);
        const [ productRow ] = firstRow.roomProductRows;
        userEvent.click(getByRole(productRow[ 0 ], 'button', { name: 't:product.updateModal.title' }));

        // verify if modal atom state changed
        expect(productUpdateModalState).toEqual({
            open: true,
            productData: {
                productId: sampleProduct1.id,
                name: sampleProduct1.name,
                description: JSON.parse(sampleProduct1.description),
                price: {
                    currency: sampleProduct1.price!.currency,
                    amount: sampleProduct1.price!.amount,
                },
                tags: [ { name: 'tag A' }, { name: 'tag B' } ],
            },
        });
    });

    it('should open InquiryModal', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        const firstRow = RoomRow.from(ViewUnderTest.roomRows[ 0 ]);
        const [ inquiryRow ] = firstRow.roomInquiryRows;
        userEvent.click(getByRole(inquiryRow[ 0 ], 'button', { name: 't:form.common.open' }));

        // verify if modal atom state changed
        expect(inquiryModalState).toEqual({
            open: true,
            inquiryData: sampleInquiry1,
        });
    });

    it('should open InquiryUpdateModal', () => {
        renderInMockContext();
        ViewUnderTest.expandSection();

        const firstRow = RoomRow.from(ViewUnderTest.roomRows[ 0 ]);
        const [ inquiryRow ] = firstRow.roomInquiryRows;
        userEvent.click(getByRole(inquiryRow[ 0 ], 'button', { name: 't:inquiry.updateModal.title' }));

        // verify if modal atom state changed
        expect(inquiryUpdateModalState).toEqual({
            open: true,
            inquiryData: expect.objectContaining({
                inquiryId: sampleInquiry1.id,
                title: sampleInquiry1.title,
                description: JSON.parse(sampleInquiry1.description),
                location: {
                    place_id: sampleInquiry1.location.placeId,
                    description: sampleInquiry1.location.main + ', ' + sampleInquiry1.location.secondary,
                    structured_formatting: {
                        main_text: sampleInquiry1.location.main,
                        secondary_text: sampleInquiry1.location.secondary,
                        main_text_matched_substrings: [],
                    },
                    latLng: {
                        lat: sampleInquiry1.location.lat,
                        lng: sampleInquiry1.location.lng,
                    },
                },
                category: sampleInquiry1.category,
            }),
        });
    });

});
