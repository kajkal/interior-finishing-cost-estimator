import React from 'react';
import { DateTime } from 'luxon';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ProductFilterDate } from '../../../../../code/components/pages/products/filters/ProductFilterDate';


describe('ProductFilterDate component', () => {

    class ViewUnderTest {
        static get fromDateInput() {
            return screen.getByLabelText('t:product.filters.fromDate', { selector: 'input' });
        }
        static get toDateInput() {
            return screen.getByLabelText('t:product.filters.toDate', { selector: 'input' });
        }
    }

    it('should render from date input', () => {
        const mockAtomUpdater = jest.fn();
        const { rerender } = render(
            <ProductFilterDate
                date={null}
                relatedField='fromDate'
                productsDatesStatistics={undefined}
                setFilters={mockAtomUpdater}
                className=''
            />,
        );

        expect(ViewUnderTest.fromDateInput).toBeVisible();
        expect(ViewUnderTest.fromDateInput).toHaveValue('');

        userEvent.paste(ViewUnderTest.fromDateInput, '2020-08-05');

        expect(mockAtomUpdater).toHaveBeenCalledTimes(1);
        const updateFn = mockAtomUpdater.mock.calls[ 0 ][ 0 ];
        const updatedFilterState = updateFn({});
        expect(updatedFilterState).toEqual({ fromDate: expect.any(DateTime) });

        rerender(
            <ProductFilterDate
                date={updatedFilterState.fromDate}
                relatedField='fromDate'
                productsDatesStatistics={undefined}
                setFilters={mockAtomUpdater}
                className=''
            />,
        );
        expect(ViewUnderTest.fromDateInput).toHaveValue('2020-08-05');
    });

    it('should render to date input', () => {
        const mockAtomUpdater = jest.fn();
        const { rerender } = render(
            <ProductFilterDate
                date={null}
                relatedField='toDate'
                productsDatesStatistics={undefined}
                setFilters={mockAtomUpdater}
                className=''
            />,
        );

        expect(ViewUnderTest.toDateInput).toBeVisible();
        expect(ViewUnderTest.toDateInput).toHaveValue('');

        userEvent.paste(ViewUnderTest.toDateInput, '2020-08-10');

        expect(mockAtomUpdater).toHaveBeenCalledTimes(1);
        const updateFn = mockAtomUpdater.mock.calls[ 0 ][ 0 ];
        const updatedFilterState = updateFn({});
        expect(updatedFilterState).toEqual({ toDate: expect.any(DateTime) });

        rerender(
            <ProductFilterDate
                date={updatedFilterState.toDate}
                relatedField='toDate'
                productsDatesStatistics={undefined}
                setFilters={mockAtomUpdater}
                className=''
            />,
        );
        expect(ViewUnderTest.toDateInput).toHaveValue('2020-08-10');
    });

    it('should add min/max restrictions', () => {
        render(
            <ProductFilterDate
                date={null}
                relatedField='fromDate'
                productsDatesStatistics={{
                    min: '2020-08-05T00:00:00.000Z',
                    max: '2020-08-10T00:00:00.000Z',
                }}
                setFilters={jest.fn()}
                className=''
            />,
        );

        expect(ViewUnderTest.fromDateInput).toHaveAttribute('min', '2020-08-05');
        expect(ViewUnderTest.fromDateInput).toHaveAttribute('max', '2020-08-10');
    });

});
