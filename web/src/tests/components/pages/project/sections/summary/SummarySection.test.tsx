import React from 'react';
import { render, screen } from '@testing-library/react';

import { generator } from '../../../../../__utils__/generator';

import { SummarySection } from '../../../../../../code/components/pages/project/sections/summary/SummarySection';
import { CompleteRoom } from '../../../../../../code/utils/mappers/projectMapper';
import { RoomType } from '../../../../../../graphql/generated-types';


jest.mock('use-resize-observer', () => ({
    __esModule: true,
    default: () => ({}),
}));

describe('SummarySection component', () => {

    const sampleProduct1 = generator.product({ price: { currency: 'PLN', amount: 50 } });
    const sampleProduct2 = generator.product({ price: { currency: 'PLN', amount: 25 } });
    const sampleProduct3 = generator.product({ price: { currency: 'EUR', amount: 15 } });
    const sampleInquiry1 = generator.inquiry({ quotes: null });
    const sampleInquiry2 = generator.inquiry({
        quotes: [
            generator.quote({ price: { amount: 200, currency: 'PLN' } }),
            generator.quote({ price: { amount: 220, currency: 'PLN' } }),
        ],
    });
    const sampleInquiry3 = generator.inquiry({
        quotes: [
            generator.quote({ price: { amount: 120, currency: 'PLN' } }),
        ],
    });
    const sampleRoom1: CompleteRoom = {
        id: 'kitchen',
        type: RoomType.KITCHEN,
        name: 'Kitchen',
        products: [
            { product: sampleProduct1, amount: 1 },
            { product: sampleProduct2, amount: 2 },
            { product: sampleProduct3, amount: 3 },
        ],
        inquiries: [
            sampleInquiry1,
            sampleInquiry2,
            sampleInquiry3,
        ],
    };
    const sampleRoom2: CompleteRoom = {
        id: 'living-room',
        type: RoomType.LIVING_ROOM,
        name: 'Living room',
        products: [
            { product: sampleProduct2, amount: 1 },
        ],
        inquiries: [],
    };

    class SummaryRow {
        constructor(public element: HTMLElement) {
        }
        static from(element: HTMLElement) {
            return new this(element);
        }
        get header() {
            return this.element.children[ 0 ];
        }
        get productRow() {
            const productRow = this.element.children[ 1 ];
            expect(productRow).toHaveTextContent('t:product.products');
            return productRow;
        }
        get inquiryRow() {
            const inquiryRow = this.element.children[ 2 ];
            expect(inquiryRow).toHaveTextContent('t:inquiry.inquiries');
            return inquiryRow;
        }
    }

    it('should render \'no data\' message when data is missing', () => {
        render(<SummarySection project={{ rooms: [] }} defaultExpanded />);

        const sectionDetails = screen.getByRole('region', { name: 't:project.summary' });
        expect(sectionDetails).toHaveTextContent('t:project.noData');

        // verify if room summary rows are missing
        expect(screen.queryAllByTestId(/room-summary-/)).toHaveLength(0);

        // verify if total summary row is missing
        expect(screen.queryByTestId('total-summary')).toBeNull();

        // verify if charts are missing
        expect(screen.queryAllByTestId(/unburst-chart-/)).toHaveLength(0);
    });

    it('should render summary for each room, total summary and chart with total amount for each currency', () => {
        render(<SummarySection project={{ rooms: [ sampleRoom1, sampleRoom2 ] }} defaultExpanded />);

        // room summary rows
        expect(screen.getAllByTestId(/room-summary-/)).toHaveLength(2);

        const room1SummaryRow = SummaryRow.from(screen.getByTestId('room-summary-kitchen'));
        expect(room1SummaryRow.header).toHaveTextContent('Kitchen');
        expect(room1SummaryRow.productRow).toHaveTextContent('45.00EUR');
        expect(room1SummaryRow.productRow).toHaveTextContent('100.00PLN');
        expect(room1SummaryRow.inquiryRow).toHaveTextContent('320.00PLN');

        const room2SummaryRow = SummaryRow.from(screen.getByTestId('room-summary-living-room'));
        expect(room2SummaryRow.header).toHaveTextContent('Living room');
        expect(room2SummaryRow.productRow).toHaveTextContent('25.00PLN');
        expect(room2SummaryRow.inquiryRow).toHaveTextContent('-');

        // total summary row
        const totalSummaryRow = SummaryRow.from(screen.getByTestId('total-summary'));
        expect(totalSummaryRow.header).toHaveTextContent('t:project.summary');
        expect(totalSummaryRow.productRow).toHaveTextContent('45.00EUR');
        expect(totalSummaryRow.productRow).toHaveTextContent('125.00PLN');
        expect(totalSummaryRow.inquiryRow).toHaveTextContent('320.00PLN');

        // charts
        expect(screen.getAllByTestId(/unburst-chart-/)).toHaveLength(2);

        const eurChart = screen.getByTestId('sunburst-chart-EUR');
        expect(eurChart).toHaveTextContent('t:project.total45.00EUR');

        const plnChart = screen.getByTestId('sunburst-chart-PLN');
        expect(plnChart).toHaveTextContent('t:project.total445.00PLN');
    });

});
