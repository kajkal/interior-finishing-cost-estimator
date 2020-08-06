import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';


@ArgsType()
export class ProductDeleteFormData {

    @Field()
    @IsMongoId()
    productId!: string;

}
