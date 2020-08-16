import { TFunction } from 'i18next';

import { InquiryUpdateFormData } from '../../components/modals/inquiry-update/inquiryUpdateModalAtom';
import { CategoryOption } from '../../components/common/form-fields/category/CategoryField';
import { categoryTranslationKeyMap } from '../../config/supportedCategories';
import { Category, Inquiry } from '../../../graphql/generated-types';
import { mapLocationToLocationOption } from './locationMapper';


export function mapInquiryToInquiryUpdateFormData(inquiry: Inquiry, t: TFunction): InquiryUpdateFormData {
    return {
        inquiryId: inquiry.id,
        title: inquiry.title,
        description: JSON.parse(inquiry.description),
        location: mapLocationToLocationOption(inquiry.location),
        category: mapCategoryToCategoryOption(inquiry.category, t),
    };
}

function mapCategoryToCategoryOption(category: Category, t: TFunction): CategoryOption {
    return {
        id: category,
        label: t(categoryTranslationKeyMap[ category ]),
    };
}
