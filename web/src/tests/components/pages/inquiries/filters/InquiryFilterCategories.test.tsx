import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { InquiryFilterCategories } from '../../../../../code/components/pages/inquiries/filters/InquiryFilterCategories';
import { InquiriesFiltersAtomValue } from '../../../../../code/components/pages/inquiries/filters/inquiriesFiltersAtom';


jest.mock('../../../../../code/config/supportedCategories', () => ({
    categoryTranslationKeyMap: {
        PIPING: 'categories.piping',
        CARPENTRY: 'categories.carpentry',
        DESIGNING: 'categories.designing',
    },
    supportedCategories: [ 'PIPING', 'CARPENTRY', 'DESIGNING' ],
}));

describe('InquiryFilterCategories component', () => {

    class ViewUnderTest {
        static get selectAllCategoriesCheckbox() {
            return screen.getByRole('checkbox', { name: 't:inquiry.filters.selectAllCategories' });
        }
        static getCategoryCheckbox(label: string) {
            return screen.getByRole('checkbox', { name: `t:inquiry.filters.toggleCategory:{"categoryName":"${label}"}` });
        }
    }

    it('should mark active categories', () => {
        const mockAtomUpdater = jest.fn();
        const { rerender } = render(
            <InquiryFilterCategories
                selectedCategories='ALL'
                setFilters={mockAtomUpdater} className=''
            />,
        );

        // verify if all categories checkboxes are active
        expect(ViewUnderTest.selectAllCategoriesCheckbox).toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.piping')).toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.carpentry')).toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.designing')).toBeChecked();

        rerender(
            <InquiryFilterCategories
                selectedCategories={new Set([ 'PIPING', 'DESIGNING' ])}
                setFilters={mockAtomUpdater} className=''
            />,
        );

        // verify if only selected tags checkboxes are active
        expect(ViewUnderTest.selectAllCategoriesCheckbox).not.toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.piping')).toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.carpentry')).not.toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.designing')).toBeChecked();

        rerender(
            <InquiryFilterCategories
                selectedCategories={new Set([])}
                setFilters={mockAtomUpdater} className=''
            />,
        );

        // verify if there are not active tags checkboxes
        expect(ViewUnderTest.selectAllCategoriesCheckbox).not.toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.piping')).not.toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.carpentry')).not.toBeChecked();
        expect(ViewUnderTest.getCategoryCheckbox('t:categories.designing')).not.toBeChecked();
    });

    it('should handle categories filter state correctly', () => {
        const ControlledFilter = () => {
            const [ { selectedCategories }, setFilters ] = React.useState<Pick<InquiriesFiltersAtomValue, 'selectedCategories'>>({
                selectedCategories: 'ALL',
            });
            return (
                <>
                    <div data-testid='filter-state'>
                        {JSON.stringify((selectedCategories === 'ALL') ? selectedCategories : [ ...selectedCategories ])}
                    </div>
                    <InquiryFilterCategories
                        selectedCategories={selectedCategories}
                        setFilters={setFilters as SetterOrUpdater<InquiriesFiltersAtomValue>} className=''
                    />
                </>
            );
        };
        render(<ControlledFilter />);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');

        userEvent.click(ViewUnderTest.selectAllCategoriesCheckbox);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('[]');
        userEvent.click(ViewUnderTest.selectAllCategoriesCheckbox);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');

        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');
        userEvent.click(ViewUnderTest.getCategoryCheckbox('t:categories.piping'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["CARPENTRY","DESIGNING"]');
        userEvent.click(ViewUnderTest.getCategoryCheckbox('t:categories.carpentry'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["DESIGNING"]');
        userEvent.click(ViewUnderTest.getCategoryCheckbox('t:categories.designing'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('[]');
        userEvent.click(ViewUnderTest.getCategoryCheckbox('t:categories.piping'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["PIPING"]');
        userEvent.click(ViewUnderTest.getCategoryCheckbox('t:categories.carpentry'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["PIPING","CARPENTRY"]');
        userEvent.click(ViewUnderTest.getCategoryCheckbox('t:categories.designing'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');
    });

});
