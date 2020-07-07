import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

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

    async function verifyAlert(severity: string) {
        const triggerButton = screen.getByRole('button', { name: severity });
        userEvent.click(triggerButton);

        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(`${severity} message`);
        expect(alert).toHaveClass(`MuiAlert-filled${severity.charAt(0).toUpperCase() + severity.slice(1)}`);

        const alertCloseButton = screen.getByRole('button', { name: 'Close' });
        userEvent.click(alertCloseButton);

        await waitFor(() => expect(screen.queryByRole('alert')).toBe(null));
    }

    it('should display alert on function call', async (done) => {
        render(
            <SnackbarContextProvider>
                <SampleConsumer />
            </SnackbarContextProvider>,
        );

        await verifyAlert('info');
        await verifyAlert('success');
        await verifyAlert('warning');
        await verifyAlert('error');
        done();
    });

});
