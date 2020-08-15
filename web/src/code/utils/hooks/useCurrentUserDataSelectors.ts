import { useCurrentUserCachedData } from './useCurrentUserCachedData';
import { MeQuery, Product } from '../../../graphql/generated-types';


export interface Option {
    name: string;
    occurrenceCount?: number;
}

export interface ProductsDatesStatistics {
    min: string;
    max: string;
}

export interface CurrentUserDataSelectors {

    /**
     * User' products tags
     */
    tags: () => Option[];

    /**
     * Products dates related statistics
     */
    dates: () => ProductsDatesStatistics | undefined;

}

/**
 * Hook with lazy current user cached data selectors.
 */
export function useCurrentUserDataSelectors(): [ CurrentUserDataSelectors, MeQuery['me'] | undefined ] {
    const userData = useCurrentUserCachedData();
    const products = userData?.products;

    const tagsSelector = () => {
        const valueFromMemory: Option[] | undefined = tagsMemory.get(products!);
        if (products && products.length && !valueFromMemory) {
            const tagNameOccurrenceCountMap = products.reduce((map, { tags }) => {
                tags?.forEach((tag) => {
                    const tagOccurrenceCount = map.get(tag) || 0;
                    map.set(tag, tagOccurrenceCount + 1)
                })
                return map;
            }, new Map<string, number>());
            const tags = Array.from(tagNameOccurrenceCountMap, ([name, occurrenceCount]) => ({ name,  occurrenceCount}));
            const sortedTags = tags.sort(({ name: a }, { name: b }) => a.localeCompare(b));
            tagsMemory.set(products, sortedTags);
            return sortedTags;
        }
        return valueFromMemory || [];
    }

    const datesSelector = () => {
        const valueFromMemory: ProductsDatesStatistics | undefined = datesMemory.get(products!);
        if (products && products.length && !valueFromMemory) {
            const dates = products.reduce(({ min, max }, { createdAt }) => ({
                min: (min.localeCompare(createdAt) < 0) ? min : createdAt,
                max: (max.localeCompare(createdAt) > 0) ? max : createdAt,
            }), { min: products[ 0 ].createdAt, max: products[ 0 ].createdAt });
            datesMemory.set(products, dates);
            return dates;
        }
        return valueFromMemory;
    }

    return [ { tags: tagsSelector, dates: datesSelector }, userData ];
}

const tagsMemory = new WeakMap<Product[], Option[]>();
const datesMemory = new WeakMap<Product[], ProductsDatesStatistics>();
