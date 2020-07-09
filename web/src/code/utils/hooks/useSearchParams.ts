import React from 'react';
import { useLocation } from 'react-router-dom';


/**
 * @example
 * // for url: /path?b=value
 * useSearchParameters('a', 'b'); // {a: null, b: 'value'}
 */
export function useSearchParams<ParamNames extends string[]>(...parameterNames: ParamNames): Record<ParamNames[number], string | null> {
    const { search } = useLocation();
    return React.useMemo(() => {
        const searchParams = new URLSearchParams(search);
        return parameterNames.reduce((accumulator, parameterName: ParamNames[number]) => {
            accumulator[ parameterName ] = searchParams.get(parameterName);
            return accumulator;
        }, {} as Record<ParamNames[number], string | null>);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ search, parameterNames.join(',') ]);
}
