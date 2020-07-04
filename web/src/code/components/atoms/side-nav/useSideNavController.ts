import React from 'react';
import { useRecoilState } from 'recoil/dist';

import { saveSideNavAtomState, sideNavAtom } from './sideNavAtom';


export interface SideNavController {
    isSideNavOpen: boolean;
    onSideNavToggle: () => void;
}

export function useSideNavController(): SideNavController {
    const [ isSideNavOpen, setSideNavOpen ] = useRecoilState(sideNavAtom);

    React.useEffect(() => {
        saveSideNavAtomState(isSideNavOpen);
    }, [ isSideNavOpen ]);

    const handleSideNavToggle = React.useCallback(() => {
        setSideNavOpen(isOpen => !isOpen);
    }, []);

    return { isSideNavOpen, onSideNavToggle: handleSideNavToggle };
}
