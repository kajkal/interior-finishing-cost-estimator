import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { inquiryAddQuoteModalAtom, InquiryAddQuoteModalAtomValue } from '../../../../../code/components/modals/inquiry-add-quote/inquiryAddQuoteModalAtom';
import { OpenAddQuoteModalButton } from '../../../../../code/components/pages/inquiries/actions/OpenAddQuoteModalButton';
import { InquiryDataFragment } from '../../../../../graphql/generated-types';


describe('OpenAddQuoteModalButton component', () => {

    let addQuoteState: InquiryAddQuoteModalAtomValue;

    function renderInMockContext(inquiry: Partial<InquiryDataFragment>, mocks?: ContextMocks) {
        const Handle = () => {
            addQuoteState = useRecoilValue(inquiryAddQuoteModalAtom);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <OpenAddQuoteModalButton inquiry={inquiry as InquiryDataFragment} />
            </MockContextProvider>,
        );
    }

    it('should open inquiry add quote modal on click', () => {
        renderInMockContext({
            __typename: 'Inquiry',
            id: 'sample_id',
        });
        userEvent.click(screen.getByRole('button', { name: 't:inquiry.addQuote' }));
        expect(addQuoteState).toEqual({
            open: true,
            inquiryData: {
                __typename: 'Inquiry',
                id: 'sample_id',
            },
        });
    });

});
