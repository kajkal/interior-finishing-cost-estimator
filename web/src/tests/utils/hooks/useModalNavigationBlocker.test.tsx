import React from 'react';
import { State, To } from 'history';
import { act, renderHook } from '@testing-library/react-hooks';
import { MemoryRouter, NavigateFunction, useNavigate } from 'react-router';

import { useModalNavigationBlocker } from '../../../code/utils/hooks/useModalNavigationBlocker';


describe('useModalNavigationBlocker hook', () => {

    function createWrapperWithNavigator() {
        let navigate!: NavigateFunction;
        const Handle = () => {
            navigate = useNavigate();
            return null;
        };
        return {
            wrapper: ({ children }: React.PropsWithChildren<{}>) => (
                <MemoryRouter initialEntries={[ '/initial' ]}>
                    <Handle />
                    {children}
                </MemoryRouter>
            ),
            navigate: (to: To, options?: { replace?: boolean; state?: State }) => {
                act(() => navigate(to, options));
            },
        };
    }

    it('should block back/forward navigation attempts only when modal is open', () => {
        const { wrapper, navigate } = createWrapperWithNavigator();
        const mockModalClose = jest.fn();
        const { rerender } = renderHook<[ () => void, boolean ], void>(
            ([ onModalClose = mockModalClose, isModalOpen = false ]) => (
                useModalNavigationBlocker(onModalClose, isModalOpen)
            ), {
                wrapper,
            });

        // verify if navigation works when modal is closed
        navigate('/push-path');
        navigate('/replace-path', { replace: true });
        expect(mockModalClose).toHaveBeenCalledTimes(0);

        rerender([ mockModalClose, true ]);

        // verify if navigation is intercepted when modal is open
        navigate('/push-path');
        navigate('/replace-path', { replace: true });
        expect(mockModalClose).toHaveBeenCalledTimes(2);
    });

});
