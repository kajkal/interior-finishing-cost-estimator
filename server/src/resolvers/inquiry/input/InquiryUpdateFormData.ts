import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';

import { InquiryCreateFormData } from './InquiryCreateFormData';


@ArgsType()
export class InquiryUpdateFormData extends InquiryCreateFormData {

    @Field()
    @IsMongoId()
    inquiryId!: string;

}
