import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/mocks/MockContextProvider';

import { inquiryUpdateModalAtom, InquiryUpdateModalAtomValue } from '../../../../../code/components/modals/inquiry-update/inquiryUpdateModalAtom';
import { OpenUpdateModalButton } from '../../../../../code/components/pages/inquiries/actions/OpenUpdateModalButton';
import { InquiryDataFragment } from '../../../../../graphql/generated-types';
import { generator } from '../../../../__utils__/generator';


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
        const sampleInquiry = generator.inquiry();
        renderInMockContext(sampleInquiry);
        userEvent.click(screen.getByRole('button', { name: 't:form.common.update' }));
        expect(updateState).toEqual({
            open: true,
            inquiryData: {
                inquiryId: sampleInquiry.id,
                title: sampleInquiry.title,
                description: JSON.parse(sampleInquiry.description),
                location: {
                    place_id: sampleInquiry.location.placeId,
                    description: `${sampleInquiry.location.main}, ${sampleInquiry.location.secondary}`,
                    latLng: {
                        lat: sampleInquiry.location.lat,
                        lng: sampleInquiry.location.lng,
                    },
                    structured_formatting: {
                        main_text: sampleInquiry.location.main,
                        secondary_text: sampleInquiry.location.secondary,
                        main_text_matched_substrings: [],
                    },
                },
                category: sampleInquiry.category,
            },
        });
    });

});
