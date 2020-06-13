import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useSearchParams } from '../../../../code/utils/hooks/useSearchParams';


describe('useSearchParams hook', () => {

    function HookTestVessel({ parameterNames }: { parameterNames: string[] }) {
        const results = useSearchParams(...parameterNames);
        console.log({ results });
        return <div data-testid='results' data-results={JSON.stringify(results)} />;
    }

    function extractHookResults(location: string, ...parameterNames: string[]): Record<string, string | null> {
        const { getByTestId } = render(
            <MemoryRouter initialEntries={[ location ]}>
                <HookTestVessel parameterNames={parameterNames} />
            </MemoryRouter>,
        );
        return JSON.parse(getByTestId('results').dataset.results!);
    }

    it('should work when there is no search in current location', () => {
        const result = extractHookResults('/', 'a', 'b');
        expect(result).toEqual({ a: null, b: null });
    });

    it('should return null when given parameter cannot be found in current location', () => {
        const result = extractHookResults('/?c=3', 'a', 'b');
        expect(result).toEqual({ a: null, b: null });
    });

    it('should parse search parameter from current location', () => {
        const result = extractHookResults('/?a=1234', 'a', 'b');
        expect(result).toEqual({ a: '1234', b: null });
    });

    it('should parse multiple search parameters from current location', () => {
        const result = extractHookResults('/?a=1234&b=hello', 'a', 'b');
        expect(result).toEqual({ a: '1234', b: 'hello' });
    });

});
