import { InquiryDataFragment, ProductDataFragment, ProjectDetailedDataFragment, RoomDataFragment, UserDetailedDataFragment } from '../../../graphql/generated-types';


export interface CompleteLinkedProduct {
    product: ProductDataFragment;
    amount: number;
}

export interface CompleteRoom extends Omit<RoomDataFragment, 'products' | 'inquiries'> {
    products: CompleteLinkedProduct[];
    inquiries: InquiryDataFragment[];
}

export interface CompleteProjectData extends Omit<ProjectDetailedDataFragment, 'rooms'> {
    rooms: CompleteRoom[];
}

export function mapProjectDataToCompleteProjectData(project: ProjectDetailedDataFragment, { products, inquiries }: Pick<UserDetailedDataFragment, 'products' | 'inquiries'>): CompleteProjectData {
    const idProductMap = new Map(products.map((product) => [ product.id, product ]));
    const idInquiryMap = new Map(inquiries.map((inquiry) => [ inquiry.id, inquiry ]));
    return {
        ...project,
        rooms: (project.rooms || []).map((room) => ({
            ...room,
            products: (room.products || [])
                .map(({ productId, amount }) => ({ product: idProductMap.get(productId), amount }))
                .filter((linkedProduct): linkedProduct is CompleteLinkedProduct => Boolean(linkedProduct.product)),
            inquiries: (room.inquiries || [])
                .map(({ inquiryId }) => idInquiryMap.get(inquiryId))
                .filter((inquiry): inquiry is InquiryDataFragment => Boolean(inquiry)),
        })),
    };
}
