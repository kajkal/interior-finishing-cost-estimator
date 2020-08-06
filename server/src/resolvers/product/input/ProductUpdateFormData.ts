import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';

import { ProductCreateFormData } from './ProductCreateFormData';


@ArgsType()
export class ProductUpdateFormData extends ProductCreateFormData {

    @Field()
    @IsMongoId()
    productId!: string;

}
