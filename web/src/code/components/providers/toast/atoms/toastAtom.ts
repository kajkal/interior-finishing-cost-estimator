import React from 'react';
import { atom } from 'recoil/dist';

import { ToastContentProps } from '../interfaces/ToastContentProps';


export interface ToastState {
    severity: 'info' | 'success' | 'warning' | 'error';
    open: boolean;
    key: number;
    Toast: React.ComponentType<ToastContentProps>;
    autoHideDuration: number | null;
}

export const toastAtom = atom<ToastState>({
    key: 'toastAtom',
    default: {
        severity: 'info',
        open: false,
        key: -1,
        Toast: () => null,
        autoHideDuration: null,
    },
});
