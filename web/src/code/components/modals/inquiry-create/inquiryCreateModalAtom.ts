import { atom } from 'recoil/dist';
import { LocationOption } from '../../common/form-fields/location/LocationField';


export interface InquiryCreateModalAtomValue {
    open: boolean;
    initialLocation?: LocationOption | null;
}

/**
 * @see InquiryCreateModal - controlled modal
 */
export const inquiryCreateModalAtom = atom<InquiryCreateModalAtomValue>({
    key: 'inquiryCreateModalAtom',
    default: {
        open: false,
    },
});
