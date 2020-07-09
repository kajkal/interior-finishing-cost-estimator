import React from 'react';
import { TFunction } from 'i18next';


/**
 * Toast content component props.
 */
export interface ToastContentProps {
    t: TFunction;
}

/**
 * Toast configuration.
 */
export interface ToastConfig {
    /**
     * If set to true: toast will not be automatically closed.
     * Default false.
     */
    disableAutoHide?: boolean;
}

export type ShowToast = (Toast: React.ComponentType<ToastContentProps>, config?: ToastConfig) => void;

export interface ToastContextData {
    infoToast: ShowToast;
    successToast: ShowToast;
    warningToast: ShowToast;
    errorToast: ShowToast;
}

export const missingToastContextProvider: ShowToast = () => {
    throw new Error('Missing ToastContext.Provider');
};

const defaultToastContextData: ToastContextData = {
    infoToast: missingToastContextProvider,
    successToast: missingToastContextProvider,
    warningToast: missingToastContextProvider,
    errorToast: missingToastContextProvider,
};

export const ToastContext = React.createContext(defaultToastContextData);
