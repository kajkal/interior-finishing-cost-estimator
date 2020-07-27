import { Action } from 'history';
import { useBlocker } from 'react-router';


/**
 * When modal is open intercepts all navigation attempts (with exception for automatic logout), and closes modal first.
 */
export function useModalNavigationBlocker(onModalClose: () => void, isModalOpen: boolean): void {
    useBlocker((transition) => {
        onModalClose();
        if (transition.action === Action.Replace) { // automatic logout
            transition.retry();
        }
    }, isModalOpen);
}
