import { atom } from 'recoil/dist';

import { ProductAmountOption } from '../../common/form-fields/room/ProductSelector';
import { InquiryOption } from '../../common/form-fields/room/InquirySelector';
import { RoomType } from '../../../../graphql/generated-types';


export interface RoomUpdateFormData {
    projectSlug: string;
    roomId: string;
    type: RoomType | null;
    name: string
    floor: number | undefined
    wall: number | undefined
    ceiling: number | undefined
    products: ProductAmountOption[];
    inquiries: InquiryOption[];
}

export interface RoomUpdateModalAtomValue {
    open: boolean;
    formInitialValues?: RoomUpdateFormData;
}

/**
 * @see RoomUpdateModal - controlled modal
 */
export const roomUpdateModalAtom = atom<RoomUpdateModalAtomValue>({
    key: 'roomUpdateModalAtom',
    default: {
        open: false,
    },
});
