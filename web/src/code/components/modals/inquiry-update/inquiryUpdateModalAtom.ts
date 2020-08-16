import { atom } from 'recoil/dist';
import { SlateDocument } from '@udecode/slate-plugins';

import { LocationOption } from '../../common/form-fields/location/LocationField';
import { CategoryOption } from '../../common/form-fields/category/CategoryField';


export interface InquiryUpdateFormData {
    inquiryId: string,
    title: string;
    description: SlateDocument;
    location: LocationOption | null;
    category: CategoryOption | null;
}

/**
 * @see InquiryUpdateModal - controlled modal
 * @see mapInquiryToInquiryUpdateFormData - data mapper
 */
export interface InquiryUpdateModalAtomValue {
    open: boolean;
    inquiryData?: InquiryUpdateFormData;
}

export const inquiryUpdateModalAtom = atom<InquiryUpdateModalAtomValue>({
    key: 'inquiryUpdateModalAtom',
    default: {
        open: false,
    },
});
