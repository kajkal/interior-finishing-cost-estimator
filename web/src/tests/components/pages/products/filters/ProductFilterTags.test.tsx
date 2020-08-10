import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ProductsFiltersAtomValue } from '../../../../../code/components/pages/products/filters/productsFiltersAtom';
import { ProductFilterTags } from '../../../../../code/components/pages/products/filters/ProductFilterTags';


describe('ProductFilterTags component', () => {

    const tags = [
        { name: 'tag a', occurrenceCount: 3 },
        { name: 'tag b', occurrenceCount: 1 },
        { name: 'tag c', occurrenceCount: 2 },
    ];

    class ViewUnderTest {
        static get selectAllTagsCheckbox() {
            return screen.getByRole('checkbox', { name: 't:product.filters.selectAllTags' });
        }
        static getTagCheckbox(label: string) {
            return screen.getByRole('checkbox', { name: `t:product.filters.toggleTag:{"tagName":"${label}"}` });
        }
    }

    it('should mark active tags', () => {
        const mockAtomUpdater = jest.fn();
        const { rerender } = render(
            <ProductFilterTags
                tags={tags} setFilters={mockAtomUpdater} className=''
                selectedTags='ALL'
            />,
        );

        // verify if all tags checkboxes are active
        expect(ViewUnderTest.selectAllTagsCheckbox).toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag a')).toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag b')).toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag c')).toBeChecked();

        rerender(
            <ProductFilterTags
                tags={tags} setFilters={mockAtomUpdater} className=''
                selectedTags={new Set([ 'tag a', 'tag c' ])}
            />,
        );

        // verify if only selected tags checkboxes are active
        expect(ViewUnderTest.selectAllTagsCheckbox).not.toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag a')).toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag b')).not.toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag c')).toBeChecked();

        rerender(
            <ProductFilterTags
                tags={tags} setFilters={mockAtomUpdater} className=''
                selectedTags={new Set([])}
            />,
        );

        // verify if there are not active tags checkboxes
        expect(ViewUnderTest.selectAllTagsCheckbox).not.toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag a')).not.toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag b')).not.toBeChecked();
        expect(ViewUnderTest.getTagCheckbox('tag c')).not.toBeChecked();
    });

    it('should handle tags filter state correctly', () => {
        const ControlledFilter = () => {
            const [ { selectedTags }, setFilters ] = React.useState<Pick<ProductsFiltersAtomValue, 'selectedTags'>>({
                selectedTags: 'ALL',
            });
            return (
                <>
                    <div data-testid='filter-state'>
                        {JSON.stringify((selectedTags === 'ALL') ? selectedTags : [...selectedTags])}
                    </div>
                    <ProductFilterTags
                        tags={tags} setFilters={setFilters as SetterOrUpdater<ProductsFiltersAtomValue>} className=''
                        selectedTags={selectedTags}
                    />
                </>
            );
        };
        render(<ControlledFilter/>);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');

        userEvent.click(ViewUnderTest.selectAllTagsCheckbox);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('[]');
        userEvent.click(ViewUnderTest.selectAllTagsCheckbox);
        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');

        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');
        userEvent.click(ViewUnderTest.getTagCheckbox('tag a'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["tag b","tag c"]');
        userEvent.click(ViewUnderTest.getTagCheckbox('tag b'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["tag c"]');
        userEvent.click(ViewUnderTest.getTagCheckbox('tag c'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('[]');
        userEvent.click(ViewUnderTest.getTagCheckbox('tag a'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["tag a"]');
        userEvent.click(ViewUnderTest.getTagCheckbox('tag b'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('["tag a","tag b"]');
        userEvent.click(ViewUnderTest.getTagCheckbox('tag c'));
        expect(screen.getByTestId('filter-state')).toHaveTextContent('ALL');
    });

});
