import { atom } from 'recoil/dist';
import { InquiryDataFragment } from '../../../../graphql/generated-types';


/**
 * @see InquiryModal - controlled modal
 */
export interface InquiryModalAtomValue {
    open: boolean;
    inquiryData?: InquiryDataFragment;
}

export const inquiryModalAtom = atom<InquiryModalAtomValue>({
    key: 'inquiryModalAtom',
    default: {
        open: false,
    },
});
