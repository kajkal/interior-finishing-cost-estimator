import { atom } from 'recoil/dist';
import { Inquiry } from '../../../../graphql/generated-types';


export interface InquiryDeleteModalAtomValue {
    open: boolean;
    inquiryData?: Pick<Inquiry, 'id' | 'title'>;
}

export const inquiryDeleteModalAtom = atom<InquiryDeleteModalAtomValue>({
    key: 'inquiryDeleteModalAtom',
    default: {
        open: false,
    },
});
