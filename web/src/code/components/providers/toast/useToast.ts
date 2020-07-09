import React from 'react';
import { ToastContext, ToastContextData } from './context/ToastContext';


export function useToast(): ToastContextData {
    return React.useContext(ToastContext);
}
