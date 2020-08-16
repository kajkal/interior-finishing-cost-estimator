import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { InquiriesFiltersAtomValue } from '../../../../../code/components/pages/inquiries/filters/inquiriesFiltersAtom';
import { InquiryFilterType } from '../../../../../code/components/pages/inquiries/filters/InquiryFilterType';


describe('InquiryFilterType component', () => {

    class ViewUnderTest {
        static get selectMyInquiriesCheckbox() {
            return screen.getByRole('checkbox', { name: 't:inquiry.filters.myInquiriesAriaLabel' });
        }
        static get selectBookmarkedInquiriesCheckbox() {
            return screen.getByRole('checkbox', { name: 't:inquiry.filters.bookmarkedInquiriesAriaLabel' });
        }
    }

    it('should mark active type', () => {
        const mockAtomUpdater = jest.fn();
        const { rerender } = render(
            <InquiryFilterType selectedType={null} setFilters={mockAtomUpdater} className='' />
        );

        // verify if there are not active type checkboxes
        expect(ViewUnderTest.selectMyInquiriesCheckbox).not.toBeChecked();
        expect(ViewUnderTest.selectBookmarkedInquiriesCheckbox).not.toBeChecked();

        rerender(
            <InquiryFilterType selectedType='OWNED' setFilters={mockAtomUpdater} className='' />
        );

        // verify if own inquiries checkbox is active
        expect(ViewUnderTest.selectMyInquiriesCheckbox).toBeChecked();
        expect(ViewUnderTest.selectBookmarkedInquiriesCheckbox).not.toBeChecked();

        rerender(
            <InquiryFilterType selectedType='BOOKMARKED' setFilters={mockAtomUpdater} className='' />
        );

        // verify if bookmarked inquiries checkbox is active
        expect(ViewUnderTest.selectMyInquiriesCheckbox).not.toBeChecked();
        expect(ViewUnderTest.selectBookmarkedInquiriesCheckbox).toBeChecked();
    });

    it('should handle type filter state correctly', async () => {
        const ControlledFilter = () => {
            const [ { selectedType }, setFilters ] = React.useState<Pick<InquiriesFiltersAtomValue, 'selectedType'>>({
                selectedType: null,
            });
            return (
                <>
                    <div data-testid='filter-state'>{JSON.stringify(selectedType)}</div>
                    <InquiryFilterType
                        selectedType={selectedType}
                        setFilters={setFilters as SetterOrUpdater<InquiriesFiltersAtomValue>}
                        className=''
                    />
                </>
            );
        };
        render(<ControlledFilter />);

        expect(screen.getByTestId('filter-state')).toHaveTextContent('null');
        userEvent.click(ViewUnderTest.selectMyInquiriesCheckbox);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('OWNED');
        userEvent.click(ViewUnderTest.selectBookmarkedInquiriesCheckbox);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('BOOKMARKED');
        userEvent.click(ViewUnderTest.selectBookmarkedInquiriesCheckbox);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('null');
    });

});
