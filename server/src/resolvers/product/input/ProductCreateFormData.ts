import { ArgsType, Field } from 'type-graphql';
import { Length, ValidateNested } from 'class-validator';

import { CurrencyAmountFormData } from '../../common/input/CurrencyAmountFormData';


@ArgsType()
export class ProductCreateFormData {

    @Field()
    @Length(3, 255)
    name!: string;

    @Field()
    @Length(3)
    description!: string;

    @Field(() => CurrencyAmountFormData, { nullable: true })
    @ValidateNested()
    price?: CurrencyAmountFormData | null;

    @Field(() => [ String ], { nullable: true })
    @Length(1, 255, { each: true })
    tags?: string[] | null;

}
