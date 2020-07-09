import React from 'react';
import { TFunction } from 'i18next';
import { render } from '@testing-library/react';
import { Color } from '@material-ui/lab/Alert';

import { mockTFunction } from '../../__mocks__/libraries/react-i18next';

import { ShowToast, ToastContext } from '../../../code/components/providers/toast/context/ToastContext';


export interface MockToastContextProviderProps {
    children: React.ReactNode;
}

export function MockToastContextProvider(props: MockToastContextProviderProps): React.ReactElement {
    return (
        <ToastContext.Provider value={MockToastContextData}>
            {props.children}
        </ToastContext.Provider>
    );
}

export class MockToastContextData {

    static infoToast = jest.fn(MockToastContextData.createShowToastMockImplementation('info'));
    static successToast = jest.fn(MockToastContextData.createShowToastMockImplementation('success'));
    static warningToast = jest.fn(MockToastContextData.createShowToastMockImplementation('warning'));
    static errorToast = jest.fn(MockToastContextData.createShowToastMockImplementation('error'));

    static setupMocks() {
        this.infoToast.mockClear();
        this.successToast.mockClear();
        this.warningToast.mockClear();
        this.errorToast.mockClear();
    }

    private static createShowToastMockImplementation(severity: Color): ShowToast {
        return (Toast, config) => {
            render(
                <div
                    data-testid='MockToast'
                    className={severity}
                    data-disableautohide={config?.disableAutoHide}
                >
                    <Toast t={mockTFunction as unknown as TFunction} />
                </div>,
            );
        };
    }

}
