import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import { pageProgressAtom } from '../../atoms/page-progress/pageProgressAtom';


export function usePageLinearProgressRevealer(visible: boolean) {
    const setPageLoading = useSetRecoilState(pageProgressAtom);

    React.useEffect(() => {
        setPageLoading(visible);
        return () => {
            setPageLoading(false);
        };
    }, [ visible, setPageLoading ]);

}
