import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import { pageProgressAtom } from '../../atoms/page-progress/pageProgressAtom';


export interface PageLinearProgressRevealerProps {
    visible?: boolean;
}

export function PageLinearProgressRevealer({ visible = true }: PageLinearProgressRevealerProps): null {
    const setPageLoading = useSetRecoilState(pageProgressAtom);

    React.useEffect(() => {
        setPageLoading(visible);
        return () => {
            setPageLoading(false);
        };
    }, [ visible, setPageLoading ]);

    return null;
}
