import React from 'react';
import { useTranslation } from 'react-i18next';

import { ProductAmountOption } from '../../components/common/form-fields/room/ProductSelector';
import { InquiryOption } from '../../components/common/form-fields/room/InquirySelector';
import { Inquiry, MeQuery, Product } from '../../../graphql/generated-types';
import { useCurrentUserCachedData } from './useCurrentUserCachedData';
import { categoryConfigMap } from '../../config/supportedCategories';


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

    productAmounts: () => ProductAmountOption[];

    inquiries: () => InquiryOption[];

}

/**
 * Hook with lazy current user cached data selectors.
 */
export function useCurrentUserDataSelectors(): [ CurrentUserDataSelectors, MeQuery['me'] | undefined ] {
    const { t, i18n } = useTranslation();
    const userData = useCurrentUserCachedData();
    const products = userData?.products;
    const inquiries = userData?.inquiries;

    const tagsSelector = () => {
        const valueFromMemory: Option[] | undefined = tagsMemory.get(products!);
        if (products?.length && !valueFromMemory) {
            const tagNameOccurrenceCountMap = products.reduce((map, { tags }) => {
                tags?.forEach((tag) => {
                    const tagOccurrenceCount = map.get(tag) || 0;
                    map.set(tag, tagOccurrenceCount + 1);
                });
                return map;
            }, new Map<string, number>());
            const tags = Array.from(tagNameOccurrenceCountMap, ([ name, occurrenceCount ]) => ({
                name,
                occurrenceCount,
            }));
            const sortedTags = tags.sort(({ name: a }, { name: b }) => a.localeCompare(b));
            tagsMemory.set(products, sortedTags);
            return sortedTags;
        }
        return valueFromMemory || [];
    };

    const datesSelector = () => {
        const valueFromMemory: ProductsDatesStatistics | undefined = datesMemory.get(products!);
        if (products?.length && !valueFromMemory) {
            const dates = products.reduce(({ min, max }, { createdAt }) => ({
                min: (min.localeCompare(createdAt) < 0) ? min : createdAt,
                max: (max.localeCompare(createdAt) > 0) ? max : createdAt,
            }), { min: products[ 0 ].createdAt, max: products[ 0 ].createdAt });
            datesMemory.set(products, dates);
            return dates;
        }
        return valueFromMemory;
    };

    const productAmountsSelector = () => {
        const valueFromMemory: ProductAmountOption[] | undefined = productAmountsMemory.get(products!);
        if (products?.length && !valueFromMemory) {
            const productOptions = products.map((product) => ({ product, amount: 1 }));
            productAmountsMemory.set(products, productOptions);
            return productOptions;
        }
        return valueFromMemory || [];
    };

    React.useEffect(() => {
        inquiriesMemory.delete(inquiries!);
    }, [ i18n.language, inquiries ]);

    const inquiriesSelector = () => {
        const valueFromMemory: InquiryOption[] | undefined = inquiriesMemory.get(inquiries!);
        if (inquiries?.length && !valueFromMemory) {
            const inquiryOptions = inquiries.map((inquiry) => ({
                ...inquiry,
                translatedCategory: t(categoryConfigMap[ inquiry.category ].tKey),
            }));
            inquiriesMemory.set(inquiries, inquiryOptions);
            return inquiryOptions;
        }
        return valueFromMemory || [];
    };

    return [
        {
            tags: tagsSelector,
            dates: datesSelector,
            productAmounts: productAmountsSelector,
            inquiries: inquiriesSelector,
        },
        userData,
    ];
}

const tagsMemory = new WeakMap<Product[], Option[]>();
const datesMemory = new WeakMap<Product[], ProductsDatesStatistics>();
const productAmountsMemory = new WeakMap<Product[], ProductAmountOption[]>();
const inquiriesMemory = new WeakMap<Inquiry[], InquiryOption[]>();
