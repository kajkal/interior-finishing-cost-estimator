import React from 'react';


export interface ToolbarButtonGroupProps extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode;
}

export function ToolbarButtonGroup({ children, ...rest }: ToolbarButtonGroupProps): React.ReactElement {
    return (
        <div role='group' {...rest}>
            {children}
        </div>
    );
}
