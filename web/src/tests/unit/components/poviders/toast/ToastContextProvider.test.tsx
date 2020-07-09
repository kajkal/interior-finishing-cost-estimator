import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Color } from '@material-ui/lab/Alert/Alert';

import { ToastContextProvider } from '../../../../../code/components/providers/toast/ToastContextProvider';
import { ShowToast } from '../../../../../code/components/providers/toast/context/ToastContext';
import { useToast } from '../../../../../code/components/providers/toast/useToast';


describe('ToastContextProvider component', () => {

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

        render(<ToastContextProvider><SampleConsumer /></ToastContextProvider>);

        verifyIfToastIsAutomaticallyClosedAfterTimeout('info');
        verifyIfToastIsAutomaticallyClosedAfterTimeout('success');
        verifyIfToastIsAutomaticallyClosedAfterTimeout('warning');
        verifyIfToastIsAutomaticallyClosedAfterTimeout('error');
    });

    it('should display success toast and then close it on close button click', async (done) => {
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

        render(<ToastContextProvider><SampleConsumer /></ToastContextProvider>);

        await verifyIfToastIsClosedOnCloseButtonClick('info');
        await verifyIfToastIsClosedOnCloseButtonClick('success');
        await verifyIfToastIsClosedOnCloseButtonClick('warning');
        await verifyIfToastIsClosedOnCloseButtonClick('error');
        done();
    });

    it('should throw error when ToastContext is used without ToastContextProvider', () => {
        function verifyIfErrorIsThrownWhenToastContextIsUsedWithoutToastContextProvider(severity: Color) {
            function SampleConsumer() {
                const toast = useToast();
                React.useEffect(() => {
                    const toastRecord: Record<Color, ShowToast> = {
                        info: toast.infoToast,
                        success: toast.successToast,
                        warning: toast.warningToast,
                        error: toast.errorToast,
                    };
                    toastRecord[ severity ](() => null);
                }, []);
                return null;
            }

            try {
                render(<SampleConsumer />);
                expect('pass').toBe('should throw error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty('message', 'Missing ToastContext.Provider');
            }
        }

        const consoleErrorSpy = jest.spyOn(console, 'error')
            .mockImplementation((message?: any, ...optionalParams: any[]) => {
                if (typeof message === 'string') {
                    if (message.startsWith('Error: Uncaught [') || message.startsWith('The above error occurred')) {
                        // mute noisy ErrorBoundary errors
                        return;
                    }
                }
                console.warn(message, ...optionalParams);
            });

        verifyIfErrorIsThrownWhenToastContextIsUsedWithoutToastContextProvider('info');
        verifyIfErrorIsThrownWhenToastContextIsUsedWithoutToastContextProvider('success');
        verifyIfErrorIsThrownWhenToastContextIsUsedWithoutToastContextProvider('warning');
        verifyIfErrorIsThrownWhenToastContextIsUsedWithoutToastContextProvider('error');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(8);
        consoleErrorSpy.mockRestore();
    });

});
