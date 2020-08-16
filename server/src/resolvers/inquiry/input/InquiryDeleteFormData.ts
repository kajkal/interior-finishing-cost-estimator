import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';


@ArgsType()
export class InquiryDeleteFormData {

    @Field()
    @IsMongoId()
    inquiryId!: string;

}
