import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ProductFilterSearch } from '../../../../../code/components/pages/products/filters/ProductFilterSearch';


describe('ProductFilterSearch component', () => {

    class ViewUnderTest {
        static get searchInput() {
            return screen.getByPlaceholderText('t:product.filters.searchPlaceholder');
        }
    }

    it('should update filter atom state on change', async () => {
        const mockAtomUpdater = jest.fn();
        const { rerender } = render(<ProductFilterSearch searchPhrase='' setFilters={mockAtomUpdater} className='' />);

        expect(ViewUnderTest.searchInput).toBeVisible();
        expect(ViewUnderTest.searchInput).toHaveValue('');

        userEvent.paste(ViewUnderTest.searchInput, 'Test text');

        expect(mockAtomUpdater).toHaveBeenCalledTimes(1);
        const updateFn = mockAtomUpdater.mock.calls[ 0 ][ 0 ];
        expect(updateFn({})).toEqual({ searchPhrase: 'Test text' });

        rerender(<ProductFilterSearch searchPhrase='Test text' setFilters={mockAtomUpdater} className='' />);
        expect(ViewUnderTest.searchInput).toHaveValue('Test text');
    });

});
