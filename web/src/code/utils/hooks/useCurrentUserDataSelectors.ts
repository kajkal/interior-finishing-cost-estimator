import React from 'react';

import { TagOption } from '../../components/common/form-fields/tags/TagsField';
import { useCurrentUserCachedData } from './useCurrentUserCachedData';
import { MeQuery } from '../../../graphql/generated-types';


export interface CurrentUserDataSelectors {

    /**
     * User' products tags
     */
    tags: () => Pick<TagOption, 'name'>[];

}


/**
 * Hook with lazy current user cached data selectors.
 */
export function useCurrentUserDataSelectors(): [ CurrentUserDataSelectors, MeQuery['me'] | undefined ] {
    const userData = useCurrentUserCachedData();
    const products = userData?.products;

    const tagsSelector = React.useMemo(() => {
        const initialState: Pick<TagOption, 'name'>[] = [];
        let memo = initialState;
        return () => {
            if (products && (memo === initialState)) {
                const uniqueTags = Array.from(new Set(products.flatMap(({ tags }) => tags || [])));
                const sortedTags = uniqueTags.sort((a, b) => a.localeCompare(b));
                memo = sortedTags.map((name) => ({ name }));
            }
            return memo;
        };
    }, [ products ]);


    return [ { tags: tagsSelector }, userData ];
}
