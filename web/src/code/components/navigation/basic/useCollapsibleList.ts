import React from 'react';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';


export function useCollapsibleList(initialState: boolean, isSideNavOpen: boolean, onSideNavToggle: () => void) {
    const [ open, setOpen ] = React.useState(initialState);

    const handleClick = () => {
        if (!isSideNavOpen) {
            onSideNavToggle();
            setOpen(true);
        } else {
            setOpen(!open);
        }
    };

    return {
        open: open && isSideNavOpen,
        onClick: handleClick,
        ExpandIcon: open ? ExpandLess : ExpandMore,
    };
}
