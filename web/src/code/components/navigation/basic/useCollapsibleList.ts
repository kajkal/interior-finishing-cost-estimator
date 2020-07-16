import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';


export function useCollapsibleList(initialState: boolean, isSideNavOpen: boolean, onSideNavToggle: () => void) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [ expanded, setExpanded ] = React.useState(initialState);

    const handleClick = () => {
        if (!isSideNavOpen) {
            onSideNavToggle();
            setExpanded(true);
        } else {
            setExpanded(!expanded);
        }
    };

    return {
        expanded: (isMobile) ? expanded : (expanded && isSideNavOpen),
        onListTrigger: handleClick,
    };
}
