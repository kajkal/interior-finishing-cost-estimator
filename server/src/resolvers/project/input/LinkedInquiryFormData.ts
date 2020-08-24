import { Field, InputType } from 'type-graphql';
import { IsMongoId } from 'class-validator';


@InputType()
export class LinkedInquiryFormData {

    @Field()
    @IsMongoId()
    inquiryId!: string;

}
