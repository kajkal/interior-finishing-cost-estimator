import { InquiryUpdateFormData } from '../../components/modals/inquiry-update/inquiryUpdateModalAtom';
import { Inquiry, PriceQuoteDataFragment } from '../../../graphql/generated-types';
import { mapLocationToLocationOption } from './locationMapper';


export function mapInquiryToInquiryUpdateFormData(inquiry: Inquiry): InquiryUpdateFormData {
    return {
        inquiryId: inquiry.id,
        title: inquiry.title,
        description: JSON.parse(inquiry.description),
        location: mapLocationToLocationOption(inquiry.location),
        category: inquiry.category,
    };
}

export function findLowestQuote(inquiry: Inquiry): PriceQuoteDataFragment | undefined {
    const quotesCopy = inquiry.quotes?.length ? [ ...inquiry.quotes ] : [];
    return quotesCopy.sort((a, b) => a.price.amount - b.price.amount).find(Boolean);
}
