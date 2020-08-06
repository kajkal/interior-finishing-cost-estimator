import { atom } from 'recoil/dist';


export interface ProductCreateModalAtomValue {
    open: boolean;
}

/**
 * @see ProductCreateModal - controlled modal
 */
export const productCreateModalAtom = atom<ProductCreateModalAtomValue>({
    key: 'productCreateModalAtom',
    default: {
        open: false,
    },
});
