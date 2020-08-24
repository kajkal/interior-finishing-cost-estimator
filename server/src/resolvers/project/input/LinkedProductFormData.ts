import { Field, Float, InputType } from 'type-graphql';
import { IsMongoId, Max, Min } from 'class-validator';


@InputType()
export class LinkedProductFormData {

    @Field()
    @IsMongoId()
    productId!: string;

    @Field(() => Float)
    @Max(1e6)
    @Min(0)
    amount!: number;

}
