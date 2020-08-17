import { atom } from 'recoil/dist';
import { Inquiry } from '../../../../graphql/generated-types';


export interface InquiryAddQuoteModalAtomValue {
    open: boolean;
    inquiryData?: Pick<Inquiry, 'id' | 'title' | 'description'>;
}

/**
 * @see InquiryAddQuoteModal - controlled modal
 */
export const inquiryAddQuoteModalAtom = atom<InquiryAddQuoteModalAtomValue>({
    key: 'inquiryAddQuoteModalAtom',
    default: {
        open: false,
    },
});
