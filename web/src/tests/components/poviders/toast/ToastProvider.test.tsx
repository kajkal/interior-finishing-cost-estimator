import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Color } from '@material-ui/lab/Alert/Alert';

import { ToastProvider } from '../../../../code/components/providers/toast/ToastProvider';
import { useToast } from '../../../../code/components/providers/toast/useToast';


describe('ToastProvider component', () => {

    const wrapper: React.ComponentType = ({ children }) => (
        <RecoilRoot>
            <ThemeProvider theme={createMuiTheme({ sideNavDrawer: { width: 100 } })}>
                <ToastProvider />
                {children}
            </ThemeProvider>
        </RecoilRoot>
    );

    function SampleConsumer() {
        const { infoToast, successToast, warningToast, errorToast } = useToast();
        return (
            <>
                <button
                    data-testid='info'
                    onClick={() => infoToast(() => <span data-testid='info-message' />)}
                />
                <button
                    data-testid='success'
                    onClick={() => successToast(() => <span data-testid='success-message' />)}
                />
                <button
                    data-testid='warning'
                    onClick={() => warningToast(() => <span data-testid='warning-message' />)}
                />
                <button
                    data-testid='error'
                    onClick={() => errorToast(() => <span data-testid='error-message' />)}
                />
            </>
        );
    }

    it('should display toast and then close it after timeout', () => {
        jest.useFakeTimers();

        function verifyIfToastIsAutomaticallyClosedAfterTimeout(severity: Color) {
            // verify if toast is not visible
            expect(screen.queryByRole('alert')).toBe(null);

            userEvent.click(screen.getByTestId(severity));

            // verify if toast and message are visible
            expect(screen.getByRole('alert')).toBeVisible();
            expect(screen.getByTestId(`${severity}-message`)).toBeVisible();

            act(() => {
                jest.advanceTimersByTime(300_000); // 5 min
            });

            // verify if toast is not visible
            expect(screen.queryByRole('alert')).toBe(null);
        }

        render(<SampleConsumer />, { wrapper });

        verifyIfToastIsAutomaticallyClosedAfterTimeout('info');
        verifyIfToastIsAutomaticallyClosedAfterTimeout('success');
        verifyIfToastIsAutomaticallyClosedAfterTimeout('warning');
        verifyIfToastIsAutomaticallyClosedAfterTimeout('error');
    });

    it('should display toast and then close it on close button click', async () => {
        async function verifyIfToastIsClosedOnCloseButtonClick(severity: Color) {
            // verify if toast is not visible
            expect(screen.queryByRole('alert')).toBe(null);

            userEvent.click(screen.getByTestId(severity));

            // verify if toast and message are visible
            expect(screen.getByRole('alert')).toBeVisible();
            expect(screen.getByTestId(`${severity}-message`)).toBeVisible();

            userEvent.click(screen.getByRole('button', { name: 't:common.closeToast' }));

            // verify if toast is not visible
            await waitFor(() => expect(screen.queryByRole('alert')).toBe(null));
        }

        render(<SampleConsumer />, { wrapper });

        await verifyIfToastIsClosedOnCloseButtonClick('info');
        await verifyIfToastIsClosedOnCloseButtonClick('success');
        await verifyIfToastIsClosedOnCloseButtonClick('warning');
        await verifyIfToastIsClosedOnCloseButtonClick('error');
    });

});
