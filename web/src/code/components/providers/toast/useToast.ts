import React from 'react';
import { useSetRecoilState } from 'recoil/dist';

import { ToastContentProps } from './interfaces/ToastContentProps';
import { ToastConfig } from './interfaces/ToastConfig';
import { toastAtom } from './atoms/toastAtom';


export type ShowToast = (Toast: React.ComponentType<ToastContentProps>, config?: ToastConfig) => void;

export interface Toasts {
    infoToast: ShowToast;
    successToast: ShowToast;
    warningToast: ShowToast;
    errorToast: ShowToast;
}

export function useToast() {
    const setToast = useSetRecoilState(toastAtom);
    return React.useMemo<Toasts>(() => ({
        infoToast: (Toast, config) => {
            setToast({
                severity: 'info',
                open: true,
                key: toastUniqueKey++,
                Toast,
                autoHideDuration: config?.disableAutoHide ? null : 4000,
            });
        },
        successToast: (Toast, config) => {
            setToast({
                severity: 'success',
                open: true,
                key: toastUniqueKey++,
                Toast,
                autoHideDuration: config?.disableAutoHide ? null : 6000,
            });
        },
        warningToast: (Toast, config) => {
            setToast({
                severity: 'warning',
                open: true,
                key: toastUniqueKey++,
                Toast,
                autoHideDuration: config?.disableAutoHide ? null : 10000,
            });
        },
        errorToast: (Toast, config) => {
            setToast({
                severity: 'error',
                open: true,
                key: toastUniqueKey++,
                Toast,
                autoHideDuration: config?.disableAutoHide ? null : 15000,
            });
        },
    }), [ setToast ]);
}

let toastUniqueKey = 0;
