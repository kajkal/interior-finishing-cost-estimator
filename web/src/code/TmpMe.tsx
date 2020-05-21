import React from 'react';
import { useMeQuery } from '../graphql/generated-types';


export function TmpMe(): React.ReactElement | null {
    const {data, error} = useMeQuery();
    console.log('%cTmpMe RENDER', 'color: darkorange; font-weight: bold;');

    return (
        <div>
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
            <pre>
                {JSON.stringify(error, null, 2)}
            </pre>
        </div>
    );
}
