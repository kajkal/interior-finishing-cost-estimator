import React from 'react';
import { useMobileDetect } from '../../../utils/hooks/useMobileDetect';


export function useCollapsibleList(initialState: boolean, isSideNavOpen: boolean, onSideNavToggle: () => void) {
    const isMobile = useMobileDetect();
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
