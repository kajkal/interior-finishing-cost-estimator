/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: document.createRange is not a function]'
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { FormattedProductAmount } from '../../../../../../code/components/pages/project/sections/room/FormattedProductAmount';


describe('FormattedProductAmount component', () => {

    it('should toggle tooltip on hover', async () => {
        render(
            <FormattedProductAmount
                quantity={2}
                currencyAmount={{ currency: 'PLN', amount: 45 }}
            />,
        );

        const formattedAmount = screen.getByText('90.00');
        fireEvent.mouseOver(formattedAmount);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(/45.00PLN/);
        expect(tooltip).toHaveTextContent(/x 2/);
        expect(tooltip).toHaveTextContent(/90.00PLN/);

        fireEvent.mouseLeave(formattedAmount);
        await waitForElementToBeRemoved(tooltip);
    });

    it('should toggle tooltip on click', async () => {
        render(
            <FormattedProductAmount
                quantity={2}
                currencyAmount={{ currency: 'PLN', amount: 45 }}
            />,
        );

        const formattedAmount = screen.getByText('90.00');
        userEvent.click(formattedAmount);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(/45.00PLN/);
        expect(tooltip).toHaveTextContent(/x 2/);
        expect(tooltip).toHaveTextContent(/90.00PLN/);
    });

});
