import { atom } from 'recoil/dist';
import { Inquiry } from '../../../../graphql/generated-types';


export interface InquiryDeleteModalAtomValue {
    open: boolean;
    inquiryData?: Pick<Inquiry, 'id' | 'title'>;
}

/**
 * @see InquiryDeleteModal - controlled modal
 */
export const inquiryDeleteModalAtom = atom<InquiryDeleteModalAtomValue>({
    key: 'inquiryDeleteModalAtom',
    default: {
        open: false,
    },
});
