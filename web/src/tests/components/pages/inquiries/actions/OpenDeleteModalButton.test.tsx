import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/mocks/MockContextProvider';

import { inquiryDeleteModalAtom, InquiryDeleteModalAtomValue } from '../../../../../code/components/modals/inquiry-delete/inquiryDeleteModalAtom';
import { OpenDeleteModalButton } from '../../../../../code/components/pages/inquiries/actions/OpenDeleteModalButton';
import { InquiryDataFragment } from '../../../../../graphql/generated-types';


describe('OpenDeleteModalButton component', () => {

    let deleteState: InquiryDeleteModalAtomValue;

    function renderInMockContext(inquiry: Partial<InquiryDataFragment>, mocks?: ContextMocks) {
        const Handle = () => {
            deleteState = useRecoilValue(inquiryDeleteModalAtom);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <OpenDeleteModalButton inquiry={inquiry as InquiryDataFragment} />
            </MockContextProvider>,
        );
    }

    it('should open delete inquiry confirmation modal on click', () => {
        renderInMockContext({
            __typename: 'Inquiry',
            id: 'sample_id',
            title: 'sample title',
        });
        userEvent.click(screen.getByRole('button', { name: 't:form.common.delete' }));
        expect(deleteState).toEqual({
            open: true,
            inquiryData: {
                id: 'sample_id',
                title: 'sample title',
            },
        });
    });

});
