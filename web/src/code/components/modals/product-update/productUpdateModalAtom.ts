import { atom } from 'recoil/dist';
import { SlateDocument } from '@udecode/slate-plugins';

import { CurrencyAmount } from '../../common/form-fields/currency-amount/FormikCurrencyAmountField';
import { TagOption } from '../../common/form-fields/tags/TagsField';
import { Product } from '../../../../graphql/generated-types';


export interface ProductUpdateFormData {
    productId: string,
    name: string;
    description: SlateDocument;
    price: CurrencyAmount;
    tags: TagOption[];
}

/**
 * @see ProductUpdateModal - controlled modal
 */
export interface ProductUpdateModalAtomValue {
    open: boolean;
    productData?: ProductUpdateFormData;
}

export const productUpdateModalAtom = atom<ProductUpdateModalAtomValue>({
    key: 'productUpdateModalAtom',
    default: {
        open: false,
    },
});

export function mapProductToProductUpdateFormData(product: Product): ProductUpdateFormData {
    return {
        productId: product.id,
        name: product.name,
        description: JSON.parse(product.description),
        price: {
            currency: product.price?.currency || 'PLN',
            amount: product.price?.amount,
        },
        tags: product.tags?.map((name) => ({ name })) || [],
    };
}
