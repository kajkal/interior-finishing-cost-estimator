import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';

import { useSearchParams } from '../../../code/utils/hooks/useSearchParams';


describe('useSearchParams hook', () => {

    function createWrapper(location: string): React.ComponentType {
        return (props) => (
            <MemoryRouter initialEntries={[ location ]}>
                {props.children as React.ReactElement}
            </MemoryRouter>
        );
    }

    it('should work when there is no search in current location', () => {
        const { result } = renderHook(() => useSearchParams('a', 'b'), {
            wrapper: createWrapper('/'),
        });
        expect(result.current).toEqual({ a: null, b: null });
    });

    it('should return null when given parameter cannot be found in current location', () => {
        const { result } = renderHook(() => useSearchParams('a', 'b'), {
            wrapper: createWrapper('/?c=3'),
        });
        expect(result.current).toEqual({ a: null, b: null });
    });

    it('should parse search parameter from current location', () => {
        const { result } = renderHook(() => useSearchParams('a', 'b'), {
            wrapper: createWrapper('/?a=1234'),
        });
        expect(result.current).toEqual({ a: '1234', b: null });
    });

    it('should parse multiple search parameters from current location', () => {
        const { result } = renderHook(() => useSearchParams('a', 'b'), {
            wrapper: createWrapper('/?a=1234&b=hello'),
        });
        expect(result.current).toEqual({ a: '1234', b: 'hello' });
    });

});
