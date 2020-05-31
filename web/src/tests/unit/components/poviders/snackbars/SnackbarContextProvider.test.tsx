import * as React from 'react';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';

import { SnackbarContextProvider } from '../../../../../code/components/providers/snackbars/SnackbarContextProvider';
import { useSnackbar } from '../../../../../code/components/providers/snackbars/useSnackbar';


describe('SnackbarContextProvider component', () => {

    function SampleConsumer() {
        const { infoSnackbar, successSnackbar, warningSnackbar, errorSnackbar } = useSnackbar();
        return (
            <>
                <button onClick={() => infoSnackbar('info message')}>info</button>
                <button onClick={() => successSnackbar('success message')}>success</button>
                <button onClick={() => warningSnackbar('warning message')}>warning</button>
                <button onClick={() => errorSnackbar('error message')}>error</button>
            </>
        );
    }

    async function verifyAlert(renderResult: RenderResult, severity: string) {
        const triggerButton = renderResult.getByRole('button', { name: severity });
        fireEvent.click(triggerButton);

        const alert = renderResult.getByRole('alert');
        expect(alert).toHaveTextContent(`${severity} message`);
        expect(alert).toHaveClass(`MuiAlert-filled${severity.charAt(0).toUpperCase() + severity.slice(1)}`);

        const alertCloseButton = renderResult.getByRole('button', { name: 'Close' });
        fireEvent.click(alertCloseButton);

        await waitFor(() => expect(renderResult.queryByRole('alert')).toBe(null));
    }

    it('should display alert on function call', async (done) => {
        const renderResult = render(
            <SnackbarContextProvider>
                <SampleConsumer />
            </SnackbarContextProvider>,
        );

        await verifyAlert(renderResult, 'info');
        await verifyAlert(renderResult, 'success');
        await verifyAlert(renderResult, 'warning');
        await verifyAlert(renderResult, 'error');
        done();
    });

});
