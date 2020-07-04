import React from 'react';
import { render, screen } from '@testing-library/react';

import { ConditionalTooltip } from '../../../../../code/components/common/data-display/ConditionalTooltip';


describe('ConditionalTooltip component', () => {

    it('should render tooltip', () => {
        render(
            <ConditionalTooltip condition={true} title='Tooltip title'>
                <div>Tooltip trigger</div>
            </ConditionalTooltip>,
        );

        const tooltipTrigger = screen.getByText('Tooltip trigger');
        expect(tooltipTrigger).toHaveAttribute('title', 'Tooltip title');
    });

    it('should not render tooltip when condition is not met', () => {
        render(
            <ConditionalTooltip condition={false} title='Tooltip title'>
                <div>Tooltip trigger</div>
            </ConditionalTooltip>,
        );

        const tooltipTrigger = screen.getByText('Tooltip trigger');
        expect(tooltipTrigger).toHaveAttribute('title', '');
    });

});
