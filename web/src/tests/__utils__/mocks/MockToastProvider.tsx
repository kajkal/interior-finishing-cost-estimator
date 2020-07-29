import React from 'react';
import { TFunction } from 'i18next';
import { useRecoilValue } from 'recoil/dist';

import { mockTFunction } from '../../__mocks__/libraries/react-i18next';
import { toastAtom } from '../../../code/components/providers/toast/atoms/toastAtom';


export function MockToastProvider(): React.ReactElement | null {
    const { Toast, open, severity, autoHideDuration } = useRecoilValue(toastAtom);
    return (open)
        ? (
            <div
                data-testid='MockToast'
                className={severity}
                data-disableautohide={autoHideDuration === null}
            >
                <Toast t={mockTFunction as unknown as TFunction} />
            </div>
        )
        : null;
}
