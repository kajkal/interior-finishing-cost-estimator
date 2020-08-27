import { atom } from 'recoil/dist';
import { ProductDataFragment } from '../../../../graphql/generated-types';


/**
 * @see ProductModal - controlled modal
 */
export interface ProductModalAtomValue {
    open: boolean;
    productData?: ProductDataFragment;
}

export const productModalAtom = atom<ProductModalAtomValue>({
    key: 'productModalAtom',
    default: {
        open: false,
    },
});
