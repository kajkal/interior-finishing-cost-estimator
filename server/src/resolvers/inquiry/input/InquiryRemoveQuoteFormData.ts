import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';


@ArgsType()
export class InquiryRemoveQuoteFormData {

    @Field()
    @IsMongoId()
    inquiryId!: string;

    @Field()
    quoteDate!: Date;

}
