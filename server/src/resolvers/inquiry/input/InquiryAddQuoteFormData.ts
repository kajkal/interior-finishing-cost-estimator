import { ArgsType, Field } from 'type-graphql';
import { IsMongoId, ValidateNested } from 'class-validator';

import { CurrencyAmountFormData } from '../../common/input/CurrencyAmountFormData';


@ArgsType()
export class InquiryAddQuoteFormData {

    @Field()
    @IsMongoId()
    inquiryId!: string;

    @Field(() => CurrencyAmountFormData)
    @ValidateNested()
    price!: CurrencyAmountFormData;

}
