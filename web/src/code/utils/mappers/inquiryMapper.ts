import { InquiryUpdateFormData } from '../../components/modals/inquiry-update/inquiryUpdateModalAtom';
import { mapLocationToLocationOption } from './locationMapper';
import { Inquiry } from '../../../graphql/generated-types';


export function mapInquiryToInquiryUpdateFormData(inquiry: Inquiry): InquiryUpdateFormData {
    return {
        inquiryId: inquiry.id,
        title: inquiry.title,
        description: JSON.parse(inquiry.description),
        location: mapLocationToLocationOption(inquiry.location),
        category: inquiry.category,
    };
}
