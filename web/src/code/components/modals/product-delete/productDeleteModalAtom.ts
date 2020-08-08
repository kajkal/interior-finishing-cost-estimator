import { atom } from 'recoil/dist';
import { Product } from '../../../../graphql/generated-types';


export interface ProductDeleteModalAtomValue {
    open: boolean;
    productData?: Pick<Product, 'id' | 'name'>;
}

export const productDeleteModalAtom = atom<ProductDeleteModalAtomValue>({
    key: 'productDeleteModalAtom',
    default: {
        open: false,
    },
});
