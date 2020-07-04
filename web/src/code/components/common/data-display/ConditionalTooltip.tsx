import React from 'react';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';


export interface ConditionalTooltipProps extends TooltipProps {
    condition: boolean;
}

export function ConditionalTooltip({ children, condition, title, ...rest }: ConditionalTooltipProps): React.ReactElement {
    return (
        <Tooltip {...rest} title={(condition) ? title : ''}>
            {children}
        </Tooltip>
    );
}

ConditionalTooltip.defaultProps = {
    arrow: true,
    placement: 'right',
};
