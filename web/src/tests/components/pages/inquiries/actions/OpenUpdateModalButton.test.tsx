import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { inquiryUpdateModalAtom, InquiryUpdateModalAtomValue } from '../../../../../code/components/modals/inquiry-update/inquiryUpdateModalAtom';
import { OpenUpdateModalButton } from '../../../../../code/components/pages/inquiries/actions/OpenUpdateModalButton';
import { Category, InquiryDataFragment } from '../../../../../graphql/generated-types';


describe('OpenUpdateModalButton component', () => {

    let updateState: InquiryUpdateModalAtomValue;

    function renderInMockContext(inquiry: Partial<InquiryDataFragment>, mocks?: ContextMocks) {
        const Handle = () => {
            updateState = useRecoilValue(inquiryUpdateModalAtom);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <OpenUpdateModalButton inquiry={inquiry as InquiryDataFragment} />
            </MockContextProvider>,
        );
    }

    it('should open update inquiry modal on click', () => {
        renderInMockContext({
            __typename: 'Inquiry',
            id: 'sample_id',
            title: 'sample title',
            description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
            location: {
                __typename: 'Location',
                placeId: 'sample-place-id',
                main: 'City',
                secondary: 'Country',
                lat: 50,
                lng: 20,
            },
            category: Category.DESIGNING,
        });
        userEvent.click(screen.getByRole('button', { name: 't:form.common.update' }));
        expect(updateState).toEqual({
            open: true,
            inquiryData: {
                inquiryId: 'sample_id',
                title: 'sample title',
                description: [ { children: [ { children: [ { text: 'Sample description' } ], type: 'p' } ] } ],
                location: {
                    description: 'City, Country',
                    latLng: { lat: 50, lng: 20 },
                    place_id: 'sample-place-id',
                    structured_formatting: {
                        main_text: 'City',
                        main_text_matched_substrings: [],
                        secondary_text: 'Country',
                    },
                },
                category: {
                    id: 'DESIGNING',
                    label: 't:inquiry.categories.designing',
                },
            },
        });
    });

});
