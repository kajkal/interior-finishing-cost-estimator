import { atom } from 'recoil/dist';

import { CreateRoomMutationVariables, Project, RoomType } from '../../../../graphql/generated-types';
import { ProductAmountOption } from '../../common/form-fields/room/ProductSelector';
import { InquiryOption } from '../../common/form-fields/room/InquirySelector';


export interface RoomCreateFormData extends Omit<CreateRoomMutationVariables, 'type' | 'products' | 'inquiries'> {
    type: RoomType | null;
    products: ProductAmountOption[];
    inquiries: InquiryOption[];
}

export interface RoomCreateModalAtomValue {
    open: boolean;
    projectData?: Pick<Project, 'slug'>;
}

/**
 * @see RoomCreateModal - controlled modal
 */
export const roomCreateModalAtom = atom<RoomCreateModalAtomValue>({
    key: 'roomCreateModalAtom',
    default: {
        open: false,
    },
});
